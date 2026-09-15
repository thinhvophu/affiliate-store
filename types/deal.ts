/**
 * A deal as persisted in a roundup post's sidecar, `content/deals/<post-slug>.json`.
 *
 * Distinct from `Product` by design (F0015 §1): no `brand`, no `specs`, no
 * `slug`, no `description` — the scrape tool populates none of them reliably,
 * and requiring them is precisely what blocks timely deal content today.
 * Distinct from `scripts/deal-roundup/deal.ts`'s `RankedDeal` too: by the time
 * a Deal exists, its image has been staged locally and it has a stable id.
 */
export interface Deal {
  /** `<post-slug>-<n>`, 1-based, unique across all sidecars. The MDX embed key. */
  id: string;
  name: string;
  priceVnd: number;
  /** Equal to `priceVnd` when the tool reports no separate list price — see D5c. */
  originalPriceVnd: number;
  discountPercent: number;
  rating: number;
  soldCount: number;
  /** Root-relative `/static/images/deals/…` ONLY. A remote URL here is a build error. */
  image: string;
  affiliateUrl: string;
  /** The registered category slug — feeds `data-product-category` on the card. */
  category: string;
}
