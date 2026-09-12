/**
 * Summary reporter — F0015 (US00146).
 *
 * Prints the usable/dropped deal groups plus a footer, mirroring
 * `scripts/ingest/report.ts`'s "requested N, ingested M" shape. The exit
 * code stays 0 on a shortfall (Scenario 3) — this module never fails for
 * having fewer deals than requested.
 */

import { formatVnd } from "@/lib/format";
import type { DroppedDeal, RankedDeal } from "./deal";

export interface DealRoundupSummary {
  requested: number;
  deals: RankedDeal[];
  dropped: DroppedDeal[];
  snapshotPath: string;
  query: string;
}

export function printDealSummary(summary: DealRoundupSummary): void {
  const { requested, deals, dropped, snapshotPath, query } = summary;

  console.log(`\nDeals (${deals.length} of ${requested} requested):`);
  for (const d of deals) {
    console.log(
      `  ${d.rank}. ${d.name} — ${formatVnd(d.priceVnd)} (-${d.discountPercent}%), ` +
        `${d.rating}★, ${d.soldCount} đã bán`,
    );
  }

  console.log(`\nDropped (${dropped.length}):`);
  for (const d of dropped) {
    console.log(`  ! deal#${d.rank} — ${d.name}: ${d.reason}`);
  }

  console.log(
    `\nsnapshot ${snapshotPath} · keyword "${query}" · requested ${requested}, usable ${deals.length}`,
  );
}
