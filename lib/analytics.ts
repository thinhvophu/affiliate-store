import { env } from "@/lib/env";

/** GA4 measurement IDs are `G-` followed by an alphanumeric property token. */
const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,}$/;

/**
 * The one place that decides whether GA4 is active.
 *
 * SERVER-ONLY. `lib/env.ts` reads `process.env[name]` with a dynamic key, which
 * Next.js does NOT inline into the client bundle (see the env-var guide,
 * "dynamic lookups will not be inlined"). Call this from a Server Component and
 * pass the result down as a prop — never import it into a "use client" module.
 *
 * Returns undefined when analytics must not load: no ID configured, or any
 * non-production NODE_ENV (US00143 Scenario 3 — local browsing must never
 * pollute production data).
 *
 * Throws when an ID is set but malformed: that is a deployment misconfiguration
 * worth failing the build over, and it also closes the injection vector for the
 * value interpolated into the inline <Script> below.
 */
export function resolveGaMeasurementId(): string | undefined {
  const id = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return undefined;
  if (!GA_MEASUREMENT_ID_PATTERN.test(id)) {
    throw new Error(
      `NEXT_PUBLIC_GA_MEASUREMENT_ID must look like "G-XXXXXXXXXX". Received: "${id}"`,
    );
  }
  if (process.env.NODE_ENV !== "production") return undefined;
  return id;
}

/** GA4 event name for an outbound affiliate click. */
export const AFFILIATE_CLICK_EVENT = "affiliate_click";

/**
 * The F0003 ↔ F0007 data-* contract, in code.
 *
 * These MUST match the attributes written by <AffiliateLink> exactly.
 * CLAUDE.md: renaming any of them is a breaking change that must update both
 * sides in the same PR. `lib/analytics.test.tsx` renders <AffiliateLink> and
 * asserts the two sides agree, so drift fails the build instead of silently
 * shipping events with undefined fields.
 */
export const AFFILIATE_LINK_SELECTOR = "[data-affiliate-link]";
export const AFFILIATE_DATA_ATTRIBUTES = {
  productName: "data-product-name",
  productCategory: "data-product-category",
  destinationUrl: "data-destination-url",
} as const;

export interface AffiliateClickPayload {
  product_name: string;
  product_category: string;
  destination_url: string;
}

/** Minimal structural type — keeps this function testable in the node env. */
type AttributeSource = { getAttribute(name: string): string | null };

/**
 * Read the GA4 payload off a matched affiliate anchor.
 * Returns null when the element carries none of the contract attributes, so a
 * future markup change degrades to "no event" rather than an event full of
 * undefined fields.
 */
export function readAffiliateClickPayload(
  el: AttributeSource | null,
): AffiliateClickPayload | null {
  if (!el) return null;
  const product_name = el.getAttribute(AFFILIATE_DATA_ATTRIBUTES.productName);
  const product_category = el.getAttribute(AFFILIATE_DATA_ATTRIBUTES.productCategory);
  const destination_url = el.getAttribute(AFFILIATE_DATA_ATTRIBUTES.destinationUrl);
  if (product_name === null && product_category === null && destination_url === null) {
    return null;
  }
  return {
    product_name: product_name ?? "",
    product_category: product_category ?? "",
    destination_url: destination_url ?? "",
  };
}
