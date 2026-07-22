/**
 * Scrape source adapter — F0012 (US00124). Decisions D1–D9.
 *
 * Reads the `data/deals/<date>.json` snapshot already produced out-of-band
 * by the shopee-affiliate scrape tool, run separately beforehand (D1) — this
 * Node process never invokes that tool itself; the file is the contract. Filters
 * to the result group whose `keyword` matches `--query` (D3), caps at
 * `--count` (D4), and maps each `RawDeal` to the shared `Candidate` shape
 * via `mapDealToCandidate` — the one place that knows the real deal schema
 * (D6). Missing `--date` defaults to today (D5). A missing deals file is
 * fatal, naming the expected path (D9).
 */

import fs from "node:fs";
import path from "node:path";
import type { IngestArgs } from "../args";
import type { Candidate } from "../candidate";
import { parseDealsSnapshot, type RawDeal } from "./deal-schema";

export interface LoadScrapeCandidatesOptions {
  /** Override the deals directory — tests point this at a fixture dir. */
  dealsDir?: string;
}

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function loadScrapeCandidates(
  args: IngestArgs,
  opts: LoadScrapeCandidatesOptions = {},
): Promise<Candidate[]> {
  if (!args.query) {
    throw new Error('scrape source: missing required flag "--query=<term>".');
  }

  const date = args.date ?? isoToday();
  const dealsDir = opts.dealsDir ?? path.join(process.cwd(), "data", "deals");
  const file = path.join(dealsDir, `${date}.json`);

  if (!fs.existsSync(file)) {
    throw new Error(
      `scrape source: no deals file at ${file}. Run the shopee-affiliate scrape tool first.`,
    );
  }

  const snapshot = parseDealsSnapshot(JSON.parse(fs.readFileSync(file, "utf-8")), file);
  const matched = snapshot.results.find((r) => r.keyword.trim() === args.query!.trim());
  const deals = matched?.deals ?? [];
  const capped = args.count !== undefined ? deals.slice(0, args.count) : deals;

  return capped.map((deal, i) => mapDealToCandidate(deal, args.category, i + 1));
}

function collectImageUrls(deal: RawDeal): string[] {
  const gallery = deal.details?.imageGallery ?? [];
  return Array.from(
    new Set([deal.imageUrl, ...gallery].filter((url): url is string => Boolean(url))),
  );
}

function mapDealToCandidate(deal: RawDeal, category: string, index: number): Candidate {
  return {
    name: deal.name,
    brand: deal.brand ?? "", // not present in the scraper's current output (D8) — rejected by validateCandidate until fixed upstream
    price: deal.priceVnd,
    affiliateUrl: deal.affiliateUrl ?? "",
    description: deal.details?.description ?? "",
    specs: deal.details?.specifications ?? {}, // always {} today (D8) — same rejection path
    imageUrls: collectImageUrls(deal),
    category,
    sourceRef: `scrape#${index}`,
  };
}
