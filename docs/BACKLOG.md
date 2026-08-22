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

> ⚠️ **Never specced, never built.** This feature received no `docs/specs/F0007.md` and no user stories; the 2026-08-12 readiness audit confirmed zero `gtag` / `affiliate_click` hits in application code — only the `F0003` `data-*` seam on `<AffiliateLink>` exists. **Its entire scope is delivered by F0014 (US00141 + US00142).** Treat F0007 as implemented when those ship; it gets no separate spec file. Scope below is retained for traceability.

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
- **US00132** — resolve the 2 zero-product categories (`man-hinh-gaming`, `ghe-gaming`) still emitted into `sitemap.xml` and linked from the homepage
- **US00133** — replace the 1×1 / 332-byte placeholder cover images referenced by 5 of 8 posts (`logitech-g102-lightsync.jpg`, `keychron-k2-v2.jpg` — orphans from the mock-product cleanup) and delete the orphan files; no two posts share a cover; plus a build-time assertion in `lib/posts.ts` that a post's `coverImage` resolves to a real, non-degenerate file — same fail-loudly pattern as `assertAffiliateUrl` / `assertCategoryRegistered`
- **US00134** — rewrite **all 8 posts** to ≥800 words, each carrying ≥1 `<ProductCard>` embed — 4 of 8 posts have no affiliate embed at all. Measured with the project's own `countWords()`, the 5 thin posts are 53–64 words and the other 3 only 237/288/514, so none clears the floor; the 2026-08-22 decision applies it to all 8 with no exemption list
- **US00135** — verify `NEXT_PUBLIC_SITE_URL` end-to-end (Vercel Production value + deployed canonical / OG / JSON-LD / sitemap output); `.env.local`, CI and the built sitemap currently all say `https://example.com`. **Last**, not first: setting the real domain starts crawling, and from that point the URL changes in US00131/US00132 would need redirects an SSG-only site cannot serve. The repo-hygiene + `verify:canonical` half has no dependencies and can be built any time

**Out of scope:** Analytics/CI/formatting/Search Console (F0014); AdSense integration; automated prose generation; ongoing editorial cadence; redirects for changed product URLs (site not yet indexed under the production domain).

**Priority:** P0 (launch blocker)
**Dependencies:** F0004, F0006, F0009, F0012
**Spec refs:** docs/specs/F0013.md · §7.1, §7.3, §9

---

## F0014 — Launch Technical Readiness

**Goal:** Close the measurement and verification gaps around an otherwise launch-ready application — the technical counterpart to F0013.

**Scope:**

- GA4 integration mounted in the root layout, rendered only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, never in development, without flipping any route off SSG — **delivers F0007's GA4 scope**
- Delegated `affiliate_click` GA4 event fired from the existing `F0003 ↔ F0007` `data-*` contract on `<AffiliateLink>`, no per-call-site changes — **delivers F0007's click-tracking scope**
- `test` job added to `.github/workflows/ci.yml` — 121 tests exist but CI runs only typecheck/lint/build, so every guard can regress on a green PR
- Google Search Console property + ownership verification + sitemap submission (DNS TXT preferred; meta-tag path goes through `lib/env.ts` → `buildRootMetadata()`)
- Repository-wide Prettier baseline (126 files currently unformatted) as an isolated commit + `.git-blame-ignore-revs` entry, plus a `format` CI job

**Out of scope:** Google AdSense (spec §2 P1, still unowned); custom analytics backend, A/B testing, cookie-consent UI; content/catalog fixes (F0013); any change to the SSG-only constraint; redesigning the Prettier ruleset.

**Priority:** P1 (US00144 is P0 — on the §9 launch-day checklist)
**Dependencies:** F0001, F0003, F0009, F0011 · supersedes F0007
**Spec refs:** docs/specs/F0014.md · §3.4, §6.1, §6.2, §6.3, §9
