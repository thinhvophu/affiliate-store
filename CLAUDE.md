@AGENTS.md

# CLAUDE.md

Operational cheat sheet for this project.

**Next.js Initialization**: When starting work on this Next.js project, automatically call the `init` tool from next-devtools-mcp FIRST. This establishes proper context and ensures all Next.js queries use official documentation.

- **Spec (source of truth):** `docs/spec.md`
- **Feature backlog:** `docs/BACKLOG.md`

## Project

Vietnamese-language, SEO-first affiliate storefront for gaming peripherals & tech gadgets. Monetized via Shopee affiliate links + Google AdSense. Content-driven only — **no auth, no cart, no checkout**. Every product click opens a Shopee affiliate URL in a new tab.

## Stack

- **Framework:** Next.js (App Router), **SSG only** — all pages pre-rendered at build time
- **Content:** MDX for posts, JSON for products (no CMS)
- **Hosting:** Vercel (push to `main` auto-deploys)
- **Scheduled rebuild:** GitHub Actions cron at `.github/workflows/scheduled-deploy.yml` (Mon 02:00 UTC) hits Vercel deploy hook

## Codebase structure

Living map of the repository. **Update this section** whenever a story adds/moves/renames files or introduces new conventions.

> Last updated: US00047 (RelatedProducts section + getRelatedProducts helper for the product detail page; components/RelatedProducts.tsx + components/RelatedProducts.module.css)

### Top-level layout

