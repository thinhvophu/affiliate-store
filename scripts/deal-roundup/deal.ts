/**
 * The F0015 deal model — US00146.
 *
 * Deliberately NOT the F0012 `Candidate` shape: a Candidate exists to become
 * a `Product` fixture and therefore requires `brand` + `specs`, which the
 * scraper does not reliably populate (deal-schema.ts, confirmed 2026-07-26)
 * — routing around exactly that gap is F0015's entire reason to exist (spec
 * §1). A RankedDeal carries only what a deal card renders.
 *
 * `score` and the source ordering come from the tool's rankDeals(); this
 * repo never recomputes either (spec §2 Out of Scope, US00146 Scenario 1).
 */
export interface RankedDeal {
  /** 1-based position in the tool's own ranking. Never re-derived. */
  rank: number;
  name: string;
  priceVnd: number;
  originalPriceVnd: number;
  discountPercent: number;
  rating: number;
  soldCount: number;
  shopLocation: string;
  isOfficialShop: boolean;
  isFreeShipping: boolean;
  /** Remote CDN URL at this stage. US00147 stages it locally before it is ever rendered. */
  imageUrl: string;
  affiliateUrl: string;
  /** The tool's own score, carried through for the run summary only — never sorted on. */
  score: number;
}

/** A deal excluded from the roundup, with the reason, for the run summary. */
export interface DroppedDeal {
  rank: number;
  name: string;
  reason: string;
}
