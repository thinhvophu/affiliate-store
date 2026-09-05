# Plan: Keyword & Product Research for Visibility

**Status:** Draft — not yet started
**Owner:** Anh Thịnh
**Created:** 2026-09-05
**Type:** Ad hoc research initiative (no user story — not spec'd content/code work; output feeds the existing `/write-post` and `ingest:products` pipelines)

## Goal

Grow organic visibility by targeting specific, validated keywords with specific products — instead of writing posts for whatever's in the catalog. Replaces guesswork with demand data before content is written.

## Why

- Only 4 of 15 catalog products have a blog post; `tai-nghe-gaming` has 4 products and 0 posts (see `data/content-queue.md`).
- No keyword or GA data has driven content choices so far — posts were written per-product, not per-demand.
- Search Console verification (US00145) and GA4 tracking (US00143/US00144) are both live/landing, so real search + click data is about to become available for the first time.

## Steps

Reordered 2026-09-05: GA4 (`413699722`) has zero traffic/realtime data so far (confirmed live via `analytics-mcp`), so the GA4 pull is blocked on real visitors and moved after the keyword research work, which has no such dependency and can start immediately.

### 1. ~~Unblock GA4 access~~ — done

`analytics-mcp` connects; queried GA4 property `413699722` directly (`get_property_details`, `run_report`, `run_realtime_report`). Deployed `NEXT_PUBLIC_GA_MEASUREMENT_ID` (`G-C4QJ77RCDM`, stream `15723278759`) confirmed to belong to this property.

### 2. Keyword Planner research pass

Anh Thịnh exports CSVs from Google Keyword Planner for seed terms per category (e.g. "chuột gaming", "bàn phím cơ", "tai nghe gaming" + price-point variants like "dưới 300k", "dưới 500k"). Drop location TBD — reuse the `analyze/`-folder + date-range-filename convention from other projects, or set up fresh in this repo (decision needed). Claude parses each CSV for volume + competition and ranks terms by `(volume × commercial intent) ÷ competition`.

### 3. Cross-reference against what we can actually sell

Match ranked keywords against:

- `content/products/*.json` — products that already exist, zero extra ingest work
- `data/content-queue.md`'s `pending` rows (10 at time of writing)
- The categories with the biggest content gap (`tai-nghe-gaming` first)

### 4. Fill gaps with the Shopee scrape tool

For a high-value keyword with no matching catalog product, run the Shopee scrape tool (`mcp__shopee-affiliate__scrape_products`) with that keyword to pull real candidates (price, commission, demand). Output feeds the existing `ingest:products --source=scrape` pipeline (`scripts/ingest-products.ts`, F0012) if a candidate is worth adding.

### 5. Pull "what already converts" from GA4 — once real traffic exists

Query organic landing pages + `affiliate_click` events for the 4 existing posts. Produces a **double-down list**: products/categories already getting traffic or clicks, worth a follow-up post — separate from the **cold-start gap** (`tai-nghe-gaming`, most of `ban-phim-gaming`). Revisit this step once the site has actual visitors (see "how to get real traffic" discussion — Search Console submission + sharing published posts).

### 6. Deliverable

A ranked shortlist, merging keyword-research priority (steps 2–4) with GA4 signal (step 5) once available:

| keyword | category | matched product (existing/new) | priority | rationale |
| ------- | -------- | ------------------------------- | -------- | --------- |

This list becomes the input queue for `/write-post`, replacing the current unordered `content-queue.md` pending list as the source of "what to write next."

## Open decisions

- [ ] Where do Keyword Planner CSVs live in this repo — reuse `analyze/` + date-range filename convention, or something new?
- [ ] Cadence — one-time pass, or repeated per content batch?

## Status log

- 2026-09-05 — Plan drafted, not yet started. Next action: fix `analytics-mcp` (`pipx` on PATH).
- 2026-09-05 — Step 1 done: `analytics-mcp` connects successfully; queried property `413699722` directly (`get_property_details`, `run_report`, `run_realtime_report`). Also confirmed the deployed `NEXT_PUBLIC_GA_MEASUREMENT_ID` (`G-C4QJ77RCDM`, stream `15723278759`) belongs to this property. No traffic/realtime data yet — property is empty pending real visitors. Next action: step 2, pull organic landing pages + `affiliate_click` events once traffic exists.
