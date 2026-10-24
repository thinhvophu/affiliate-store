import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  dealKey,
  readHistory,
  recentKeys,
  recordRun,
  writeHistory,
  type DealHistory,
} from "./history";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "deal-history-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

const k = (itemId: number, shopId = 1) => ({ itemId, shopId });

function history(): DealHistory {
  return {
    category: "chuot-gaming",
    runs: [
      { date: "2026-10-01", items: [k(1)] },
      { date: "2026-10-05", items: [k(2)] },
      { date: "2026-10-12", items: [k(3)] },
      { date: "2026-10-19", items: [k(4)] },
    ],
  };
}

describe("readHistory", () => {
  it("returns an empty history when the file is missing", () => {
    expect(readHistory("chuot-gaming", dir)).toEqual({ category: "chuot-gaming", runs: [] });
  });

  it("round-trips through writeHistory", () => {
    writeHistory(history(), dir);
    expect(readHistory("chuot-gaming", dir)).toEqual(history());
  });

  it("throws naming the path on malformed JSON", () => {
    const file = path.join(dir, "chuot-gaming.json");
    fs.writeFileSync(file, "{ nope");
    expect(() => readHistory("chuot-gaming", dir)).toThrow(file);
  });

  it("throws when the category does not match the file name", () => {
    const file = path.join(dir, "chuot-gaming.json");
    fs.writeFileSync(file, JSON.stringify({ category: "tai-nghe", runs: [] }));
    expect(() => readHistory("chuot-gaming", dir)).toThrow(file);
  });

  it("throws on a malformed run date or non-numeric ids", () => {
    const file = path.join(dir, "chuot-gaming.json");
    fs.writeFileSync(
      file,
      JSON.stringify({ category: "chuot-gaming", runs: [{ date: "10/12", items: [] }] }),
    );
    expect(() => readHistory("chuot-gaming", dir)).toThrow(file);
    fs.writeFileSync(
      file,
      JSON.stringify({
        category: "chuot-gaming",
        runs: [{ date: "2026-10-12", items: [{ itemId: "x", shopId: 1 }] }],
      }),
    );
    expect(() => readHistory("chuot-gaming", dir)).toThrow(file);
  });
});

describe("recentKeys", () => {
  it("collects the last N runs dated before today", () => {
    const keys = recentKeys(history(), 2, "2026-10-26");
    expect(keys).toEqual(new Set([dealKey(k(3)), dealKey(k(4))]));
  });

  it("leaves out today's own entry (S4)", () => {
    const h = recordRun(history(), "2026-10-26", [k(9)]);
    const keys = recentKeys(h, 3, "2026-10-26");
    expect(keys.has(dealKey(k(9)))).toBe(false);
    expect(keys).toEqual(new Set([dealKey(k(2)), dealKey(k(3)), dealKey(k(4))]));
  });

  it("returns an empty set for a window of 0 (S5)", () => {
    expect(recentKeys(history(), 0, "2026-10-26").size).toBe(0);
  });
});

describe("recordRun", () => {
  it("appends and keeps runs sorted by date", () => {
    const h = recordRun(history(), "2026-10-03", [k(7)]);
    expect(h.runs.map((r) => r.date)).toEqual([
      "2026-10-01",
      "2026-10-03",
      "2026-10-05",
      "2026-10-12",
      "2026-10-19",
    ]);
  });

  it("replaces an entry for the same date, keeping the run count (S4)", () => {
    const h = recordRun(history(), "2026-10-19", [k(8)]);
    expect(h.runs).toHaveLength(4);
    expect(h.runs[3]).toEqual({ date: "2026-10-19", items: [k(8)] });
  });

  it("does not mutate its input", () => {
    const before = history();
    recordRun(before, "2026-10-26", [k(9)]);
    expect(before).toEqual(history());
  });
});
