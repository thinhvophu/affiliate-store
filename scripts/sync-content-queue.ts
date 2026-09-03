/**
 * Content-queue sync CLI — tracks which products still lack a blog post.
 *
 * The list of "products without a post" is always derived (cross-referenced
 * against every `<ProductCard slug="…">` embed in `content/posts/*.mdx`), so
 * it can never drift out of sync with reality. The `status` column is the
 * one thing this file persists by hand: `pending` -> `drafted` -> `reviewed`
 * -> `published`, worked through one product at a time via `/write-post`.
 * A row auto-flips to `published` the next time this script runs once a
 * `<ProductCard>` embed for that slug shows up anywhere in `content/posts/`.
 *
 * Run via `npm run sync:content-queue`.
 */

import fs from "node:fs";
import path from "node:path";
import type { Product } from "@/types";

const DEFAULT_PRODUCTS_DIR = path.join(process.cwd(), "content", "products");
const DEFAULT_POSTS_DIR = path.join(process.cwd(), "content", "posts");
const DEFAULT_QUEUE_FILE = path.join(process.cwd(), "data", "content-queue.md");

export const QUEUE_STATUSES = ["pending", "drafted", "reviewed", "published"] as const;
export type QueueStatus = (typeof QUEUE_STATUSES)[number];

export interface QueueRow {
  slug: string;
  category: string;
  status: QueueStatus;
}

export interface SyncOptions {
  productsDir?: string;
  postsDir?: string;
  queueFile?: string;
}

export interface SyncResult {
  rows: QueueRow[];
  added: string[];
  autoPublished: string[];
  removed: string[];
}

const TABLE_ROW_RE = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/;
const PRODUCT_CARD_RE = /<ProductCard\s+slug="([^"]+)"/g;

function readProducts(productsDir: string): { slug: string; category: string }[] {
  if (!fs.existsSync(productsDir)) {
    return [];
  }
  return fs
    .readdirSync(productsDir)
    .filter((f) => f.endsWith(".json"))
    .map((file) => {
      const filePath = path.join(productsDir, file);
      let product: Product;
      try {
        product = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Product;
      } catch (err) {
        throw new Error(`[sync-content-queue] ${filePath}: failed to parse JSON. ${err}`);
      }
      return { slug: product.slug, category: product.category };
    });
}

function readReferencedSlugs(postsDir: string): Set<string> {
  const referenced = new Set<string>();
  if (!fs.existsSync(postsDir)) {
    return referenced;
  }
  for (const file of fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"))) {
    const content = fs.readFileSync(path.join(postsDir, file), "utf-8");
    for (const match of content.matchAll(PRODUCT_CARD_RE)) {
      referenced.add(match[1]);
    }
  }
  return referenced;
}

function parseQueueFile(content: string): QueueRow[] {
  const rows: QueueRow[] = [];
  for (const line of content.split("\n")) {
    const match = TABLE_ROW_RE.exec(line.trim());
    if (!match) continue;
    const [, slug, category, status] = match;
    if (slug === "slug" || /^-+$/.test(slug)) continue;
    if (!QUEUE_STATUSES.includes(status as QueueStatus)) {
      throw new Error(
        `[sync-content-queue] queue file has an invalid status "${status}" for slug "${slug}" ` +
          `(expected one of: ${QUEUE_STATUSES.join(", ")}).`,
      );
    }
    rows.push({ slug, category, status: status as QueueStatus });
  }
  return rows;
}

function serializeQueueFile(rows: QueueRow[]): string {
  const header =
    "# Content Queue\n\n" +
    "Tracks which products still need a blog post. Generated + merged by " +
    "`npm run sync:content-queue` — do not hand-edit the `slug`/`category` columns, only " +
    "`status`. Status flow: `pending` -> `drafted` -> `reviewed` -> `published`. A row " +
    "auto-flips to `published` on the next sync once a `<ProductCard slug=\"…\">` embed for " +
    "it is found anywhere in `content/posts/`.\n\n" +
    "| slug | category | status |\n" +
    "| --- | --- | --- |\n";
  const body = rows.map((r) => `| ${r.slug} | ${r.category} | ${r.status} |`).join("\n");
  return `${header}${body}\n`;
}

/**
 * Re-derives the product/post-coverage state and merges it into the queue
 * file: existing statuses are preserved, new product gaps are added as
 * `pending`, rows now backed by a `<ProductCard>` embed are flipped to
 * `published`, and rows for products no longer in the catalog are dropped.
 */
export function syncContentQueue(options: SyncOptions = {}): SyncResult {
  const productsDir = options.productsDir ?? DEFAULT_PRODUCTS_DIR;
  const postsDir = options.postsDir ?? DEFAULT_POSTS_DIR;
  const queueFile = options.queueFile ?? DEFAULT_QUEUE_FILE;

  const products = readProducts(productsDir);
  const referencedSlugs = readReferencedSlugs(postsDir);
  const productSlugs = new Set(products.map((p) => p.slug));

  const existingRows = fs.existsSync(queueFile)
    ? parseQueueFile(fs.readFileSync(queueFile, "utf-8"))
    : [];
  const existingBySlug = new Map(existingRows.map((r) => [r.slug, r]));

  const added: string[] = [];
  const autoPublished: string[] = [];

  const rows: QueueRow[] = products.map((product) => {
    const existing = existingBySlug.get(product.slug);
    const isReferenced = referencedSlugs.has(product.slug);

    if (isReferenced) {
      if (!existing || existing.status !== "published") {
        autoPublished.push(product.slug);
      }
      return { slug: product.slug, category: product.category, status: "published" };
    }

    if (existing) {
      return { slug: product.slug, category: product.category, status: existing.status };
    }

    added.push(product.slug);
    return { slug: product.slug, category: product.category, status: "pending" };
  });

  const removed = existingRows.filter((r) => !productSlugs.has(r.slug)).map((r) => r.slug);

  rows.sort((a, b) => a.category.localeCompare(b.category) || a.slug.localeCompare(b.slug));

  fs.mkdirSync(path.dirname(queueFile), { recursive: true });
  fs.writeFileSync(queueFile, serializeQueueFile(rows), "utf-8");

  return { rows, added, autoPublished, removed };
}

function printSummary(result: SyncResult): void {
  const pendingCount = result.rows.filter((r) => r.status === "pending").length;
  console.log(
    `[sync-content-queue] ${result.rows.length} products tracked, ${pendingCount} pending.`,
  );
  if (result.added.length > 0) {
    console.log(`  added:          ${result.added.join(", ")}`);
  }
  if (result.autoPublished.length > 0) {
    console.log(`  auto-published: ${result.autoPublished.join(", ")}`);
  }
  if (result.removed.length > 0) {
    console.log(`  removed:        ${result.removed.join(", ")}`);
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  try {
    printSummary(syncContentQueue());
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
