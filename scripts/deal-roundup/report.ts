/**
 * Summary reporter — F0015 (US00151).
 *
 * Prints the usable/dropped deal groups plus a footer, mirroring
 * `scripts/ingest/report.ts`'s "requested N, ingested M" shape. The exit
 * code stays 0 on a shortfall (Scenario 3) — this module never fails for
 * having fewer deals than requested.
 */

import { formatVnd } from "@/lib/format";
import type { DroppedDeal, RankedDeal, SkippedDeal } from "./deal";

export interface DealRoundupSummary {
  requested: number;
  deals: RankedDeal[];
  dropped: DroppedDeal[];
  skippedRecent: SkippedDeal[];
  snapshotPath: string;
  query: string;
}

export function printDealSummary(summary: DealRoundupSummary): void {
  const { requested, deals, dropped, skippedRecent, snapshotPath, query } = summary;

  console.log(`\nDeals (${deals.length} of ${requested} requested):`);
  for (const d of deals) {
    const renamed = d.rawName !== d.name ? `${d.rawName} → ` : "";
    console.log(
      `  ${d.rank}. ${renamed}${d.name} — ${formatVnd(d.priceVnd)} (-${d.discountPercent}%), ` +
        `${d.rating}★, ${d.soldCount} đã bán`,
    );
  }

  console.log(`\nDropped (${dropped.length}):`);
  for (const d of dropped) {
    console.log(`  ! deal#${d.rank} — ${d.name}: ${d.reason}`);
  }

  console.log(`\nSkipped as recent (${skippedRecent.length}):`);
  for (const d of skippedRecent) {
    console.log(`  ~ deal#${d.rank} — ${d.name}`);
  }

  console.log(
    `\nsnapshot ${snapshotPath} · keyword "${query}" · requested ${requested}, usable ${deals.length} · skipped as recent: ${skippedRecent.length}`,
  );
}
