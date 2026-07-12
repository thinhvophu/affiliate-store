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

Three labelled groups — `Added`, `Skipped - duplicate`, `Rejected` — each
line naming the candidate and, for skips/rejections, the reason — followed
by a footer line: `requested N, ingested M, skipped K, rejected J`.

## Two-step scrape flow

Fleshed out by US00124.