```
aff-store/
├── app/                 # Next.js App Router (routes, layouts, route handlers)
│   ├── layout.tsx       # Root layout — <html lang="vi">, imports globals.css, mounts <SkipLink />, <Header />, <main>, <Footer />, <SpeedInsights />
│   ├── globals.css      # Global CSS reset + design tokens (US00016 + F0002 surface tokens)
│   ├── page.tsx         # Homepage (/)
│   ├── danh-muc/        # /danh-muc/ routes
│   │   └── [category]/  # Dynamic category segment
│   │       ├── page.tsx                    # Category page — SSG per registered category, <CategoryNav> left panel (US00045)
│   │       ├── not-found.tsx               # Vietnamese 404 for unknown category slugs (US00045)
│   │       └── category-page.module.css    # Page-scoped layout — heading + intro typography (US00045)
│   └── san-pham/        # /san-pham/ routes
│       ├── page.tsx     # Product listing — SSG, passes all products to ProductListingClient (US00043)
│       └── [slug]/      # Dynamic product-detail segment
│           ├── page.tsx                    # Product detail page — SSG per slug, generateStaticParams + notFound() (US00046)
│           ├── not-found.tsx               # Vietnamese 404 for unknown product slugs (US00046)
│           └── product-detail.module.css   # Page-scoped layout — 2-col grid ≥1024px, specs <dl>, CTA pill (US00046)
├── components/          # Reusable React components (PascalCase.tsx; co-locate styles as <Name>.module.css)
│   ├── Footer.tsx           # Server Component — 4-column footer, affiliate disclosure (US00022)
│   ├── Footer.module.css    # Scoped styles for the Footer
│   ├── Header.tsx           # Server Component — orange brand band, logo, site name
│   ├── HeaderNav.tsx        # "use client" — active-route nav links (usePathname)
│   ├── HeaderMobileMenu.tsx # "use client" — hamburger trigger + mobile nav panel
│   ├── Header.module.css    # Scoped styles for the Header
│   ├── HeaderStickyShadow.tsx   # "use client" — sticky-shadow toggle for <Header />; IntersectionObserver sentinel (US00026)
│   ├── ShellLayout.tsx      # Server Component — opt-in two-column shell (leftPanel + children) (US00024)
│   ├── ShellLayout.module.css # Scoped styles for ShellLayout; CSS Grid, card chrome, responsive breakpoints
│   ├── SkipLink.tsx         # Server Component — skip-to-main-content link (US00023)
│   ├── AffiliateLink.tsx        # Server Component — canonical affiliate-link primitive; baked target/rel + F0003↔F0007 seam attributes (US00031, US00033)
│   ├── AffiliateLink.module.css # Scoped styles for AffiliateLink — visually-hidden srOnly + .card whole-card surface (hover, focus-visible, prefers-reduced-motion gate) (US00031 + US00032)
│   ├── ProductCard.tsx          # Server Component — standard product summary card, whole-card AffiliateLink (US00042)
│   ├── ProductCard.module.css   # Scoped styles for ProductCard — flex column, image frame, category badge, name clamp, CTA pill (US00042)
│   ├── ProductListingClient.tsx      # "use client" — paginated product grid, reads ?page via useSearchParams (US00043)
│   ├── ProductListingClient.module.css # Grid CSS (2/3/4 cols), empty/error state (US00043)
│   ├── Pagination.tsx                # Shared — crawlable page-link nav; accepts basePath prop; reused by /san-pham/ and /danh-muc/[category]/ (US00043)
│   ├── Pagination.module.css         # Pagination styles — flex row, touch targets, active state (US00043)
│   ├── CategoryNav.tsx               # Server Component — sibling-category list for the left panel (US00045)
│   ├── CategoryNav.module.css        # Scoped styles for CategoryNav — vertical link list (US00045)
│   ├── CategoryPageClient.tsx        # "use client" — paginated category grid; reads ?page via useSearchParams; Suspense-wrapped (US00045)
│   ├── CategoryPageClient.module.css # Grid CSS (2/3/4 cols), empty/pagination styles (US00045)
│   ├── ProductGallery.tsx            # "use client" — single/multi-image gallery; useState activeIndex; thumbnail aria-pressed (US00046)
│   ├── ProductGallery.module.css     # Scoped styles — main 1:1 frame (object-fit: contain), thumbnail row, active-border (US00046)
│   ├── RelatedProducts.tsx           # Server Component — "Sản phẩm liên quan" section on product detail page (US00047)
│   └── RelatedProducts.module.css    # Scoped grid styles for RelatedProducts; 2/3/3–4-col responsive grid (US00047)
├── content/             # Static content sources
│   ├── products/        # *.json — one file per product (25 fixtures added in US00043; see Product JSON shape)
│   └── posts/           # *.mdx — one file per blog post
├── public/              # Static assets served at the root (Next.js convention)
│   └── static/images/products/ # Product images (established in US00043; referenced as /static/images/products/<slug>.jpg)
├── lib/                 # Pure utilities, data loaders, formatters (no React)
│   ├── affiliate.ts     # Shopee affiliate-URL allow-list + assertAffiliateUrl helper (US00034)
│   ├── categories.ts    # CATEGORIES map + getCategoryMeta + assertCategoryRegistered (US00045)
│   ├── disclosures.ts   # AFFILIATE_DISCLOSURE_VI constant — shared with F0005 page + F0006 posts (US00022)
│   ├── format.ts        # formatVnd() — single chokepoint for Vietnamese price rendering (US00041)
│   ├── nav-items.ts     # NAV_ITEMS constant — the four primary nav routes (typed)
│   ├── products.ts      # getAllProducts(), getProductBySlug(), getRelatedProducts() — calls assertAffiliateUrl() + assertCategoryRegistered() + images.length ≥ 1 at build time
│   └── posts.ts         # getAllPosts(), getPostBySlug() — reads content/posts/*.mdx
├── static/              # Static assets served at /static/*
│   └── images/{products,blog}/
├── types/               # Shared TypeScript types
│   ├── product.ts       # Product interface (canonical JSON shape)
│   ├── post.ts          # PostFrontmatter + Post interfaces (MDX frontmatter + content)
│   └── index.ts         # Barrel: import { Product, Post, PostFrontmatter } from "@/types"
├── docs/                # Spec, backlog, story specs, plans
│   ├── spec.md          # Source of truth
│   ├── BACKLOG.md
│   ├── specs/           # User-story specs (USxxxxx.md, Fxxxx.md)
│   └── plans/           # Approved implementation plans
├── .github/workflows/   # CI + scheduled rebuild
├── next.config.ts
├── tsconfig.json        # Path alias: @/* → ./*
├── package.json         # Node ≥22.11
├── CLAUDE.md            # This file — project rules
├── AGENTS.md            # Agent rules (read Next.js docs before coding)
└── README.md            # Public-facing overview
```

### Module conventions

