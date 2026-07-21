/**
 * Dedupe / idempotency — F0012 (US00122). Decisions D3–D7.
 *
 * Classifies an accepted candidate against the existing catalog (seeded from
 * `getAllProducts()`, decision D5) plus everything already accepted earlier
 * in the same run (decision D6, via `registerAccepted`). Never mutates or
 * overwrites an existing fixture — `writer.ts`'s refuse-if-exists guard
 * (D8) is the backstop if this logic is ever wrong.
 */

import { getAllProducts } from "@/lib/products";
import type { Product } from "@/types";
import { disambiguate } from "./slug";

export interface CatalogIndex {
  /** affiliateUrl -> slug, for exact-match duplicate detection (D3/D4). */
  byUrl: Map<string, string>;
  slugs: Set<string>;
}

export function buildCatalogIndex(products: Product[] = getAllProducts()): CatalogIndex {
  const byUrl = new Map<string, string>();
  const slugs = new Set<string>();
  for (const product of products) {
    byUrl.set(product.affiliateUrl, product.slug);
    slugs.add(product.slug);
  }
  return { byUrl, slugs };
}

export type ClassifyResult =
  | { kind: "duplicate"; slug: string }
  | { kind: "new"; slug: string }
  | { kind: "collision"; slug: string };

/**
 * `baseSlug` is the un-disambiguated slug derived from `affiliateUrl`'s
 * candidate name (`slugifyProductName`). Duplicate check (by URL) always
 * takes priority over slug collision (D3).
 */
export function classify(
  affiliateUrl: string,
  baseSlug: string,
  index: CatalogIndex,
): ClassifyResult {
  const existingSlug = index.byUrl.get(affiliateUrl);
  if (existingSlug !== undefined) {
    return { kind: "duplicate", slug: existingSlug };
  }

  if (index.slugs.has(baseSlug)) {
    const slug = disambiguate(baseSlug, (candidate) => index.slugs.has(candidate));
    return { kind: "collision", slug };
  }

  return { kind: "new", slug: baseSlug };
}

/** Registers a just-accepted candidate so later candidates in the same run see it (D6). */
export function registerAccepted(index: CatalogIndex, affiliateUrl: string, slug: string): void {
  index.byUrl.set(affiliateUrl, slug);
  index.slugs.add(slug);
}
