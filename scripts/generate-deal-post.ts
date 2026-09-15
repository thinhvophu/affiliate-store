/**
 * Weekly deal-roundup generator CLI — F0015 (US00152).
 *
 * Fetch/validate is US00151's `loadRankedDeals()`; this CLI turns that
 * ranked list into a buildable post with **no `Product` fixture required**
 * (spec §1) — a per-post sidecar (`content/deals/<post-slug>.json`, D2)
 * backs a generated `content/posts/<post-slug>.mdx` stub whose body prose
 * is left for a human to write (D8), exactly as `scaffold:post` does for
 * ordinary buying guides.
 *
 * `generate:deal-post` OVERWRITES both the sidecar and the post on a
 * re-run for the same category+date (D6) — unlike `scaffold:post`, which
 * refuses to overwrite. Because the slug carries the date, "overwrite" is
 * scoped to today's post for this category only.
 *
 * Zero usable deals ⇒ prints the summary, exits 0, writes nothing (spec §5
 * first bullet) — the caller (US00154) reads this as "do not supersede".
 *
 * Run via `npm run generate:deal-post -- --category=<slug> --query=<term>
 * [--top=<1-10>] [--date=YYYY-MM-DD] [--dry-run]`.
 */

import fs from "node:fs";
import path from "node:path";
import { assertCategoryRegistered, getCategoryMeta } from "@/lib/categories";
import { MIN_COVER_IMAGE_SHORT_SIDE_PX, readImageSize } from "@/lib/image-meta";
import type { Deal } from "@/types";
import type { Candidate } from "./ingest/candidate";
import { stageImages } from "./ingest/images";
import { parseDealRoundupArgs } from "./deal-roundup/args";
import { printDealSummary } from "./deal-roundup/report";
import { isoToday, loadRankedDeals } from "./deal-roundup/source";
import { supersedePriorRoundup } from "./deal-roundup/supersede";
import { renderDealPostStub } from "./deal-roundup/template";
import { writeDealSidecar } from "./deal-roundup/writer";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const DEALS_IMAGES_DIR = path.join(process.cwd(), "public", "static", "images", "deals");
const DEALS_PUBLIC_PATH_PREFIX = "/static/images/deals";

async function main(): Promise<void> {
  const args = parseDealRoundupArgs(process.argv.slice(2));

  // Preflight — before any I/O, exactly as scaffold-post.ts does.
  assertCategoryRegistered(args.category, "<deal-roundup>");
  const categoryMeta = getCategoryMeta(args.category);
  if (!categoryMeta) {
    throw new Error(`generate-deal-post: unknown category "${args.category}".`);
  }

  const date = args.date ?? isoToday();
  const { deals, dropped, requested, snapshotPath } = loadRankedDeals({ ...args, date });
  printDealSummary({ requested, deals, dropped, snapshotPath, query: args.query });

  if (deals.length === 0) {
    console.log("\n[deal-roundup] no usable deals — nothing written.");
    return;
  }

  const postSlug = `deal-${args.category}-${date}`;
  const postPath = path.join(POSTS_DIR, `${postSlug}.mdx`);
  const sidecarRelPath = path.join("content", "deals", `${postSlug}.json`);

  if (args.dryRun) {
    console.log(
      `\n[deal-roundup] --dry-run: would stage ${deals.length} image(s) under public${DEALS_PUBLIC_PATH_PREFIX}/`,
    );
    console.log(`[deal-roundup] --dry-run: would write ${sidecarRelPath}`);
    console.log(`[deal-roundup] --dry-run: would write ${path.relative(process.cwd(), postPath)}`);
    return;
  }

  // One stageImages() call for the whole roundup — atomic (D5b): any
  // 404/timeout/bad-content-type aborts the run before any post or sidecar
  // is written, and idempotent (already-staged files are skipped).
  const pseudoCandidate: Candidate = {
    name: postSlug,
    brand: "",
    price: 0,
    affiliateUrl: deals[0].affiliateUrl,
    description: "",
    specs: {},
    imageUrls: deals.map((d) => d.imageUrl),
    category: args.category,
    sourceRef: postSlug,
  };

  const staged = await stageImages(pseudoCandidate, postSlug, {
    destDir: DEALS_IMAGES_DIR,
    publicPathPrefix: DEALS_PUBLIC_PATH_PREFIX,
  });

  if (!("images" in staged)) {
    throw new Error(`generate-deal-post: image staging failed: ${staged.reason}`);
  }

  // Cover-image floor — fail here with a deal-roundup-specific message
  // rather than letting lib/posts.ts's assertMinShortSide fail the build
  // later with a message that says nothing about deal roundups.
  const coverImage = staged.images.find((imgPath) => {
    const size = readImageSize(imgPath);
    return size !== null && Math.min(size.width, size.height) >= MIN_COVER_IMAGE_SHORT_SIDE_PX;
  });
  if (!coverImage) {
    const detail = staged.images
      .map((imgPath) => {
        const size = readImageSize(imgPath);
        return size ? `${imgPath} (${size.width}x${size.height})` : `${imgPath} (unreadable)`;
      })
      .join(", ");
    throw new Error(
      `generate-deal-post: no staged image clears the ${MIN_COVER_IMAGE_SHORT_SIDE_PX}px cover floor: ${detail}`,
    );
  }

  const dealRecords: Deal[] = deals.map((d, i) => ({
    id: `${postSlug}-${i + 1}`,
    name: d.name,
    priceVnd: d.priceVnd,
    originalPriceVnd: d.originalPriceVnd,
    discountPercent: d.discountPercent,
    rating: d.rating,
    soldCount: d.soldCount,
    image: staged.images[i],
    affiliateUrl: d.affiliateUrl,
    category: args.category,
  }));

  const sidecarPath = writeDealSidecar(postSlug, dealRecords);

  const stub = renderDealPostStub({
    category: args.category,
    categoryName: categoryMeta.name,
    publishedAt: date,
    coverImage,
    deals: dealRecords.map((d) => ({ id: d.id, name: d.name })),
  });

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(postPath, stub);

  console.log(`\n[deal-roundup] wrote ${sidecarPath}`);
  console.log(`[deal-roundup] wrote ${postPath}`);

  // Runs only now — after the current post exists on disk (US00153 §3.4),
  // so a failed run is never left with the prior post relabeled while no
  // current post exists.
  const { supersededSlug, alreadyArchived } = supersedePriorRoundup(args.category, postSlug);
  if (supersededSlug && !alreadyArchived) {
    console.log(`[deal-roundup] superseded prior roundup: ${supersededSlug}`);
  } else if (supersededSlug && alreadyArchived) {
    console.log(`[deal-roundup] prior roundup already archived: ${supersededSlug}`);
  }
}

main().catch((err) => {
  console.error(`[deal-roundup] ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
