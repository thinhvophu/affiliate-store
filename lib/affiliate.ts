/**
 * Affiliate URL validation — F0003 / US00034.
 *
 * Single chokepoint for parsing, validating, and (in the future) normalizing
 * Shopee affiliate URLs. No file outside this module may parse, trim, or
 * rewrite an affiliate URL.
 *
 * Project rule (mirrored in CLAUDE.md "Affiliate links"):
 *   All affiliate destinations on the site MUST route through <AffiliateLink>
 *   (components/AffiliateLink.tsx). Raw <a href="https://shope.ee/..."> (or any
 *   Shopee-host anchor) outside <AffiliateLink> is disallowed. URL validation
 *   and any future normalization live HERE; no other file may parse or rewrite
 *   affiliate URLs.
 *
 * Allow-list is intentionally exact-host (no subdomain wildcards). A new
 * Shopee surface (e.g. `affiliate.shopee.vn`) is a single-line edit below.
 */

export const SHOPEE_AFFILIATE_HOSTS = ["shopee.vn", "shopee.ee", "shope.ee"] as const;

export type ShopeeAffiliateHost = (typeof SHOPEE_AFFILIATE_HOSTS)[number];

/** Non-throwing check; returns true iff `host` is in the Shopee allow-list. */
export function isAffiliateHost(host: string): host is ShopeeAffiliateHost {
  return (SHOPEE_AFFILIATE_HOSTS as readonly string[]).includes(host.toLowerCase());
}

/**
 * Validate that `url` is a parseable absolute URL whose host is in the Shopee
 * allow-list. Throws `Error` on failure with a single-line message naming
 * `productSlug` and (where known) the offending host.
 *
 * Returns `url` unchanged on success, so callers can write:
 *   product.affiliateUrl = assertAffiliateUrl(obj.affiliateUrl, obj.slug);
 */
export function assertAffiliateUrl(url: string, productSlug: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      `product "${productSlug}": affiliateUrl ${JSON.stringify(url)} is not a valid absolute URL.`,
    );
  }

  const host = parsed.hostname.toLowerCase();
  if (!isAffiliateHost(host)) {
    throw new Error(
      `product "${productSlug}": affiliateUrl host "${host}" is not an allowed Shopee host ` +
        `(allowed: ${SHOPEE_AFFILIATE_HOSTS.join(", ")}).`,
    );
  }

  return url;
}