- **Routes** live under `app/<vietnamese-slug>/`. Use `page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx` per Next.js App Router.
- **Components** in `components/<Name>.tsx`. Server Components by default; add `"use client"` only when needed.
- **Component styles** co-locate as `<Name>.module.css` next to the component file (CSS Modules, scoped). First instance: `components/Footer.tsx` + `components/Footer.module.css` (US00022).
- **Data loaders / formatters** in `lib/` (e.g., `lib/products.ts`, `lib/posts.ts`, `lib/format.ts`). No JSX in `lib/`.
- **Types** in `types/<domain>.ts` (e.g., `types/product.ts`, `types/post.ts`). Barrel at `types/index.ts` — always import from `@/types`.
- **Content** is read at build time from `content/`. No DB, no CMS.
- **Imports** use the `@/*` alias (e.g., `import { getProducts } from "@/lib/products"`). Avoid deep relative paths.
- **Affiliate URLs** are validated in one place: `lib/affiliate.ts`. The product loader (`lib/products.ts`) calls `assertAffiliateUrl(url, slug)` at build time, so any product JSON with a non-Shopee or malformed `affiliateUrl` fails `next build` with the offending slug named. No file outside `lib/affiliate.ts` may parse, trim, or rewrite an affiliate URL.
- **Categories are registered.** Every distinct `product.category` must have an entry in `lib/categories.ts` (slug + Vietnamese display name + 100–200 word intro + ≤160 char meta description). The product loader calls `assertCategoryRegistered()` at build time and fails with the offending slug if a category is missing. No file outside `lib/categories.ts` may parse, normalize, or ad-hoc look up category metadata.
- **Prices** are formatted in one place: `lib/format.ts`. Every product surface (`<ProductCard />`, the detail page CTA price, the related-products row, future homepage featured picks) renders prices via `formatVnd(amount)`. No file outside `lib/format.ts` may use `Intl.NumberFormat`, `toLocaleString`, or hand-rolled `"₫"` concatenation on a price value. Switching to `Intl.NumberFormat` later would re-introduce ICU-version drift between build environments; if a future change is needed, edit `lib/format.ts` only.

### Route map (planned — see "Routes" section below for SEO/render strategy)

| Path                   | Source file (planned)              |
| ---------------------- | ---------------------------------- |
| `/`                    | `app/page.tsx` ✅                  |
| `/san-pham`            | `app/san-pham/page.tsx` ✅         |
| `/san-pham/[slug]`     | `app/san-pham/[slug]/page.tsx` ✅  |
| `/danh-muc/[category]` | `app/danh-muc/[category]/page.tsx` ✅ |
| `/bai-viet`            | `app/bai-viet/page.tsx`            |
| `/bai-viet/[slug]`     | `app/bai-viet/[slug]/page.tsx`     |
| `/ve-chung-toi`        | `app/ve-chung-toi/page.tsx`        |
| `/sitemap.xml`         | `app/sitemap.ts`                   |
| `/robots.txt`          | `app/robots.ts`                    |

✅ = implemented · others to be created by upcoming stories.

## Routes (Vietnamese slugs — keep as-is)

```
/                       Homepage
/san-pham/              Product list (filter grid, 24/page)
/san-pham/[slug]/       Product detail (thin, affiliate CTA)
/danh-muc/[category]/   Category page (filtered grid + 100–200w intro)
/bai-viet/              Blog list (12/page)
/bai-viet/[slug]/       Blog post / buying guide (primary SEO surface)
/ve-chung-toi/          About
/sitemap.xml            Auto-generated
/robots.txt             Allow all + sitemap pointer
```

## Content layout

- `content/products/*.json` — one product per file
- `content/posts/*.mdx` — one post per file
- `static/images/products/`, `static/images/blog/` — assets

### Product JSON shape

```json
{
  "slug": "logitech-g102-lightsync",
  "name": "Chuột Gaming Logitech G102 Lightsync",
  "category": "chuot-gaming",
  "brand": "Logitech",
  "price": 390000,
  "affiliateUrl": "https://shope.ee/...",
  "images": ["/static/images/products/logitech-g102.jpg"],
  "description": "...",
  "specs": { "DPI": "200–8000", "Sensor": "Optical", "Weight": "85g" },
  "publishedAt": "2026-05-01",
  "featured": true
}
```

### MDX post frontmatter

```yaml
---
title: "Top 5 Tai Nghe Gaming Dưới 500k Năm 2026"
summary: "..."
publishedAt: "2026-05-02"
category: "tai-nghe"
tags: ["tai nghe gaming", "budget", "review"]
coverImage: "/static/images/blog/tai-nghe-gaming-500k.png"
---
```

Posts can embed `<ProductCard slug="..." />` to render an affiliate card inline.

## SEO non-negotiables

- Unique `<title>` and `<meta description>` per page
- Canonical URL on every page
- Open Graph tags (title, description, image)
- **JSON-LD:** `Product` on product pages · `Article` on blog posts · `BreadcrumbList` everywhere
- All images via `next/image`
- Semantic HTML: one `<h1>` per page, proper hierarchy, `<main>`/`<article>`/`<nav>`
- Pagination uses `?page=N` query params (crawlable) with correct canonical — **not** infinite scroll
- Category pages need 100–200 words of intro copy above the grid

## UI / theme rules

