/**
 * Auto-pick fallback for `--products` — F0012 (US00126 follow-up).
 *
 * When the operator omits `--products`, `scripts/scaffold-post.ts` needs a
 * deterministic way to pick 1–2 products for the named category instead of
 * requiring a manual slug lookup. Pure + unit-testable: takes the already
 * -loaded catalog, no filesystem access here.
 */

import type { Product } from "@/types";

export const MAX_AUTO_SELECTED_PRODUCTS = 2;

/**
 * Picks up to `max` products from `category`, featured ones first, each
 * group sorted by `publishedAt` desc then `slug` asc for a stable,
 * reproducible order across runs.
 */
export function selectProductsForCategory(
  products: Product[],
  category: string,
  max: number = MAX_AUTO_SELECTED_PRODUCTS,
): Product[] {
  const byRecency = (a: Product, b: Product): number => {
    const t = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    return t !== 0 ? t : a.slug.localeCompare(b.slug);
  };

  const inCategory = products.filter((p) => p.category === category);
  const featured = inCategory.filter((p) => p.featured).sort(byRecency);
  const rest = inCategory.filter((p) => !p.featured).sort(byRecency);

  return [...featured, ...rest].slice(0, max);
}
