/**
 * Deal sidecar loader — F0015 (US00152), decision D2.
 *
 * Roundup deals are persisted as a per-post sidecar
 * `content/deals/<post-slug>.json` — never as `content/products/*.json`
 * fixtures, which would re-impose the `brand`/`specs` requirement this
 * feature exists to route around. No file outside this module may read or
 * parse a sidecar.
 *
 * Same fail-loudly discipline `lib/products.ts` applies to fixtures: a
 * hand-edited sidecar with a bad affiliate host, an unregistered category, or
 * a remote image fails `next build` naming the offending deal id.
 *
 * Memoised per directory (same shape as `lib/image-meta.ts`'s per-path
 * memo) — `getDealById` is called once per `<DealCard>` embed during MDX
 * evaluation and would otherwise re-read the directory each time. Keying by
 * directory (rather than a single flat cache) also gives tests directory
 * isolation for free via `GetDealsOptions.dealsDir`.
 */

import fs from "node:fs";
import path from "node:path";
import type { Deal } from "@/types";
import { assertAffiliateUrl } from "@/lib/affiliate";
import { assertCategoryRegistered } from "@/lib/categories";

const DEFAULT_DEALS_DIR = path.join(process.cwd(), "content", "deals");

export interface GetDealsOptions {
  /** Override the deals directory — tests point this at a fixture dir. */
  dealsDir?: string;
}

const cache = new Map<string, Deal[]>();

const REQUIRED_STRINGS: (keyof Deal)[] = ["id", "name", "image", "affiliateUrl", "category"];
const REQUIRED_NUMBERS: (keyof Deal)[] = [
  "priceVnd",
  "originalPriceVnd",
  "discountPercent",
  "rating",
  "soldCount",
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateDeal(
  data: unknown,
  filePath: string,
  fileBasename: string,
  seenIds: Map<string, string>,
): Deal {
  if (typeof data !== "object" || data === null) {
    throw new Error(`[content] ${filePath}: deal entry is not a valid JSON object.`);
  }
  const obj = data as Record<string, unknown>;

  for (const field of REQUIRED_STRINGS) {
    if (typeof obj[field] !== "string" || (obj[field] as string).trim() === "") {
      throw new Error(
        `[content] ${filePath}: missing or invalid required string field "${field}".`,
      );
    }
  }

  for (const field of REQUIRED_NUMBERS) {
    if (typeof obj[field] !== "number" || !Number.isFinite(obj[field] as number)) {
      throw new Error(
        `[content] ${filePath}: missing or invalid required number field "${field}".`,
      );
    }
  }

  const id = obj.id as string;

  const existingFile = seenIds.get(id);
  if (existingFile) {
    throw new Error(
      `[content] Duplicate deal id "${id}" found in:\n` +
        `  - ${existingFile}\n` +
        `  - ${filePath}\n` +
        `Deal ids must be unique across all sidecars.`,
    );
  }
  seenIds.set(id, filePath);

  const idPattern = new RegExp(`^${escapeRegExp(fileBasename)}-\\d+$`);
  if (!idPattern.test(id)) {
    throw new Error(
      `[content] ${filePath}: deal id "${id}" must match "${fileBasename}-<n>" — its own file's basename.`,
    );
  }

  try {
    assertAffiliateUrl(obj.affiliateUrl as string, id);
  } catch (err) {
    throw new Error(`[content] ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
  }

  const image = obj.image as string;
  if (!image.startsWith("/static/")) {
    throw new Error(
      `[content] ${filePath}: deal "${id}" image "${image}" must be a root-relative ` +
        `"/static/..." path — remote URLs are never allowed.`,
    );
  }

  try {
    assertCategoryRegistered(obj.category as string, id);
  } catch (err) {
    throw new Error(`[content] ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
  }

  return data as Deal;
}

function loadAll(dealsDir: string): Deal[] {
  if (!fs.existsSync(dealsDir)) {
    return [];
  }

  const files = fs.readdirSync(dealsDir).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    return [];
  }

  const deals: Deal[] = [];
  const seenIds = new Map<string, string>();

  for (const file of files) {
    const filePath = path.join(dealsDir, file);
    const fileBasename = path.basename(file, ".json");

    let raw: string;
    try {
      raw = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      throw new Error(`[content] ${filePath}: unable to read file. ${err}`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(`[content] ${filePath}: invalid JSON. ${err}`);
    }

    if (!Array.isArray(parsed)) {
      throw new Error(`[content] ${filePath}: must contain a JSON array of deals.`);
    }

    for (const entry of parsed) {
      deals.push(validateDeal(entry, filePath, fileBasename, seenIds));
    }
  }

  return deals;
}

export function getAllDeals(opts: GetDealsOptions = {}): Deal[] {
  const dealsDir = opts.dealsDir ?? DEFAULT_DEALS_DIR;
  const cached = cache.get(dealsDir);
  if (cached) return cached;

  const deals = loadAll(dealsDir);
  cache.set(dealsDir, deals);
  return deals;
}

export function getDealById(id: string, opts: GetDealsOptions = {}): Deal | null {
  return getAllDeals(opts).find((d) => d.id === id) ?? null;
}

/** Deals for one post's sidecar, in id order (`<post-slug>-1`, `-2`, …). */
export function getDealsForPost(postSlug: string, opts: GetDealsOptions = {}): Deal[] {
  return getAllDeals(opts)
    .filter((d) => d.id.startsWith(`${postSlug}-`))
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

/** A post's existence-of-sidecar check — the one thing that marks it a roundup. */
export function postHasDeals(postSlug: string, opts: GetDealsOptions = {}): boolean {
  return getDealsForPost(postSlug, opts).length > 0;
}