- **Layout:** Header · (Left panel ~280px + Main) · Footer
  - Left panel = filters (product list) / TOC (blog post) / categories (blog list)
  - Mobile: left panel collapses to top filter bar or drawer
- **Style:** Minimalist, low visual noise
- **Color:** `--color-primary` CSS variable, default `#EE4D2D` (Shopee orange)
- **Font:** System font stack only — no external fonts
- **Breakpoints:** mobile-first; 768px (tablet), 1280px (desktop)
- **Grid:** 2 cols mobile / 3 tablet / 4 desktop on product list
- **Affiliate links:** ALWAYS `target="_blank" rel="noopener noreferrer sponsored"`
- **Price format:** `₫1.200.000` (dot thousands separator, ₫ prefix)
- **Date format:** `02 tháng 5, 2026`

## Affiliate links

All affiliate destinations on the site route through `<AffiliateLink>` (`components/AffiliateLink.tsx`). The primitive bakes in `target="_blank"`, `rel="noopener noreferrer sponsored"`, the Vietnamese screen-reader label, and the F0003 ↔ F0007 click-tracking contract.

**F0003 ↔ F0007 contract (US00033).** Every `<AffiliateLink>` anchor carries four `data-*` attributes that F0007's delegated click listener relies on. These names are a public API:

- `data-affiliate-link` — presence flag (selector hook for the listener)
- `data-product-name` — sourced from the `productName` prop
- `data-product-category` — sourced from the `productCategory` prop
- `data-destination-url` — sourced from the `href` prop (mirrors the href)

Renaming any of them is a breaking change and must update both `<AffiliateLink>` and the F0007 listener in the same PR. No other component in the codebase may emit `data-affiliate-link`.

**Whole-card pattern (US00032).** To make an entire card surface clickable, consumers import the co-located styles and pass `className`:

```tsx
import { AffiliateLink } from "@/components/AffiliateLink";
import affiliateStyles from "@/components/AffiliateLink.module.css";

<AffiliateLink className={affiliateStyles.card} … >…</AffiliateLink>
```

When wrapping a full card subtree, do **not** nest interactive elements inside the children — the CTA must be a styled `<span>` (e.g., with `data-affiliate-cta`), never `<button>` or a nested `<a>`. Nested interactives produce invalid HTML, multiply tab stops, and break the single-link click target.

**No raw affiliate anchors (US00034).** All affiliate destinations on the site must route through `<AffiliateLink>` (`components/AffiliateLink.tsx`). Raw `<a href="https://shope.ee/…">` — or any anchor whose host is `shopee.vn`, `shopee.ee`, or `shope.ee` — outside `<AffiliateLink>` is **disallowed**; block such PRs on review. URL validation, parsing, and any future normalization live in `lib/affiliate.ts`; no file outside that module may parse, trim, or rewrite an affiliate URL. Allow-listed hosts: `shopee.vn`, `shopee.ee`, `shope.ee` (exact host match; subdomains and `www.` are intentionally excluded so unexpected hosts surface loudly).

## Required disclosures

Vietnamese affiliate disclosure must appear in the **footer of every page** AND at the **top of every blog post**:

> _"Các liên kết sản phẩm trên trang này là liên kết tiếp thị liên kết. Chúng tôi có thể nhận hoa hồng khi bạn mua hàng qua các liên kết này, không phát sinh thêm chi phí cho bạn."_

Footer must also link to: Privacy Policy, Affiliate Disclosure.

## Env vars

| Name                            | Purpose                            | Required |
| ------------------------------- | ---------------------------------- | -------- |
| `NEXT_PUBLIC_SITE_URL`          | Canonical/sitemap base URL         | Yes      |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 ID; empty = analytics disabled | No       |

GA4 component must be conditionally rendered only when the ID is set, and never loaded in development. Affiliate clicks are tracked as GA4 event `affiliate_click` with `product_name`, `product_category`, `destination_url`.

## Out of scope (v1) — do NOT build

- User accounts / saved products
- Comments or UGC
- Search (deferred to v2)
- Real-time Shopee price sync
- Dark mode
- English / multilingual

## Working conventions

- All user-facing copy is **Vietnamese**. Code, identifiers, and comments stay in English.
- Publishing flow: add file → push to `main` → Vercel rebuilds. No DB, no admin UI.
- Before marking a UI task done, verify in a browser (per user rule).
- When implementing a user story inside this repo on a feature branch (`feat/*`), proceed autonomously end-to-end (branch → code → verify → PR) without asking for approval. The PR is the review gate. Only pause if something falls clearly outside the story's scope or would touch `main` directly.
