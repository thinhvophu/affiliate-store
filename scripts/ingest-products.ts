/**
 * Ingestion CLI entry point — F0012 (US00121, US00122).
 *
 * Pipeline: parse args → preflight category → load candidates (temporary
 * in-memory stub; replaced by the scrape/file adapters in US00124/US00125)
 * → validate + slugify + dedupe/classify each → write fixtures (unless
 * --dry-run) → print summary.
 *
 * Run via `npm run ingest:products -- --category=<slug> --source=<name>
 * [--dry-run]`.
 */

import { assertCategoryRegistered } from "@/lib/categories";
import { parseIngestArgs, type IngestArgs } from "./ingest/args";
import type { AcceptedCandidate, Candidate, Rejection } from "./ingest/candidate";
import { buildCatalogIndex, classify, registerAccepted } from "./ingest/dedupe";
import { buildSummary, printSummary } from "./ingest/report";
import { slugifyProductName } from "./ingest/slug";
import { validateCandidate } from "./ingest/validate";
import { writeFixture } from "./ingest/writer";

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
  const catalogIndex = buildCatalogIndex();

  const added: AcceptedCandidate[] = [];
  const rejected: Rejection[] = [];
  const skippedDuplicate: Rejection[] = [];

  for (const candidate of candidates) {
    const baseSlug = slugifyProductName(candidate.name);
    if (baseSlug === "") {
      rejected.push({
        ref: candidate.sourceRef,
        name: candidate.name || candidate.sourceRef,
        reason: `name "${candidate.name}" does not produce a valid slug`,
      });
      continue;
    }

    const rejection = validateCandidate(candidate, baseSlug);
    if (rejection) {
      rejected.push(rejection);
      continue;
    }

    const result = classify(candidate.affiliateUrl, baseSlug, catalogIndex);
    if (result.kind === "duplicate") {
      skippedDuplicate.push({
        ref: candidate.sourceRef,
        name: candidate.name,
        reason: `affiliateUrl already ingested as "${result.slug}"`,
      });
      continue;
    }

    const accepted: AcceptedCandidate = {
      ...candidate,
      slug: result.slug,
      images: candidate.imageUrls, // real staging lands in US00123
      needsReview: result.kind === "collision",
    };
    registerAccepted(catalogIndex, candidate.affiliateUrl, result.slug);

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
