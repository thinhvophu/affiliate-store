/**
 * Price & currency formatting helpers — F0004 / US00041.
 *
 * Single chokepoint for rendering monetary values in the storefront. Every
 * card, detail page, related-products row, inline MDX embed, and (future)
 * homepage featured-pick must call `formatVnd()` rather than reaching for
 * `Intl.NumberFormat` or hand-rolling a "₫" prefix. A future change (e.g.,
 * a thinner non-breaking space, a different separator, a compact "1,2tr"
 * shorthand) then touches exactly one file.
 *
 * SSG determinism (spec Scenario 7):
 *   `Intl.NumberFormat("vi-VN", …)` is intentionally NOT used. ICU data can
 *   differ subtly between Node builds (e.g. non-breaking-space vs. regular
 *   space between digits and currency symbol), which would make HTML
 *   non-deterministic across Vercel build pools and break snapshot review.
 *   Manual digit-grouping with the canonical "\B(?=(\d{3})+(?!\d))" regex
 *   produces byte-identical output on every machine.
 */

/**
 * Render an integer dong amount as the canonical Vietnamese price string,
 * `"₫1.200.000"` (₫ prefix, dot thousands separator, no decimal places).
 *
 * - Non-integer inputs are rounded to the nearest integer dong (`Math.round`).
 * - Zero renders as `"₫0"`.
 * - Sub-thousand amounts render without separator (`formatVnd(390) === "₫390"`).
 * - Non-finite inputs (NaN, ±Infinity) fall back to `"₫0"`; the price loader
 *   in `lib/products.ts` already rejects bad data at build time, so this is a
 *   belt-and-braces sentinel that should never appear in shipped HTML.
 * - Negative inputs render as `"-₫1.200.000"` (sign outside the currency mark).
 *   The loader already rejects `price < 0`, so this only surfaces for direct
 *   callers that bypass the loader path.
 *
 * @example
 *   formatVnd(1_200_000) // "₫1.200.000"
 *   formatVnd(390)       // "₫390"
 *   formatVnd(0)         // "₫0"
 *   formatVnd(390_000.7) // "₫390.001"
 */
export function formatVnd(amount: number): string {
  const rounded = Math.round(amount);

  if (!Number.isFinite(rounded)) {
    return "₫0";
  }

  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${sign}₫${digits}`;
}
