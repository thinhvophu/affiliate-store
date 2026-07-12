/**
 * Summary reporter — F0012 (US00121, US00122). Decisions D7/D9.
 *
 * Prints labelled groups (added / disambiguated-needs-review / skipped-
 * duplicate / rejected) plus a footer line, so a human can review the run
 * before committing generated fixtures. "Disambiguated" is a subset of
 * "added" — those items were written under a `-2`/`-3`… slug after a
 * collision (D7) and are called out separately so they don't blend into an
 * otherwise-clean run.
 */

import type { AcceptedCandidate, Rejection } from "./candidate";

export interface IngestSummary {
  requested: number;
  added: AcceptedCandidate[];
  skippedDuplicate: Rejection[];
  rejected: Rejection[];
  /** requested minus added.length — how many candidates did not make it in. */
  shortfall: number;
}

export function buildSummary(
  requested: number,
  added: AcceptedCandidate[],
  skippedDuplicate: Rejection[],
  rejected: Rejection[],
): IngestSummary {
  return {
    requested,
    added,
    skippedDuplicate,
    rejected,
    shortfall: requested - added.length,
  };
}

export function printSummary(summary: IngestSummary): void {
  console.log(`\nAdded (${summary.added.length}):`);
  for (const c of summary.added) {
    console.log(`  + ${c.slug} — ${c.name}`);
  }

  const needsReview = summary.added.filter((c) => c.needsReview);
  console.log(`\nDisambiguated - needs review (${needsReview.length}):`);
  for (const c of needsReview) {
    console.log(`  ? ${c.slug} — ${c.name} (slug collision, verify this isn't a duplicate)`);
  }

  console.log(`\nSkipped - duplicate (${summary.skippedDuplicate.length}):`);
  for (const s of summary.skippedDuplicate) {
    console.log(`  ~ ${s.ref} — ${s.name}: ${s.reason}`);
  }

  console.log(`\nRejected (${summary.rejected.length}):`);
  for (const r of summary.rejected) {
    console.log(`  ! ${r.ref} — ${r.name}: ${r.reason}`);
  }

  console.log(
    `\nrequested ${summary.requested}, ingested ${summary.added.length}, ` +
      `skipped ${summary.skippedDuplicate.length}, rejected ${summary.rejected.length}`,
  );
}
