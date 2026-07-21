/**
 * Shared in-memory candidate model — F0012 (US00121).
 *
 * Every ingestion source (scrape, file, …) normalizes its raw input into a
 * `Candidate` before it reaches the validation engine. This keeps validation,
 * dedupe, and staging source-agnostic (decision D3).
 */

export interface Candidate {
  name: string;
  brand: string;
  price: number; // VND integer; missing → rejection, never a guessed default
  affiliateUrl: string; // raw, validated by assertAffiliateUrl (NOT parsed here)
  description: string;
  specs: Record<string, string>;
  imageUrls: string[]; // remote URLs pre-staging (US00123 turns these local)
  category: string; // injected from --category (single source of truth)
  sourceRef: string; // "scrape#3" or "file:line 12" — for summary/error messages
}

export interface AcceptedCandidate extends Candidate {
  slug: string; // derived in US00122
  images: string[]; // local /static/... paths after US00123 staging
  /** Slug was disambiguated (`-2`, `-3`, …) after a collision — flag for human review (D7). */
  needsReview: boolean;
}

export interface Rejection {
  ref: string; // candidate.sourceRef
  name: string; // best-effort human label
  reason: string; // "missing required field: price" / "host \"foo.com\" not allowed"
}
