/**
 * Ingestion CLI entry point — F0012 (US00121).
 *
 * Skeleton pipeline: parse args → preflight category → load candidates
 * (temporary in-memory stub; replaced by the scrape/file adapters in
 * US00124/US00125) → validate each → write fixtures (unless --dry-run) →
 * print summary.
 *
 * Run via `npm run ingest:products -- --category=<slug> --source=<name>
 * [--dry-run]`.
 */

import { assertCategoryRegistered } from "@/lib/categories";
import { parseIngestArgs, type IngestArgs } from "./ingest/args";
import type { AcceptedCandidate, Candidate, Rejection } from "./ingest/candidate";
import { buildSummary, printSummary } from "./ingest/report";
import { validateCandidate } from "./ingest/validate";
import { writeFixture } from "./ingest/writer";

/**
 * Naive placeholder slugifier (US00121 only). No diacritics-stripping
 * guarantees, no dedupe — the canonical slugifier lands in US00122. Used
 * here only to name candidates in chokepoint error messages and summaries.
 */
function naiveSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Temporary in-memory stub source (replaces nothing yet — US00124/US00125
 * slot their real adapters in behind this same `loadCandidates` seam). One
 * valid and one intentionally invalid candidate so the full accept/reject
 * path is exercisable end-to-end before real sources exist.
 */
async function loadCandidates(args: IngestArgs): Promise<Candidate[]> {
  return Promise.resolve([
    {
      name: "Chuột Gaming Mẫu Demo",
      brand: "DemoBrand",
      price: 199000,
      affiliateUrl: "https://shope.ee/demo-ingest-1",
      description: "Sản phẩm mẫu để kiểm thử pipeline nhập liệu.",
      specs: { DPI: "800-3200" },
      imageUrls: ["/static/images/products/placeholder.jpg"],
      category: args.category,
      sourceRef: `${args.source}#1`,
    },
    {
      name: "Sản Phẩm Thiếu Giá",
      brand: "DemoBrand",
      price: Number.NaN,
      affiliateUrl: "https://shope.ee/demo-ingest-2",
      description: "Ứng viên cố ý thiếu trường price để kiểm thử rejection.",
      specs: { DPI: "800-3200" },
      imageUrls: ["/static/images/products/placeholder.jpg"],
      category: args.category,
      sourceRef: `${args.source}#2`,
    },
  ]);
}

async function main(): Promise<void> {
  let args: IngestArgs;
  try {
    args = parseIngestArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`[ingest] ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
    return;
  }

  try {
    assertCategoryRegistered(args.category, "<preflight>");
  } catch (err) {
    console.error(`[ingest] ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
    return;
  }

  const candidates = await loadCandidates(args);

  const added: AcceptedCandidate[] = [];
  const rejected: Rejection[] = [];
  const skippedDuplicate: Rejection[] = []; // dedupe lands in US00122

  for (const candidate of candidates) {
    const provisionalSlug = naiveSlug(candidate.name);
    const rejection = validateCandidate(candidate, provisionalSlug);
    if (rejection) {
      rejected.push(rejection);
      continue;
    }

    const accepted: AcceptedCandidate = {
      ...candidate,
      slug: provisionalSlug,
      images: candidate.imageUrls, // real staging lands in US00123
    };

    if (!args.dryRun) {
      writeFixture(accepted);
    }
    added.push(accepted);
  }

  printSummary(buildSummary(candidates.length, added, skippedDuplicate, rejected));
}

main().catch((err) => {
  console.error(`[ingest] unexpected error: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
