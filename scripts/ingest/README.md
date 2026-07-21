# Ingestion CLI (F0012)

Dev tooling for generating `content/products/*.json` fixtures. Not part of
the rendered site — runs via `tsx`, never imported by `app/`, `components/`,
or `lib/`.

## Usage

```bash
npm run ingest:products -- --category=<slug> --source=<name> [--dry-run] [--<source-flag>=<value> ...]
```

- `--category` (required) — must already be registered in `lib/categories.ts`.
  Checked **before** any source runs; an unregistered category exits
  non-zero immediately.
- `--source` (required) — which adapter to load candidates from. Only a
  temporary in-memory stub source exists as of US00121; the real `scrape`
  (US00124) and `file` (US00125) adapters land in follow-up stories.
- `--dry-run` — runs the full pipeline (parse → validate) and prints the
  summary, but writes no `content/products/*.json` file and downloads no
  image.
- Any other `--key=value` flag is passed through untouched for source
  adapters to read (e.g. a future `--path=data/batch.json`).

## Exit codes

- `0` — the run completed. Individual rejected/duplicate candidates do
  **not** fail the run; they're itemized in the summary.
- non-zero — a fatal error: bad CLI args, an unregistered `--category`, or
  (once a real source lands) a malformed input file.

## Summary output

Four labelled groups — `Added`, `Disambiguated - needs review`, `Skipped -
duplicate`, `Rejected` — each line naming the candidate and, for
skips/rejections/disambiguations, the reason — followed by a footer line:
`requested N, ingested M, skipped K, rejected J`. "Disambiguated" is a
subset of "Added": those items were written under a `-2`/`-3`… slug after a
collision (see below) and are called out separately so they don't blend
into an otherwise-clean run.

## Slug generation & dedupe (US00122)

Every accepted candidate gets a slug from `scripts/ingest/slug.ts`
(`slugifyProductName`) — diacritics transliterated/stripped (`Chuột` →
`chuot`), `đ/Đ → d`, lowercase, non-`[a-z0-9]` collapsed to `-`. This is a
**separate** slugifier from `lib/mdx-slug.ts` (used for blog-post heading
IDs, which strips rather than transliterates) — do not cross-use. A name
that slugifies to an empty string is rejected outright.

Dedupe/idempotency (`scripts/ingest/dedupe.ts`) is keyed **`affiliateUrl`
first, slug second** against the existing catalog (`getAllProducts()`, so
dedupe sees exactly what `next build` sees) plus everything already
accepted earlier in the same run:

- **Same `affiliateUrl` as an existing/already-accepted product** → skipped
  as a duplicate (exit 0, not an error). Re-running an identical command is
  a no-op — nothing is added, nothing is overwritten. This also makes
  partial-run recovery safe: re-run the same command and only the
  not-yet-ingested candidates process.
- **Different `affiliateUrl` but the derived slug collides** with an
  existing/already-accepted product → the new candidate is written under a
  disambiguated slug (`<base>-2`, `<base>-3`, …) and flagged
  `needsReview: true`. It is **never** silently merged into or overwritten
  onto the colliding slug. Check the "Disambiguated - needs review" summary
  group before committing — it may be a genuine product variant, or it may
  be a mis-scrape that needs a manual fix.
- The fixture writer (`scripts/ingest/writer.ts`) additionally refuses to
  write if `content/products/<slug>.json` already exists on disk, as a
  defense-in-depth backstop independent of the dedupe logic above.

## Two-step scrape flow

Fleshed out by US00124.
