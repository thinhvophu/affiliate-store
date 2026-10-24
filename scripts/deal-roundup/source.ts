/**
 * Ranked-deal source adapter — F0015 (US00151), decision D1.
 *
 * Reads the `data/deals/<date>.json` snapshot already produced out-of-band
 * by the shopee-affiliate scrape tool (identical split to `--source=scrape`,
 * US00124 D1) — this Node process never invokes that tool itself; the file
 * is the contract. The MCP call lives in the `/deal-roundup` slash command
 * (US00154).
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
import { cleanDealName } from "./clean-name";
import type { DroppedDeal, RankedDeal, SkippedDeal } from "./deal";
import { dealKey } from "./history";

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface LoadRankedDealsOptions {
  /** Override the deals directory — tests point this at a fixture dir. */
  dealsDir?: string;
  /** `dealKey()`s featured in recent runs (history.ts `recentKeys`) — skipped, not backfilled from drops. */
  recent?: Set<string>;
}

export interface LoadRankedDealsResult {
  deals: RankedDeal[];
  dropped: DroppedDeal[];
  /** Deals skipped because a recent run already featured them. */
  skippedRecent: SkippedDeal[];
  /** What --top asked for. `deals.length` may legitimately be lower (Scenario 3). */
  requested: number;
  /** Absolute path of the snapshot actually read — echoed in the summary for auditability. */
  snapshotPath: string;
}

function toRankedDeal(deal: RawDeal, rank: number, name: string): RankedDeal {
  return {
    rank,
    name,
    rawName: deal.name,
    priceVnd: deal.priceVnd,
    originalPriceVnd: deal.originalPriceVnd,
    discountPercent: deal.discountPercent,
    rating: deal.rating,
    soldCount: deal.soldCount,
    itemId: deal.itemId,
    shopId: deal.shopId,
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

  // Walk the tool's list in its own order — never sort or score (spec §2
  // Out of Scope, Scenario 1). Skipping only removes items: a recent deal, or
  // one with no itemId/shopId (untrackable), is passed over and the next
  // deal fills the slot (US00165 D4). Later per-deal drops are not backfilled.
  const recent = opts.recent ?? new Set<string>();
  const deals: RankedDeal[] = [];
  const dropped: DroppedDeal[] = [];
  const skippedRecent: SkippedDeal[] = [];
  const eligible: { raw: RawDeal; rank: number }[] = [];

  for (const [i, raw] of rawDeals.entries()) {
    if (eligible.length === args.top) break;
    const rank = i + 1;
    if (!Number.isFinite(raw.itemId) || !Number.isFinite(raw.shopId)) {
      dropped.push({ rank, name: raw.name, reason: "no itemId/shopId to track recency" });
      continue;
    }
    if (recent.has(dealKey(raw))) {
      skippedRecent.push({ rank, name: raw.name });
      continue;
    }
    eligible.push({ raw, rank });
  }

  for (const { raw, rank } of eligible) {
    if (!raw.affiliateUrl) {
      dropped.push({
        rank,
        name: raw.name,
        reason: "no affiliate link resolved by the scrape tool",
      });
      continue;
    }

    try {
      assertAffiliateUrl(raw.affiliateUrl, `deal#${rank}`);
    } catch (e) {
      dropped.push({ rank, name: raw.name, reason: (e as Error).message });
      continue;
    }

    const name = cleanDealName(raw.name);
    if (!name) {
      dropped.push({
        rank,
        name: raw.name,
        reason: "name empty after removing seller boilerplate",
      });
      continue;
    }

    deals.push(toRankedDeal(raw, rank, name));
  }

  return { deals, dropped, skippedRecent, requested: args.top, snapshotPath: file };
}
