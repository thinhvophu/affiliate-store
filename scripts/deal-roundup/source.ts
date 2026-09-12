/**
 * Ranked-deal source adapter — F0015 (US00146), decision D1.
 *
 * Reads the `data/deals/<date>.json` snapshot already produced out-of-band
 * by the shopee-affiliate scrape tool (identical split to `--source=scrape`,
 * US00124 D1) — this Node process never invokes that tool itself; the file
 * is the contract. The MCP call lives in the `/deal-roundup` slash command
 * (US00149).
 *
 * `parseDealsSnapshot` / `RawDeal` are imported from
 * `scripts/ingest/sources/deal-schema.ts`, the one place that owns the
 * scrape tool's output shape for both pipelines — never copy the types.
 */

import fs from "node:fs";
import path from "node:path";
import { assertAffiliateUrl } from "@/lib/affiliate";
import { parseDealsSnapshot, type RawDeal } from "../ingest/sources/deal-schema";
import type { DealRoundupArgs } from "./args";
import type { DroppedDeal, RankedDeal } from "./deal";

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface LoadRankedDealsOptions {
  /** Override the deals directory — tests point this at a fixture dir. */
  dealsDir?: string;
}

export interface LoadRankedDealsResult {
  deals: RankedDeal[];
  dropped: DroppedDeal[];
  /** What --top asked for. `deals.length` may legitimately be lower (Scenario 3). */
  requested: number;
  /** Absolute path of the snapshot actually read — echoed in the summary for auditability. */
  snapshotPath: string;
}

function toRankedDeal(deal: RawDeal, rank: number): RankedDeal {
  return {
    rank,
    name: deal.name,
    priceVnd: deal.priceVnd,
    originalPriceVnd: deal.originalPriceVnd,
    discountPercent: deal.discountPercent,
    rating: deal.rating,
    soldCount: deal.soldCount,
    shopLocation: deal.shopLocation,
    isOfficialShop: deal.isOfficialShop,
    isFreeShipping: deal.isFreeShipping,
    imageUrl: deal.imageUrl,
    affiliateUrl: deal.affiliateUrl ?? "",
    score: deal.score,
  };
}

export function loadRankedDeals(
  args: DealRoundupArgs,
  opts: LoadRankedDealsOptions = {},
): LoadRankedDealsResult {
  const date = args.date ?? isoToday();
  const dealsDir = opts.dealsDir ?? path.join(process.cwd(), "data", "deals");
  const file = path.join(dealsDir, `${date}.json`);

  if (!fs.existsSync(file)) {
    throw new Error(
      `deal-roundup source: no deals file at ${file}. Run the shopee-affiliate scrape tool first.`,
    );
  }

  const snapshot = parseDealsSnapshot(JSON.parse(fs.readFileSync(file, "utf-8")), file);
  const matched = snapshot.results.find((r) => r.keyword.trim() === args.query.trim());
  const rawDeals = matched?.deals ?? [];

  // Take the tool's top N in the tool's own order. No sort, no filter, no
  // re-scoring — the tool's rankDeals() output order is authoritative
  // (spec §2 Out of Scope, Scenario 1). Do not "improve" this into a sort.
  const capped = rawDeals.slice(0, args.top);

  const deals: RankedDeal[] = [];
  const dropped: DroppedDeal[] = [];

  capped.forEach((raw, i) => {
    const rank = i + 1;
    if (!raw.affiliateUrl) {
      dropped.push({
        rank,
        name: raw.name,
        reason: "no affiliate link resolved by the scrape tool",
      });
      return;
    }

    try {
      assertAffiliateUrl(raw.affiliateUrl, `deal#${rank}`);
    } catch (e) {
      dropped.push({ rank, name: raw.name, reason: (e as Error).message });
      return;
    }

    deals.push(toRankedDeal(raw, rank));
  });

  return { deals, dropped, requested: args.top, snapshotPath: file };
}
