/**
 * Fixture writer — F0012 (US00121, US00122, US00123).
 *
 * Serializes an accepted candidate to `content/products/<slug>.json`,
 * matching the `Product` interface (types/product.ts) exactly so the output
 * satisfies `lib/products.ts`'s build-time validation. Guarded by
 * `--dry-run` at the call site — never invoked when dry-run is set.
 *
 * Refuses to overwrite an existing fixture (decision D8) — defense-in-depth
 * backstop for the dedupe/collision logic in `dedupe.ts`; the caller should
 * never reach this with a taken slug, but a bug there must never silently
 * clobber an existing product file.
 *
 * Refuses to write a remote (`http`/`https`) image URL (US00123 decision
 * D3) — defense-in-depth backstop for `images.ts`'s staging step; the
 * caller should never reach this with an un-staged image, but a bug there
 * must never publish a hotlinked fixture.
 */

import fs from "node:fs";
import path from "node:path";
import type { Product } from "@/types";
import type { AcceptedCandidate } from "./candidate";

const PRODUCTS_DIR = path.join(process.cwd(), "content", "products");

export function writeFixture(accepted: AcceptedCandidate): void {
  const remoteImage = accepted.images.find((src) => /^https?:\/\//.test(src));
  if (remoteImage !== undefined) {
    throw new Error(
      `[ingest] refusing to write fixture "${accepted.slug}" with a remote image URL (staging must run first): ${remoteImage}`,
    );
  }

  const product: Product = {
    slug: accepted.slug,
    name: accepted.name,
    category: accepted.category,
    brand: accepted.brand,
    price: accepted.price,
    affiliateUrl: accepted.affiliateUrl,
    images: accepted.images,
    description: accepted.description,
    specs: accepted.specs,
    publishedAt: new Date().toISOString().slice(0, 10),
    featured: false,
  };

  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  const filePath = path.join(PRODUCTS_DIR, `${accepted.slug}.json`);
  if (fs.existsSync(filePath)) {
    throw new Error(`[ingest] refusing to overwrite existing fixture: ${filePath}`);
  }
  fs.writeFileSync(filePath, `${JSON.stringify(product, null, 2)}\n`, "utf-8");
}
