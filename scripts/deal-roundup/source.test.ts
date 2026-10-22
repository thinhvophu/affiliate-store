import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DealRoundupArgs } from "./args";
import { dealKey } from "./history";
import { loadRankedDeals } from "./source";

const FIXTURE = path.join(__dirname, "__fixtures__", "deals-sample.json");

function args(overrides: Partial<DealRoundupArgs> = {}): DealRoundupArgs {
  return {
    category: "chuot-gaming",
    query: "chuột gaming",
    top: 5,
    repeatWindow: 3,
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

  it("cleans RankedDeal.name and keeps the seller title as rawName", () => {
    const raw = JSON.parse(fs.readFileSync(FIXTURE, "utf-8"));
    raw.results[0].deals[0].name = "[HOT] Chuột Logitech G102 Lightsync | Freeship | BH 12 tháng!";
    fs.writeFileSync(path.join(dealsDir, "2026-09-01.json"), JSON.stringify(raw));

    const [first] = loadRankedDeals(args({ top: 1 }), { dealsDir }).deals;

    expect(first.name).toBe("Chuột Logitech G102 Lightsync");
    expect(first.rawName).toBe("[HOT] Chuột Logitech G102 Lightsync | Freeship | BH 12 tháng!");
  });

  it("drops a deal whose name is empty after cleaning, naming the reason, and it is not usable", () => {
    const raw = JSON.parse(fs.readFileSync(FIXTURE, "utf-8"));
    raw.results[0].deals[1].name = "【Freeship】";
    fs.writeFileSync(path.join(dealsDir, "2026-09-01.json"), JSON.stringify(raw));

    const result = loadRankedDeals(args({ top: 3 }), { dealsDir });

    expect(result.deals.map((d) => d.rank)).toEqual([1, 3]);
    expect(result.dropped.find((d) => d.rank === 2)?.reason).toMatch(
      /name empty after removing seller boilerplate/,
    );
  });
});

describe("loadRankedDeals recency skipping", () => {
  function writeTenDeals(mutate?: (deals: Record<string, unknown>[]) => void) {
    const raw = JSON.parse(fs.readFileSync(FIXTURE, "utf-8"));
    const template = raw.results[0].deals[0];
    const deals = Array.from({ length: 10 }, (_, i) => ({
      ...template,
      itemId: 200 + i,
      shopId: 20 + i,
      name: `Chuột Gaming Mẫu ${i + 1}`,
      affiliateUrl: `https://s.shopee.vn/ten-${i + 1}`,
      score: 100 - ((i * 37) % 11),
    }));
    mutate?.(deals);
    raw.results[0].deals = deals;
    fs.writeFileSync(path.join(dealsDir, "2026-09-01.json"), JSON.stringify(raw));
  }
  const keyOf = (rank: number) => dealKey({ itemId: 200 + rank - 1, shopId: 20 + rank - 1 });

  it("skips recent deals and backfills in tool order (S1)", () => {
    writeTenDeals();
    const result = loadRankedDeals(args({ top: 5 }), {
      dealsDir,
      recent: new Set([keyOf(1), keyOf(3)]),
    });

    expect(result.deals.map((d) => d.rank)).toEqual([2, 4, 5, 6, 7]);
    expect(result.skippedRecent.map((d) => d.rank)).toEqual([1, 3]);
    expect(result.skippedRecent[0].name).toBe("Chuột Gaming Mẫu 1");
  });

  it("carries itemId and shopId onto RankedDeal", () => {
    writeTenDeals();
    const [first] = loadRankedDeals(args({ top: 1 }), { dealsDir }).deals;
    expect(first.itemId).toBe(200);
    expect(first.shopId).toBe(20);
  });

  it("returns what is left when nearly everything is recent, without throwing (S3)", () => {
    writeTenDeals();
    const recent = new Set([1, 2, 3, 4, 5, 6, 7, 8].map(keyOf));
    const result = loadRankedDeals(args({ top: 5 }), { dealsDir, recent });

    expect(result.deals.map((d) => d.rank)).toEqual([9, 10]);
    expect(result.skippedRecent).toHaveLength(8);
  });

  it("does not backfill deals dropped for a bad affiliate link", () => {
    writeTenDeals((deals) => {
      deals[1].affiliateUrl = null;
    });
    const result = loadRankedDeals(args({ top: 3 }), { dealsDir, recent: new Set([keyOf(1)]) });

    expect(result.deals.map((d) => d.rank)).toEqual([3, 4]);
    expect(result.dropped.map((d) => d.rank)).toEqual([2]);
  });

  it("drops a deal with no itemId/shopId, with the reason (§5)", () => {
    writeTenDeals((deals) => {
      delete deals[0].itemId;
    });
    const result = loadRankedDeals(args({ top: 2 }), { dealsDir });

    expect(result.dropped.find((d) => d.rank === 1)?.reason).toMatch(/no itemId\/shopId/);
    expect(result.deals.map((d) => d.rank)).toEqual([2, 3]);
  });

  it("skips nothing when no recent set is given", () => {
    writeTenDeals();
    const result = loadRankedDeals(args({ top: 5 }), { dealsDir });
    expect(result.skippedRecent).toEqual([]);
    expect(result.deals.map((d) => d.rank)).toEqual([1, 2, 3, 4, 5]);
  });
});
