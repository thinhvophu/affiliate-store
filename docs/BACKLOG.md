# Backlog

Feature-level backlog derived from `docs/spec.md`. User stories (`US####`) will be broken out per feature in a follow-up.

**Priority key:** P0 = required for launch · P1 = soon after launch · P2 = nice-to-have / deferred.

**Numbering:** Features are ordered so that every feature's dependencies have lower IDs. F0001 (Technical Foundation) and F0011 (Build & Deploy Pipeline) retain their original IDs because they already have shipped user stories; the rest were renumbered to flow with the dependency graph.

---

## F0001 — Technical Foundation & Bootstrap

**Goal:** Establish the project scaffolding and shared building blocks every other feature depends on.

**Scope:**

- Next.js (App Router) + TypeScript project initialization
- Folder structure: `app/`, `components/`, `content/`, `lib/`, `static/`, `types/`
- MDX pipeline configured with frontmatter parsing
- Shared TypeScript types (`Product`, `Post`, frontmatter shapes)
- Content loader utilities (read & validate JSON products, list & parse MDX posts)
- Base global styles: CSS reset, CSS variables (`--color-primary` and tokens), breakpoint tokens
- Linting/formatting config (ESLint + Prettier)
- Typed env var access (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`)
- Path aliases (`@/components`, `@/lib`, `@/content`)

**Out of scope:** Any concrete page or UI component — this feature is plumbing only.

**Priority:** P0
**Dependencies:** none
**Spec refs:** §3.1, §3.2, §7.1, §7.2

---

## F0002 — Site Shell & Theme

**Goal:** Consistent global chrome and design tokens shared by every page.

**Scope:**

- Header: logo, site name, primary nav (Trang chủ · Sản phẩm · Bài viết · Về chúng tôi); sticky on scroll (P2)
- Footer: contact, copyright with current year, Privacy Policy & Affiliate Disclosure links, disclosure text
- Two-column layout shell (left panel ~280px + main content)
- Mobile responsiveness: left panel collapses to top filter bar or slide-out drawer
- Theme tokens via CSS variables (default `--color-primary: #EE4D2D`)
- System font stack (no external fonts)
- Breakpoints at 768px and 1280px, mobile-first

**Out of scope:** Dark mode (v2+).

**Priority:** P0
**Dependencies:** F0001
**Spec refs:** §5.1, §5.2, §10

---

## F0003 — Affiliate Link Routing

**Goal:** Every product CTA reliably opens its Shopee affiliate URL in a new tab with correct link semantics, everywhere a product surfaces.

**Scope:**

- All product cards, detail-page CTA, and inline `<ProductCard />` use the canonical affiliate-link component
- `target="_blank"` and `rel="noopener noreferrer sponsored"` on every affiliate anchor
- Whole product card is clickable (not just the CTA button)
- Centralized helper so click tracking (F0007) can hook in without per-call-site changes

**Out of scope:** Click-redirect interstitials, server-side link cloaking.

**Priority:** P0
**Dependencies:** F0001
**Spec refs:** §1, §5.3, §5.4, §6.3

---

## F0004 — Product Catalog

**Goal:** Browsable product directory backed by JSON files, surfaced via listing, category, and detail pages.

**Scope:**

- Product listing `/san-pham/` with filters (category, price, brand), sort, pagination 24/page
- Category pages `/danh-muc/[category]/` with filtered grid + 100–200 word intro copy
- Product detail `/san-pham/[slug]/` with image gallery, short description, specs table, price, prominent affiliate CTA, related products (3–4)
- Product card component used across listing, category, related sections, and inline blog embeds
- Responsive grid: 2 cols mobile / 3 tablet / 4 desktop
- Vietnamese price formatting (`₫1.200.000`)
- Crawlable pagination via `?page=N` query params

**Out of scope:** Search, real-time price sync, user-saved products (v2+).

**Priority:** P0
**Dependencies:** F0001, F0002, F0003
**Spec refs:** §4, §5.3, §5.4, §7.1, §10

---

## F0005 — Compliance & Disclosure

**Goal:** Meet Vietnamese consumer-protection norms and Google quality guidelines for affiliate sites.

**Scope:**

- Vietnamese affiliate disclosure block visible in footer on every page
- Same disclosure rendered at the top of every blog post
- Privacy Policy page
- Affiliate Disclosure page (long-form version of the footer text)
- Footer links to both pages

**Out of scope:** Cookie consent banner (deferred until GA is actually enabled in production).

**Priority:** P0
**Dependencies:** F0002
**Spec refs:** §8

---

## F0006 — Editorial Content

**Goal:** SEO-driving blog and buying-guide system authored in MDX.

**Scope:**

- Blog listing `/bai-viet/` ordered by `publishedAt` desc, 12/page, category/tag filter in left panel
- Blog post `/bai-viet/[slug]/` with hero image, MDX body, sticky TOC (from headings), Vietnamese date format (`02 tháng 5, 2026`), related posts (3)
- `<ProductCard slug="..." />` MDX component for inline affiliate cards
- Frontmatter schema validation (title, summary, publishedAt, category, tags, coverImage)
- Read time estimate (P2)

**Out of scope:** Comments, UGC, search across posts.

**Priority:** P0
**Dependencies:** F0001, F0002, F0004 (ProductCard)
**Spec refs:** §4, §5.5, §5.6, §7.2, §7.3

---

## F0007 — Analytics & Click Tracking

> ⚠️ **Never specced, never built.** This feature received no `docs/specs/F0007.md` and no user stories; the 2026-08-12 readiness audit confirmed zero `gtag` / `affiliate_click` hits in application code — only the `F0003` `data-*` seam on `<AffiliateLink>` exists. **Its entire scope is delivered by F0014 (US00143 + US00144).** Treat F0007 as implemented when those ship; it gets no separate spec file. Scope below is retained for traceability.

**Goal:** Measure traffic and identify top-converting products without code changes at launch.

**Scope:**

- GA4 integration component, conditionally rendered only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
- Never loaded in development
- `affiliate_click` GA4 event fired on every affiliate link click with `product_name`, `product_category`, `destination_url`
- Hook integrates with the centralized affiliate link from F0003

**Out of scope:** Custom analytics backend, A/B testing.

**Priority:** P2 (architecture must be ready at launch even if env var is empty)
**Dependencies:** F0001, F0003
**Spec refs:** §6.1, §6.3

---

## F0008 — Homepage

**Goal:** Primary entry point that surfaces featured products and orients visitors arriving from social or organic search.

**Scope:**

- Hero / intro section
- Featured product picks (sourced from `featured: true` in product JSON)
- Category highlights (links into `/danh-muc/[category]/`)
- Latest blog posts strip (3–4)
- Reuses product card and theme from F0002/F0004

**Out of scope:** Personalization, recommendations.

**Priority:** P0
**Dependencies:** F0002, F0004, F0006
**Spec refs:** §4

---

## F0009 — SEO & Discoverability

**Goal:** Make every page rankable, crawlable, and shareable from day one.

**Scope:**

- Per-page `<title>`, `<meta description>`, and canonical URL
- Open Graph tags (`og:title`, `og:description`, `og:image`)
- JSON-LD: `Product` on product pages, `Article` on blog posts, `BreadcrumbList` everywhere
- Visible breadcrumb component (powers the JSON-LD too)
- `sitemap.xml` auto-generated at build
- `robots.txt` allowing all + sitemap pointer
- All images via `next/image`
- Semantic HTML: single `<h1>`, proper hierarchy, `<main>`/`<article>`/`<nav>`
- Pagination uses `?page=N` with correct canonical strategy

**Out of scope:** hreflang / multilingual SEO (v1 is Vietnamese-only).

**Priority:** P0
**Dependencies:** F0001, F0004, F0006
**Spec refs:** §3.5, §5.4, §5.6, §6.2

---

## F0010 — About Page

**Goal:** Trust-signal page at `/ve-chung-toi/` describing the site and its editorial stance.

**Scope:**

- Static page with site mission, who we are, how we pick products
- Affiliate disclosure restated
- Contact info

**Out of scope:** Team bios, hiring, press.

**Priority:** P1
**Dependencies:** F0002, F0005
**Spec refs:** §4, §9

---

## F0011 — Build & Deploy Pipeline

**Goal:** Reliable, automated build and deploy with scheduled refresh.

**Scope:**

- Vercel project connected to repo; push to `main` auto-deploys
- `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_GA_MEASUREMENT_ID` configured per environment
- GitHub Actions cron `.github/workflows/scheduled-deploy.yml` (Mon 02:00 UTC) calling Vercel deploy hook
- Manual `workflow_dispatch` trigger available
- Core Web Vitals monitored via Vercel dashboard

**Out of scope:** Multi-environment staging, preview-deploy gating, custom CDN.

**Priority:** P0
**Dependencies:** F0001
**Spec refs:** §3.3, §3.4, §9

---

## F0012 — Automated Content Ingestion Pipeline

**Goal:** Scriptable, re-runnable pipeline to grow the product catalog and close blog-content gaps without hand-authoring every fixture.

**Scope:**

- CLI script (`scripts/ingest-products.ts`) sourcing candidates via the `shopee-affiliate` scrape tool (commodity categories) or a curated manual file (higher-consideration categories)
- Validates every candidate against existing invariants before writing: affiliate host allow-list (`lib/affiliate.ts`), registered category (`lib/categories.ts`), required `Product` fields
- Downloads product images locally to `public/static/images/products/` (no hotlinking — `next.config.ts` has no `images.remotePatterns`)
- Dedupe/idempotent re-runs keyed on `affiliateUrl`/slug
- Companion MDX scaffold mode for categories with a post-count gap (frontmatter + `<ProductCard>` embeds; human writes the body)

**Out of scope:** Automated blog-post prose generation, automated price/stock refresh on existing products, automatic category creation, git commit/PR/deploy steps, curation judgment for hand-picked categories.

**Priority:** P2
**Dependencies:** F0001, F0004, F0006
**Spec refs:** docs/specs/F0012.md

---

## F0013 — Launch Content Remediation

**Goal:** Bring the shipped content data up to launch quality — the 2026-08-12 readiness audit found the codebase ready and the data not.

**Scope:**

Stories are numbered in dependency order — each consumes the output of the ones before it:

- **US00131** — ✅ Done. Cleared the §9 catalog minimum (10→15 products, every category ≥3) and cleaned the scraped fixtures: editorial `name` (was raw Shopee titles), ≤60-char `slug` (was 79–98 chars), original `description` (was verbatim Shopee copy, no "Mô tả chi tiết:"/"Đặc điểm kỹ thuật:" boilerplate). `lib/products.test.ts` guards the cleaned state going forward; `scripts/rename-product.ts` is the reusable slug-rename tool the cleanup produced
- **US00132** — ✅ Done. Deferred the 2 zero-product categories (`man-hinh-gaming`, `ghe-gaming`) — removed from `CATEGORIES` (and thus from `sitemap.xml`, the homepage, both filter panels, and category static generation) into `DEFERRED_CATEGORIES` in `lib/categories.ts`, copy preserved for a one-line re-add once stocked. Added the `assertCategoriesStocked()` build-time guard (called from `generateStaticParams` in `app/danh-muc/[category]/page.tsx`) that fails `next build` naming any registered category under `MIN_PRODUCTS_PER_CATEGORY` (3) products
- **US00133** — ✅ Done. The 5 posts carrying the 1×1 / 332-byte placeholder covers (`logitech-g102-lightsync.jpg`, `keychron-k2-v2.jpg` — orphans from the mock-product cleanup) were deleted outright (2026-08-25 decision, superseding the original "replace the covers" scope), which removed the orphan image files in the same change. Added the build-time guard: `lib/image-meta.ts` (`readImageSize`/`assertMinShortSide`/`MIN_COVER_IMAGE_SHORT_SIDE_PX=600`, the one place that reads image dimensions) wired into `lib/posts.ts`'s `getAllPosts()` — fails `next build` naming the post slug and path for a missing/unreadable/undersized cover. Also fixed `lib/seo.ts`'s `buildPageMetadata` to resolve real `og:image` width/height instead of hardcoding `1200×630` for every image (omitted when unresolvable)
- **US00134** — ✅ Done. Rewrote the **4 posts remaining in `content/posts/`** (the 3 originally-audited posts — `ban-phim-co-cho-nguoi-moi`, `top-5-chuot-gaming-gia-re`, `danh-gia-chuot-gaming-g305-deathadder` — plus `chuot-gaming-logitech-g402-oem-wired`, added after the plan was drafted) to ≥800 words each, D6-shaped (selection criteria → per-pick sections with pros/cons and a `<ProductCard>` embed → comparison table → recommendation), with ≥2 `h2` and no fabricated specs — every claim traces to the product fixture's `specs`. `lib/format.ts` now exports `countWords()` + `MIN_POST_WORDS=800` (the single depth-floor chokepoint, shared with `readingTimeVi`); `lib/posts.test.ts` enforces it plus non-placeholder frontmatter, non-empty `tags`, a genuine 50–160-char `summary`, ≥1 embed and ≥2 `h2` — with **no exemption list**, per the 2026-08-22 decision. **Note:** the catalog now has only 4 posts, below the §9 "at least 5 blog posts" launch checklist item — adding a 5th post is ongoing editorial cadence, explicitly out of F0013's scope, and is flagged here rather than silently left unchecked
- **US00135** — ✅ Done. **Domain registered 2026-09-02: `muagear.com`** (final Production value `https://www.muagear.com` — apex 308-redirects into `www`, which serves `200` directly; see plan §6 step 4a). Half A (PR #72, merged): `scripts/verify-canonical.ts` (`npm run verify:canonical -- --base=<url>`) added and unit-tested, confirmed to correctly fail against a local build carrying the `example.com` placeholder; `.env.example`/CI comments make the placeholder unambiguous (D4 — no build-time rejection guard); site branding renamed `lib/site.ts`'s `SITE_NAME` + `package.json`'s `"name"` `"aff-store"` → `"MuaGear"`/`"muagear"`, plus every other rendered surface that had it hardcoded (Footer copyright, About/Privacy/Affiliate-Disclosure page copy, category intros in `lib/categories.ts`) — the plan's original assumption that `SITE_NAME` was already a single chokepoint was wrong. Half B (operator, 2026-09-02): Vercel Production `NEXT_PUBLIC_SITE_URL` set to `https://www.muagear.com`, redeployed, `npm run verify:canonical -- --base=https://www.muagear.com` green (16/16 checks). This closes F0013. Plan: `docs/plans/US00135.md`

**Out of scope:** Analytics/CI/formatting/Search Console (F0014); AdSense integration; automated prose generation; ongoing editorial cadence; redirects for changed product URLs (site not yet indexed under the production domain).

**Priority:** P0 (launch blocker)
**Dependencies:** F0004, F0006, F0009, F0012
**Spec refs:** docs/specs/F0013.md · §7.1, §7.3, §9

---

## F0014 — Launch Technical Readiness

**Goal:** Close the measurement and verification gaps around an otherwise launch-ready application — the technical counterpart to F0013.

**Scope:**

Listed in execution order — the story numbers are a topological sort of the dependency graph (renumbered 2026-09-03; see `docs/specs/F0014.md` § "Story numbering"):

- **US00141** — `test` job added to `.github/workflows/ci.yml` — the suite exists but CI runs only typecheck/lint/build, so every guard can regress on a green PR
- **US00142** — repository-wide Prettier baseline as an isolated commit + `.git-blame-ignore-revs` entry, plus a `format` CI job
- **US00143** — GA4 integration mounted in the root layout, rendered only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, never in development, without flipping any route off SSG — **delivers F0007's GA4 scope**
- **US00144** — delegated `affiliate_click` GA4 event fired from the existing `F0003 ↔ F0007` `data-*` contract on `<AffiliateLink>`, no per-call-site changes — **delivers F0007's click-tracking scope**
- **US00145** — Google Search Console property + ownership verification + sitemap submission (DNS TXT preferred; meta-tag path goes through `lib/env.ts` → `buildRootMetadata()`)

**Out of scope:** Google AdSense (spec §2 P1, still unowned); custom analytics backend, A/B testing, cookie-consent UI; content/catalog fixes (F0013); any change to the SSG-only constraint; redesigning the Prettier ruleset.

**Priority:** P1 (US00145 is P0 — on the §9 launch-day checklist)
**Dependencies:** F0001, F0003, F0009, F0011 · supersedes F0007
**Spec refs:** docs/specs/F0014.md · §3.4, §6.1, §6.2, §6.3, §9
