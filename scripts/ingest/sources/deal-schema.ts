/**
 * Raw scrape-deal schema — F0012 (US00124). Decisions D6/R1.
 *
 * Locked against a real `data/deals/<date>.json` produced by the
 * shopee-affiliate scrape tool, run separately beforehand (confirmed
 * 2026-07-22). All schema assumptions live in this one file — a future
 * scraper change is a one-file fix, isolated from `scrape.ts`'s
 * query/count/dedupe logic.
 *
 * `brand` is optional and, as of the confirmed run, never present; the
 * scraper is expected to add it later (out of scope here). `specifications`
 * is always `{}` today for the same reason. Both flow straight through
 * `mapDealToCandidate` — no guessing, no placeholder values (D8) — so
 * `validateCandidate` rejects until the scraper is updated upstream.
 */

export interface RawDealDetails {
  description: string;
  specifications: Record<string, string>;
  imageGallery: string[];
  variants: { type: string; options: string[] }[];
  shopName: string;
  shopRating: number | null;
  topReviews: { rating: number; text: string }[];
}

export interface RawDeal {
  itemId: number;
  shopId: number;
  name: string;
  brand?: string;
  priceVnd: number;
  originalPriceVnd: number;
  discountPercent: number;
  rating: number;
  soldCount: number;
  stock: number;
  shopLocation: string;
  isOfficialShop: boolean;
  isFreeShipping: boolean;
  imageUrl: string;
  productUrl: string;
  affiliateUrl: string | null;
  score: number;
  details?: RawDealDetails;
}

export interface RawSearchResult {
  keyword: string;
  timestamp: string;
  totalFound: number;
  deals: RawDeal[];
}

export interface DailyDealsSnapshot {
  date: string;
  generatedAt: string;
  totalKeywords: number;
  results: RawSearchResult[];
}

function fail(file: string, message: string): never {
  throw new Error(`scrape source: malformed deals file ${file}: ${message}`);
}

/**
 * Runtime shape guard (R1 mitigation) — a wrong assumption about the deal
 * schema fails loudly with a path-named message instead of silently
 * mis-mapping fields.
 */
export function parseDealsSnapshot(raw: unknown, file: string): DailyDealsSnapshot {
  if (typeof raw !== "object" || raw === null) {
    fail(file, "expected a JSON object at the top level");
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.date !== "string") {
    fail(file, '"date" must be a string');
  }
  if (!Array.isArray(obj.results)) {
    fail(file, '"results" must be an array');
  }

  (obj.results as unknown[]).forEach((entry, i) => {
    if (typeof entry !== "object" || entry === null) {
      fail(file, `results[${i}] must be an object`);
    }
    const result = entry as Record<string, unknown>;
    if (typeof result.keyword !== "string") {
      fail(file, `results[${i}].keyword must be a string`);
    }
    if (!Array.isArray(result.deals)) {
      fail(file, `results[${i}].deals must be an array`);
    }
    (result.deals as unknown[]).forEach((deal, j) => assertRawDeal(deal, file, `results[${i}].deals[${j}]`));
  });

  return obj as unknown as DailyDealsSnapshot;
}

function assertRawDeal(deal: unknown, file: string, path: string): asserts deal is RawDeal {
  if (typeof deal !== "object" || deal === null) {
    fail(file, `${path} must be an object`);
  }
  const d = deal as Record<string, unknown>;
  if (typeof d.name !== "string") {
    fail(file, `${path}.name must be a string`);
  }
  if (typeof d.priceVnd !== "number") {
    fail(file, `${path}.priceVnd must be a number`);
  }
  if (typeof d.imageUrl !== "string") {
    fail(file, `${path}.imageUrl must be a string`);
  }
  if (typeof d.productUrl !== "string") {
    fail(file, `${path}.productUrl must be a string`);
  }
  if (d.affiliateUrl !== null && typeof d.affiliateUrl !== "string") {
    fail(file, `${path}.affiliateUrl must be a string or null`);
  }
}
