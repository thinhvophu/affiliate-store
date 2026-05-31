/**
 * Price, currency, and date formatting helpers — F0004/US00041, F0006/US00061.
 *
 * Single chokepoints for rendering monetary values and post dates in the
 * storefront. Every price surface must call `formatVnd()`; every blog date
 * surface must call `formatPostDate()`. Neither may be bypassed by reaching
 * for `Intl.NumberFormat`, `toLocaleDateString`, or hand-rolled equivalents.
 *
 * SSG determinism: locale-dependent runtime ICU output (`Intl.*`,
 * `toLocaleDateString`) is intentionally NOT used in either helper — ICU data
 * can differ subtly between Node builds, making HTML non-deterministic across
 * Vercel build pools. Both helpers produce byte-identical output on every
 * machine via manual string assembly.
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
/**
 * Render an ISO date string as the canonical Vietnamese long-form date,
 * `"02 tháng 5, 2026"` (zero-padded day, "tháng" + numeric month, full year).
 *
 * SSG determinism: `toLocaleDateString("vi-VN")` / `Intl.DateTimeFormat` are
 * intentionally NOT used — ICU month-name / spacing data can drift between
 * Node builds. Vietnamese months are purely numeric ("tháng 5"), so the output
 * is assembled by hand and is byte-identical on every machine.
 *
 * Parsing: the ISO prefix is split by regex rather than via `new Date()` +
 * local-timezone getters, which can shift the day by ±1 depending on TZ.
 *
 * @example
 *   formatPostDate("2026-05-02")             // "02 tháng 5, 2026"
 *   formatPostDate("2026-11-09")             // "09 tháng 11, 2026"
 *   formatPostDate("2026-05-02T13:00:00Z")   // "02 tháng 5, 2026"
 *   formatPostDate("")                       // ""  (malformed → silent sentinel)
 */
export function formatPostDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!match) return "";

  const year = match[1];
  const month = parseInt(match[2], 10).toString();
  const day = match[3];

  return `${day} tháng ${month}, ${year}`;
}

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
