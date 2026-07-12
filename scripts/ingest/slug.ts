/**
 * Vietnamese-aware product slugifier — F0012 (US00122). Decision D1/D2.
 *
 * Distinct from `lib/mdx-slug.ts` (`github-slugger`), which strips combining
 * diacritics rather than transliterating them (`chuột` → `chut`, not
 * `chuot`). Product slugs must match the existing fixture style
 * (`chuot-gaming`, not `chuột-gaming`), so this module owns its own
 * deterministic, locale-API-free algorithm.
 */

const COMBINING_MARKS_RE = /[̀-ͯ]/g;

export function slugifyProductName(name: string): string {
  return name
    .normalize("NFD")
    .replace(COMBINING_MARKS_RE, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Appends `-2`, `-3`, … to `base` until `taken(candidate)` is false
 * (decision D7). `base` itself is returned untouched if free.
 */
export function disambiguate(base: string, taken: (candidate: string) => boolean): string {
  if (!taken(base)) {
    return base;
  }
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`;
    if (!taken(candidate)) {
      return candidate;
    }
  }
}
