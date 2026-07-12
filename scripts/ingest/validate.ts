/**
 * Validation engine — F0012 (US00121).
 *
 * Reuses the existing build-time chokepoints instead of re-implementing
 * them (decision D4): `assertAffiliateUrl` from lib/affiliate.ts and
 * `assertCategoryRegistered` from lib/categories.ts. Field checks mirror
 * `lib/products.ts`'s `validateProduct` so a candidate that passes here also
 * passes `next build` — they are pre-write guards, not a second source of
 * truth for URL/category rules.
 */

import { assertAffiliateUrl } from "@/lib/affiliate";
import { assertCategoryRegistered } from "@/lib/categories";
import type { Candidate, Rejection } from "./candidate";

const REQUIRED_STRINGS = ["name", "brand", "affiliateUrl", "description"] as const;

function rej(c: Candidate, reason: string): Rejection {
  return { ref: c.sourceRef, name: c.name || c.sourceRef, reason };
}

/**
 * Validates a candidate. `provisionalSlug` is a naive placeholder used only
 * to name the candidate in chokepoint error messages — the canonical
 * slugifier + dedupe land in US00122.
 */
export function validateCandidate(c: Candidate, provisionalSlug: string): Rejection | null {
  for (const f of REQUIRED_STRINGS) {
    if (typeof c[f] !== "string" || c[f].trim() === "") {
      return rej(c, `missing required field: ${f}`);
    }
  }
  if (typeof c.price !== "number" || !Number.isFinite(c.price) || c.price < 0) {
    return rej(c, "missing or invalid required field: price");
  }
  if (c.specs == null || typeof c.specs !== "object" || Object.keys(c.specs).length === 0) {
    return rej(c, "missing required field: specs");
  }
  if (!Array.isArray(c.imageUrls) || c.imageUrls.length === 0) {
    return rej(c, "missing required field: images");
  }
  try {
    assertAffiliateUrl(c.affiliateUrl, provisionalSlug);
  } catch (e) {
    return rej(c, e instanceof Error ? e.message : String(e));
  }
  try {
    assertCategoryRegistered(c.category, provisionalSlug);
  } catch (e) {
    return rej(c, e instanceof Error ? e.message : String(e));
  }
  return null;
}
