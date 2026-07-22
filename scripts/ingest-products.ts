/**
 * Ingestion CLI entry point — F0012 (US00121, US00122, US00123, US00124).
 *
 * Pipeline: parse args → preflight category → load candidates
 * (`--source=scrape` → `loadScrapeCandidates`; any other source → an
 * in-memory stub until US00125's `file` adapter lands) → validate + slugify
 * + dedupe/classify each → stage images locally (unless --dry-run; a
 * staging failure rejects the candidate) → write fixtures (unless
 * --dry-run) → print summary.
 *
 * Run via `npm run ingest:products -- --category=<slug> --source=<name>
 * [--dry-run]`.
 */

import { assertCategoryRegistered } from "@/lib/categories";
import { parseIngestArgs, type IngestArgs } from "./ingest/args";
import type { AcceptedCandidate, Candidate, Rejection } from "./ingest/candidate";
import { buildCatalogIndex, classify, registerAccepted } from "./ingest/dedupe";
import { stageImages } from "./ingest/images";
import { buildSummary, printSummary } from "./ingest/report";
import { loadScrapeCandidates } from "./ingest/sources/scrape";
import { slugifyProductName } from "./ingest/slug";
import { validateCandidate } from "./ingest/validate";
import { writeFixture } from "./ingest/writer";

/**
 * Temporary in-memory stub source for any `--source` other than `scrape`
 * (US00125's `file` adapter slots in behind this same seam). One valid and
 * one intentionally invalid candidate so the full accept/reject path is
 * exercisable end-to-end before that source exists.
 */
async function loadStubCandidates(args: IngestArgs): Promise<Candidate[]> {
  return Promise.resolve([
    {
      name: "Chuột Gaming Mẫu Demo",
      brand: "DemoBrand",
      price: 199000,
      affiliateUrl: "https://shope.ee/demo-ingest-1",
      description: "Sản phẩm mẫu để kiểm thử pipeline nhập liệu.",
      specs: { DPI: "800-3200" },
      imageUrls: ["https://placehold.co/600x400.jpg"],
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
      imageUrls: ["https://placehold.co/600x400.jpg"],
      category: args.category,
      sourceRef: `${args.source}#2`,
    },
  ]);
}

function loadCandidates(args: IngestArgs): Promise<Candidate[]> {
  if (args.source === "scrape") {
    return loadScrapeCandidates(args);
  }
  return loadStubCandidates(args);
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

    let images = candidate.imageUrls; // dry-run: staging skipped entirely (D9)
    if (!args.dryRun) {
      const staged = await stageImages(candidate, result.slug);
      if ("reason" in staged) {
        rejected.push(staged);
        continue;
      }
      images = staged.images;
    }

    const accepted: AcceptedCandidate = {
      ...candidate,
      slug: result.slug,
      images,
      needsReview: result.kind === "collision",
    };
    registerAccepted(catalogIndex, candidate.affiliateUrl, result.slug);

    if (!args.dryRun) {
      writeFixture(accepted);
    }
    added.push(accepted);
  }

  // `--count` (when set, e.g. --source=scrape) is the operator's actual ask;
  // candidates.length may already be short of it if fewer deals matched than
  // requested (US00124 Scenario 3) — report the true shortfall, not just
  // how many candidates happened to be loaded.
  printSummary(buildSummary(args.count ?? candidates.length, added, skippedDuplicate, rejected));
}

main().catch((err) => {
  console.error(`[ingest] unexpected error: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
