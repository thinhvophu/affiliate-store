import styles from "./AffiliateLink.module.css";

/**
 * Canonical affiliate-link primitive — F0003 (US00031 + US00033).
 *
 * All affiliate destinations on the site MUST route through this component.
 * The component bakes in correct link semantics, the Vietnamese accessible
 * label, and the F0003 ↔ F0007 tracking-seam contract. See the "Affiliate
 * links" section of CLAUDE.md for the project-wide convention.
 *
 * --- F0003 ↔ F0007 contract (US00033) ---------------------------------
 * Every rendered anchor carries FOUR stable data-* attributes that F0007's
 * delegated click listener relies on. These names are a PUBLIC API of this
 * primitive — renaming any of them is a breaking change and must update the
 * F0007 listener in the same PR.
 *
 *   data-affiliate-link              presence flag (selector hook)
 *   data-product-name                from productName prop
 *   data-product-category            from productCategory prop
 *   data-destination-url             from href prop (mirrors the href)
 *
 * No other component in the codebase may emit `data-affiliate-link`.
 *
 * Until F0007 ships, the seam is INERT: no JS handler is attached from F0003,
 * the click triggers a normal new-tab navigation, and analytics are silently
 * absent. JS-off behaviour is identical (the anchor is a plain server-rendered
 * <a>).
 *
 * Example rendered DOM:
 *
 *   <a href="https://shope.ee/abc"
 *      target="_blank"
 *      rel="noopener noreferrer sponsored"
 *      data-affiliate-link=""
 *      data-product-name="Chuột Logitech G102"
 *      data-product-category="chuot-gaming"
 *      data-destination-url="https://shope.ee/abc">
 *     Mua ngay
 *     <span class="srOnly">Mở Chuột Logitech G102 trên Shopee (mở tab mới)</span>
 *   </a>
 * -----------------------------------------------------------------------
 *
 * Whole-card usage example is in US00032's plan / implementation; consumers
 * pass `className={styles.card}` to style the wrapping <a>.
 * URL validation lives in lib/affiliate.ts (US00034); this component does not
 * re-validate at render time — destinations are already trusted by the loader.
 */

export interface AffiliateLinkProps {
  href: string;
  productName: string;
  productCategory: string;
  children: React.ReactNode;
  /** Optional styling hook applied to the wrapping `<a>`. Used by US00032's
   *  whole-card pattern. target/rel are deliberately not accepted — link
   *  semantics are baked in. */
  className?: string;
}

export function AffiliateLink({
  href,
  productName,
  productCategory,
  children,
  className,
}: AffiliateLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      data-affiliate-link=""
      data-product-name={productName}
      data-product-category={productCategory}
      data-destination-url={href}
      className={className}
    >
      {children}
      <span className={styles.srOnly}>
        {`Mở ${productName} trên Shopee (mở tab mới)`}
      </span>
    </a>
  );
}
