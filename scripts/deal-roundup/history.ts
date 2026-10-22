/**
 * Featured-deal history — F0016 (US00165).
 *
 * `data/deal-history/<category>.json` records which deals each roundup run
 * actually featured, so the next run can skip repeats. Committed next to
 * `data/deals/` (what the tool returned) as the record of what we published.
 */

import fs from "node:fs";
import path from "node:path";

const DEFAULT_HISTORY_DIR = path.join(process.cwd(), "data", "deal-history");
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface DealKey {
  itemId: number;
  shopId: number;
}

export interface DealHistory {
  category: string;
  runs: { date: string; items: DealKey[] }[];
}

export function dealKey(k: DealKey): string {
  return `${k.shopId}:${k.itemId}`;
}

function historyPath(category: string, dir: string): string {
  return path.join(dir, `${category}.json`);
}

function parseHistory(data: unknown, category: string, file: string): DealHistory {
  const fail = (why: string): never => {
    throw new Error(`deal-history: ${file}: ${why}`);
  };
  if (typeof data !== "object" || data === null) return fail("not a JSON object");
  const obj = data as Record<string, unknown>;
  if (obj.category !== category) {
    return fail(`category "${String(obj.category)}" does not match file name "${category}"`);
  }
  if (!Array.isArray(obj.runs)) return fail('"runs" must be an array');

  const runs = obj.runs.map((run: unknown, i) => {
    const r = run as { date?: unknown; items?: unknown };
    if (typeof r?.date !== "string" || !DATE_RE.test(r.date)) {
      return fail(`runs[${i}].date must be "YYYY-MM-DD"`);
    }
    if (!Array.isArray(r.items)) return fail(`runs[${i}].items must be an array`);
    const items = r.items.map((item: unknown, j) => {
      const it = item as { itemId?: unknown; shopId?: unknown };
      if (typeof it?.itemId !== "number" || typeof it?.shopId !== "number") {
        return fail(`runs[${i}].items[${j}] needs numeric itemId and shopId`);
      }
      return { itemId: it.itemId, shopId: it.shopId };
    });
    return { date: r.date, items };
  });

  return { category, runs };
}

export function readHistory(category: string, dir: string = DEFAULT_HISTORY_DIR): DealHistory {
  const file = historyPath(category, dir);
  if (!fs.existsSync(file)) return { category, runs: [] };

  let data: unknown;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (err) {
    throw new Error(
      `deal-history: ${file}: invalid JSON (${err instanceof Error ? err.message : String(err)})`,
    );
  }
  return parseHistory(data, category, file);
}

/** Keys featured in the last `window` runs dated strictly before `today`. */
export function recentKeys(h: DealHistory, window: number, today: string): Set<string> {
  if (window <= 0) return new Set();
  const prior = h.runs.filter((r) => r.date < today).slice(-window);
  return new Set(prior.flatMap((r) => r.items.map(dealKey)));
}

export function recordRun(h: DealHistory, date: string, items: DealKey[]): DealHistory {
  const runs = [...h.runs.filter((r) => r.date !== date), { date, items }].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  return { category: h.category, runs };
}

export function writeHistory(h: DealHistory, dir: string = DEFAULT_HISTORY_DIR): string {
  fs.mkdirSync(dir, { recursive: true });
  const file = historyPath(h.category, dir);
  fs.writeFileSync(file, `${JSON.stringify(h, null, 2)}\n`, "utf-8");
  return file;
}
