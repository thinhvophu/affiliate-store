# Backlog

Feature-level backlog derived from `docs/spec.md`. User stories (`US####`) will be broken out per feature in a follow-up.

**Priority key:** P0 = required for launch · P1 = soon after launch · P2 = nice-to-have / deferred.

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

## F0002 — Product Catalog

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
**Dependencies:** F0001, F0006
**Spec refs:** §4, §5.3, §5.4, §7.1, §10

---

## F0003 — Editorial Content

**Goal:** SEO-driving blog and buying-guide system authored in MDX.

**Scope:**

- Blog listing `/bai-viet/` ordered by `publishedAt` desc, 12/page, category/tag filter in left panel
- Blog post `/bai-viet/[slug]/` with hero image, MDX body, sticky TOC (from headings), Vietnamese date format (`02 tháng 5, 2026`), related posts (3)
- `<ProductCard slug="..." />` MDX component for inline affiliate cards
- Frontmatter schema validation (title, summary, publishedAt, category, tags, coverImage)
- Read time estimate (P2)

**Out of scope:** Comments, UGC, search across posts.

**Priority:** P0
**Dependencies:** F0001, F0002 (ProductCard), F0006
**Spec refs:** §4, §5.5, §5.6, §7.2, §7.3

---

## F0004 — Affiliate Link Routing

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

## F0005 — SEO & Discoverability

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
**Dependencies:** F0001, F0002, F0003
**Spec refs:** §3.5, §5.4, §5.6, §6.2

---

## F0006 — Site Shell & Theme

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

## F0007 — Analytics & Click Tracking

**Goal:** Measure traffic and identify top-converting products without code changes at launch.

**Scope:**

- GA4 integration component, conditionally rendered only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
- Never loaded in development
- `affiliate_click` GA4 event fired on every affiliate link click with `product_name`, `product_category`, `destination_url`
- Hook integrates with the centralized affiliate link from F0004

**Out of scope:** Custom analytics backend, A/B testing.

**Priority:** P2 (architecture must be ready at launch even if env var is empty)
**Dependencies:** F0001, F0004
**Spec refs:** §6.1, §6.3

---

## F0008 — Compliance & Disclosure

**Goal:** Meet Vietnamese consumer-protection norms and Google quality guidelines for affiliate sites.

**Scope:**

- Vietnamese affiliate disclosure block visible in footer on every page
- Same disclosure rendered at the top of every blog post
- Privacy Policy page
- Affiliate Disclosure page (long-form version of the footer text)
- Footer links to both pages

**Out of scope:** Cookie consent banner (deferred until GA is actually enabled in production).

**Priority:** P0
**Dependencies:** F0006
**Spec refs:** §8

---

## F0009 — Homepage

**Goal:** Primary entry point that surfaces featured products and orients visitors arriving from social or organic search.

**Scope:**

- Hero / intro section
- Featured product picks (sourced from `featured: true` in product JSON)
- Category highlights (links into `/danh-muc/[category]/`)
- Latest blog posts strip (3–4)
- Reuses product card and theme from F0002/F0006

**Out of scope:** Personalization, recommendations.

**Priority:** P0
**Dependencies:** F0002, F0003, F0006
**Spec refs:** §4

---

## F0010 — About Page

**Goal:** Trust-signal page at `/ve-chung-toi/` describing the site and its editorial stance.

**Scope:**

- Static page with site mission, who we are, how we pick products
- Affiliate disclosure restated
- Contact info

**Out of scope:** Team bios, hiring, press.

**Priority:** P1
**Dependencies:** F0006, F0008
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
