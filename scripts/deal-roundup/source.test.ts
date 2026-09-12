import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DealRoundupArgs } from "./args";
import { loadRankedDeals } from "./source";

const FIXTURE = path.join(__dirname, "__fixtures__", "deals-sample.json");

function args(overrides: Partial<DealRoundupArgs> = {}): DealRoundupArgs {
  return {
    category: "chuot-gaming",
    query: "chuột gaming",
    top: 5,
    date: "2026-09-01",
    dryRun: false,
    ...overrides,
  };
}

let dealsDir: string;

beforeEach(() => {
  dealsDir = fs.mkdtempSync(path.join(os.tmpdir(), "deal-roundup-source-"));
  fs.copyFileSync(FIXTURE, path.join(dealsDir, "2026-09-01.json"));
});

afterEach(() => {
  fs.rmSync(dealsDir, { recursive: true, force: true });
});

describe("loadRankedDeals", () => {
  it("returns the top N deals in snapshot order", () => {
    const result = loadRankedDeals(args({ top: 3 }), { dealsDir });

    expect(result.deals).toHaveLength(3);
    expect(result.deals.map((d) => d.rank)).toEqual([1, 2, 3]);
  });

  it("never re-sorts by score — order matches the file, not descending score", () => {
    const result = loadRankedDeals(args({ top: 3 }), { dealsDir });

    // Fixture scores are deliberately non-monotonic: 80, 200, 50.
    expect(result.deals.map((d) => d.score)).toEqual([80, 200, 50]);
  });

  it("drops a deal with affiliateUrl: null, naming the reason, while keeping the rest", () => {
    const result = loadRankedDeals(args({ top: 5 }), { dealsDir });

    const nullDrop = result.dropped.find((d) => d.rank === 4);
    expect(nullDrop?.reason).toMatch(/no affiliate link/);
  });

  it("drops a deal with a disallowed affiliate host, naming the host, while keeping the rest", () => {
    const result = loadRankedDeals(args({ top: 5 }), { dealsDir });

    const badHostDrop = result.dropped.find((d) => d.rank === 5);
    expect(badHostDrop?.reason).toMatch(/malicious-host\.example\.com/);
    expect(badHostDrop?.reason).toMatch(/allowed/);
  });

  it("reports a shortfall without throwing when fewer deals are usable than requested", () => {
    const result = loadRankedDeals(args({ top: 5 }), { dealsDir });

    expect(result.deals).toHaveLength(3);
    expect(result.requested).toBe(5);
    expect(result.dropped).toHaveLength(2);
  });

  it("returns an empty deals array, no throw, when the keyword isn't in the snapshot", () => {
    const result = loadRankedDeals(args({ query: "tai nghe gaming" }), { dealsDir });

    expect(result.deals).toEqual([]);
    expect(result.dropped).toEqual([]);
  });

  it("throws naming the expected path when the deals file is missing", () => {
    expect(() => loadRankedDeals(args({ date: "2026-01-01" }), { dealsDir })).toThrow(
      /2026-01-01\.json/,
    );
  });

  it("throws a clear message on a malformed deals file", () => {
    fs.writeFileSync(
      path.join(dealsDir, "2026-02-02.json"),
      JSON.stringify({ date: "2026-02-02" }),
    );

    expect(() => loadRankedDeals(args({ date: "2026-02-02" }), { dealsDir })).toThrow(
      /"results" must be an array/,
    );
  });
});
