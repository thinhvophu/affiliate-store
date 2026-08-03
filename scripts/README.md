# Content pipeline (F0012)

Dev tooling for growing the catalog and closing blog-content gaps without
hand-authoring every fixture. Runs via `tsx`, never imported by `app/`,
`components/`, or `lib/`. This file is the end-to-end overview; see
[`scripts/ingest/README.md`](ingest/README.md) for full flag reference on
every step below.

## The full flow

```
1. Scrape / curate  →  2. Ingest  →  3. Scaffold a post  →  4. Write prose  →  5. Publish
```

### 1. Get candidate products

Two sources, per category:

- **Commodity categories** (chuột, bàn phím, tai nghe — high volume, low
  per-item consideration): scrape Shopee. The `/scrape-ingest` slash command
  runs this + step 2 + step 5 together for the recurring content-refresh
  flow (keywords → resolved categories → scrape → ingest → build → commit →
  push straight to `main`; see `.claude/commands/scrape-ingest.md`). It
  writes `data/deals/<date>.json` via the `shopee-affiliate` scrape tool.
- **Higher-consideration categories** (màn hình, ghế — an operator
  hand-picks specific products): write a curated JSON file (see "Curated
  file source" in `scripts/ingest/README.md`) instead of scraping.

### 2. Ingest

```bash
npm run ingest:products -- --category=<slug> --source=scrape --query="<keyword>" --count=<n> [--dry-run]
# or
npm run ingest:products -- --category=<slug> --source=file --path=<curated-file.json> [--dry-run]
```

Validates each candidate (affiliate host allow-list, registered category,
required `Product` fields), stages images locally to
`public/static/images/products/`, dedupes against the existing catalog, and
writes `content/products/<slug>.json`. Always dry-run first to preview.
Full flag/behavior reference: `scripts/ingest/README.md`.

### 3. Scaffold a blog post

Once a category has products, close its post gap:

```bash
npm run scaffold:post -- --category=<slug> [--products=<slug-a[,slug-b]>] [--title=<title>] [--slug=<slug>]
```

Writes `content/posts/<slug>.mdx` with complete, build-passing frontmatter
(`title`/`summary` `"TODO: …"` placeholders, `category`, `publishedAt` =
today, `tags: []`, `coverImage` sourced from a named product's image) plus
one `<ProductCard slug="…" />` per product. Omit `--products` to auto-pick
1–2 products from the category (featured first); pass it explicitly when a
post needs a specific pairing. Full flag reference: `scripts/ingest/README.md`.

### 4. Write the article

Open the scaffolded `.mdx` file and fill in what the scaffold deliberately
leaves as a stub: the real `title`, `summary`, `tags`, and the article prose
around the `<ProductCard>` embeds (replace the
`{/* TODO: viết phần mở bài và nội dung đánh giá */}` marker). This step is
manual by design — see "Out of scope" in `docs/specs/F0012.md`.

### 5. Publish

```bash
npm run build   # must exit 0 before committing anything
git add content/products/ public/static/images/products/ content/posts/ data/deals/
git commit -m "..."
git push origin main   # no feature branch/PR for routine content — see CLAUDE.md "Publishing flow"
```

Vercel auto-deploys on push to `main`.

## Directory map

| Path | Purpose |
| --- | --- |
| `scripts/ingest-products.ts` | Ingestion CLI entry point (step 2). |
| `scripts/ingest/` | Candidate model, validation, slug generator, dedupe, image staging, arg parser, reporter, writer, scrape + curated-file source adapters. Detailed docs live in `scripts/ingest/README.md`. |
| `scripts/scaffold-post.ts` | Blog-post scaffold CLI entry point (step 3). |
| `scripts/scaffold/` | `renderPostStub()` template builder + `selectProductsForCategory()` auto-pick helper, both pure and unit-tested. |

## Exit codes (both CLIs)

- `0` — the run completed. For `ingest:products`, individual rejected/duplicate
  candidates do **not** fail the run.
- non-zero — a fatal error (bad args, unregistered category, unknown product
  slug, refusing to overwrite an existing file, or a malformed input file).
