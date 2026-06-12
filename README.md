# aff-store

Vietnamese-language, SEO-first affiliate storefront for gaming peripherals & tech gadgets. Monetized via Shopee affiliate links + Google AdSense. Content-driven only — no auth, no cart, no checkout.

> Detailed project rules and conventions live in [`CLAUDE.md`](./CLAUDE.md). Spec is in [`docs/spec.md`](./docs/spec.md).

## Stack

- **Framework:** Next.js 16 (App Router), SSG only
- **Runtime:** React 19, TypeScript (strict)
- **Content:** MDX for posts, JSON for products (no CMS)
- **Hosting:** Vercel — push to `main` auto-deploys
- **Node:** see [`.nvmrc`](./.nvmrc) (≥ 22.11)

## Getting started

```bash
nvm use
npm install
npm run dev          # http://localhost:3000
```

Useful scripts:

| Command             | Purpose                           |
| ------------------- | --------------------------------- |
| `npm run dev`       | Local dev server                  |
| `npm run build`     | Production build (used by Vercel) |
| `npm run start`     | Run the production build locally  |
| `npm run typecheck` | `tsc --noEmit`                    |

## Environment variables

| Name                            | Purpose                            | Required |
| ------------------------------- | ---------------------------------- | -------- |
| `NEXT_PUBLIC_SITE_URL`          | Canonical/sitemap base URL         | Yes      |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 ID; empty = analytics disabled | No       |

## Hosting

Production runs on **Vercel** with the GitHub integration. Push to `main` auto-deploys.

| Item                  | Value                                                                                |
| --------------------- | ------------------------------------------------------------------------------------ |
| Vercel project        | `aff-store` ([dashboard](https://vercel.com/thinhvophu/aff-store))                   |
| Production URL        | `https://aff-store.vercel.app` (until custom domain is added during launch prep)     |
| Production branch     | `main`                                                                               |
| Framework preset      | Next.js (auto-detected)                                                              |
| Node.js version       | 22.x (matches `package.json` `engines`)                                              |
| Preview deploys       | Auto-created for every PR; URL posted as a comment by the Vercel bot                 |
| Speed Insights        | Enabled — see [`docs/plans/US00115.md`](./docs/plans/US00115.md) (when implemented)  |

### Verifying a deploy

1. Open the [Vercel dashboard → `aff-store` → Deployments](https://vercel.com/thinhvophu/aff-store/deployments).
2. Confirm the latest commit on `main` shows a green "Ready" Production deployment.
3. Visit the Production URL above and confirm the homepage renders without console errors.

### When a build fails

The previously successful Production deployment continues serving traffic. Fix forward (push a new commit) or revert. No manual intervention in the Vercel UI is required to keep the site up.

## Codebase structure

Living map of the repository. **Update this section** whenever a story adds/moves/renames files or introduces new conventions. Mirror updates in [`CLAUDE.md`](./CLAUDE.md).

> Last updated: US00102 (lib/site.ts — CONTACT_EMAIL extracted; ve-chung-toi/page.tsx — disclosure + contact blocks; F0010)

### Top-level layout

```
aff-store/
├── app/                 # Next.js App Router (routes, layouts, route handlers)
│   ├── layout.tsx       # Root layout — <html lang="vi">, imports globals.css, mounts <SpeedInsights />
│   ├── page.tsx         # Homepage (/) — Server Component; hero (US00081) + FeaturedProducts (US00082) + CategoryHighlights (US00083) + LatestPosts (US00084); full-width, no ShellLayout
│   ├── page.module.css  # Full-width .container (max-width, centered, horizontal padding, mobile→desktop breakpoints) (US00081)
│   ├── chinh-sach-bao-mat/  # /chinh-sach-bao-mat/ route
│   │   ├── page.tsx                        # Privacy Policy — Static Server Component; Vietnamese legal copy (US00052)
│   │   └── chinh-sach-bao-mat.module.css   # Page-scoped prose layout (US00052)
│   ├── cong-bo-tiep-thi-lien-ket/  # /cong-bo-tiep-thi-lien-ket/ route
│   │   ├── page.tsx                        # Affiliate Disclosure — Static Server Component; AFFILIATE_DISCLOSURE_VI lead + Vietnamese copy (US00053)
│   │   └── page.module.css                 # Page-scoped prose layout (US00053)
│   ├── danh-muc/        # /danh-muc/ routes
│   │   └── [category]/  # Dynamic category segment
│   │       ├── page.tsx                    # Category page — SSG per registered category (US00045)
│   │       ├── not-found.tsx               # Vietnamese 404 for unknown category slugs (US00045)
│   │       └── category-page.module.css    # Page-scoped layout — heading + intro typography (US00045)
│   ├── san-pham/        # /san-pham/ routes
│   │   ├── page.tsx     # Product listing — SSG, wires CatalogFilters + CatalogGrid + mobile trigger (US00043/44)
│   │   ├── page.module.css # Page heading + grid skeleton styles (US00044)
│   │   └── [slug]/      # Dynamic product-detail segment
│   │       ├── page.tsx                    # Product detail page — SSG per slug, generateStaticParams + notFound() (US00046)
│   │       ├── not-found.tsx               # Vietnamese 404 for unknown product slugs (US00046)
│   │       └── product-detail.module.css   # Page-scoped layout — 2-col grid ≥1024px, specs <dl>, CTA pill (US00046)
│   └── ve-chung-toi/    # /ve-chung-toi/ route
│       ├── page.tsx                # About page — Static Server Component; 3 editorial sections + <AffiliateDisclosure /> + Liên hệ section sourcing CONTACT_EMAIL from lib/site.ts (US00101, US00102)
│       └── ve-chung-toi.module.css # Page-scoped prose layout — reading-width container, F0005 accent (US00101, US00102)
├── components/          # Reusable React components (PascalCase.tsx; co-locate styles as <Name>.module.css)
│   ├── Footer.tsx           # Server Component — 4-column footer, affiliate disclosure (US00022)
│   ├── Footer.module.css    # Scoped styles for the Footer
│   ├── Header.tsx           # Server Component — orange brand band, logo, site name
│   ├── HeaderNav.tsx        # "use client" — active-route nav links (usePathname)
│   ├── HeaderMobileMenu.tsx # "use client" — hamburger trigger + mobile nav panel
│   ├── Header.module.css    # Scoped styles for the Header
│   ├── HeaderStickyShadow.tsx   # "use client" — sticky-shadow toggle for <Header />; IntersectionObserver sentinel (US00026)
│   ├── Drawer.tsx               # "use client" — generic slide-out drawer primitive (Esc, focus trap, scroll lock, overlay) (US00025)
│   ├── Drawer.module.css        # Scoped styles for Drawer; overlay, slide-in panel, reduced-motion, desktop hide (US00025)
│   ├── ShellLayout.tsx      # Server Component — opt-in two-column shell (leftPanel + children) (US00024)
│   ├── ShellLayout.module.css # Scoped styles for ShellLayout; CSS Grid, card chrome, responsive breakpoints
│   ├── ShellLayoutDrawer.tsx    # "use client" — mobile trigger button + Drawer wrapper for ShellLayout leftPanel (US00025)
│   ├── ShellLayoutDrawer.module.css # Scoped styles for ShellLayoutDrawer; white-on-orange trigger, mobile-only (US00025)
│   ├── SkipLink.tsx         # Server Component — skip-to-main-content link (US00023)
│   ├── AffiliateLink.tsx        # Server Component — canonical affiliate-link primitive; baked target/rel + F0003↔F0007 seam attributes (US00031, US00033)
│   ├── AffiliateLink.module.css # Scoped styles for AffiliateLink — visually-hidden srOnly + .card whole-card surface (hover, focus-visible, prefers-reduced-motion gate) (US00031 + US00032)
│   ├── ProductCard.tsx          # Server Component — standard product summary card, whole-card AffiliateLink (US00042)
│   ├── ProductCard.module.css   # Scoped styles for ProductCard — flex column, image frame, category badge, name clamp, CTA pill (US00042)
│   ├── ProductListingClient.tsx      # "use client" — paginated product grid, reads ?page via useSearchParams (US00043)
│   ├── ProductListingClient.module.css # Grid CSS (2/3/4 cols), empty/error state (US00043)
│   ├── Pagination.tsx                # Shared — crawlable page-link nav; basePath + extraParams for filter-aware URLs (US00043/44)
│   ├── Pagination.module.css         # Pagination styles — flex row, touch targets, active state (US00043)
│   ├── CategoryNav.tsx               # Server Component — sibling-category list for the left panel (US00045)
│   ├── CategoryNav.module.css        # Scoped styles for CategoryNav — vertical link list (US00045)
│   ├── CategoryPageClient.tsx        # "use client" — paginated category grid; reads ?page via useSearchParams (US00045)
│   ├── CategoryPageClient.module.css # Grid CSS (2/3/4 cols), empty/pagination styles (US00045)
│   ├── ProductGallery.tsx            # "use client" — single/multi-image gallery; useState activeIndex; thumbnail aria-pressed (US00046)
│   ├── ProductGallery.module.css     # Scoped styles — main 1:1 frame (object-fit: contain), thumbnail row, active-border (US00046)
│   ├── RelatedProducts.tsx           # Server Component — "Sản phẩm liên quan" section on product detail page (US00047)
│   ├── RelatedProducts.module.css    # Scoped grid styles for RelatedProducts; 2/3/3–4-col responsive grid (US00047)
│   ├── CatalogFilters.tsx            # "use client" — left-panel filter UI; URL-driven (US00044)
│   ├── CatalogFilters.module.css     # Scoped styles for CatalogFilters (US00044)
│   ├── CatalogGrid.tsx               # "use client" — filtered/sorted/paginated product grid (US00044)
│   ├── CatalogGrid.module.css        # Grid styles, empty state, no-results state (US00044)
│   ├── CatalogFiltersMobileTrigger.tsx       # "use client" — mobile <dialog> bridge; TODO(US00025-drawer) (US00044)
│   ├── CatalogFiltersMobileTrigger.module.css # Trigger + dialog styles; hidden ≥768px (US00044)
│   ├── AffiliateDisclosure.tsx     # Server Component — top-of-post affiliate-disclosure note; renders AFFILIATE_DISCLOSURE_VI (US00051)
│   ├── AffiliateDisclosure.module.css # Scoped styles — --color-primary left accent, surface bg, AA contrast (US00051)
│   ├── MdxProductCard.tsx       # Server Component — MDX adapter: resolves <ProductCard slug="…" /> via getProductBySlug at build time, renders the US00042 card; throws on unknown slug (US00063)
│   ├── PostBody.tsx             # Async Server Component — evaluates Post.content via @mdx-js/mdx + remark-gfm + heading-slug plugin + shared MDX map (US00062)
│   ├── PostBody.module.css      # Prose container styles (US00062)
│   ├── RelatedPosts.tsx         # Server Component — "Bài viết liên quan" section; null when empty; consumes PostCard (US00067)
│   ├── RelatedPosts.module.css  # Scoped grid styles for RelatedPosts (US00067)
│   ├── TableOfContents.tsx      # Server Component — sticky left-panel TOC; renders null when entries empty (US00068)
│   ├── TableOfContents.module.css # Sticky + max-height/overflow, h3 indent, primary hover accent (US00068)
│   ├── HomeHero.tsx             # Server Component — homepage hero: eyebrow + h1 + tagline + two CTA Links (US00081)
│   ├── HomeHero.module.css      # Scoped styles — .hero/.eyebrow/.heading/.tagline/.ctaGroup/.ctaPrimary/.ctaSecondary; token-based; 768px + 1280px breakpoints (US00081)
│   ├── FeaturedProducts.tsx     # Server Component — homepage "Sản phẩm nổi bật" section; consumes <ProductCard>; exports MAX_FEATURED_PRODUCTS=8 (US00082)
│   ├── FeaturedProducts.module.css # Scoped styles — 2/3/4 responsive grid, heading row, "Xem tất cả" link, empty state (US00082)
│   ├── CategoryHighlights.tsx   # Server Component — homepage "Danh mục" section; renders one link per registered category from lib/categories.ts using getCategoryLabels() (US00083)
│   ├── CategoryHighlights.module.css # Scoped styles for CategoryHighlights — responsive 2/3/5-col grid of category tiles, token-based hover/focus (US00083)
│   ├── LatestPosts.tsx          # Server Component — homepage "Bài viết mới nhất" strip; renders up to 4 newest posts via <PostCard>; null when no posts (US00084)
│   ├── LatestPosts.module.css   # Section chrome + header (heading/Xem-tất-cả link) + responsive grid (2 cols mobile/tablet, up to 4 cols desktop) (US00084)
│   └── mdx/                     # MDX element→component map
│       ├── mdx-components.tsx   # getMdxComponents() — img→next/image, heading/table/list/code/a overrides, ProductCard→MdxProductCard (US00062, US00063)
│       └── mdx-components.module.css # Scoped styles for MDX element overrides (US00062)
├── content/             # Static content sources
│   ├── products/        # *.json — one file per product (25 fixtures added in US00043)
│   └── posts/           # *.mdx — one file per blog post
├── public/              # Static assets served at the root (Next.js convention)
│   └── static/images/products/ # Product images (established in US00043; referenced as /static/images/products/<slug>.jpg)
├── lib/                 # Pure utilities, data loaders, formatters (no React)
│   ├── affiliate.ts     # Shopee affiliate-URL allow-list + assertAffiliateUrl helper (US00034)
│   ├── breakpoints.ts   # BREAKPOINT_TABLET_PX / BREAKPOINT_DESKTOP_PX / MOBILE_MEDIA_QUERY — JS mirror of globals.css tokens (US00025)
│   ├── categories.ts    # CATEGORIES map + getCategoryMeta + assertCategoryRegistered (US00045)
│   ├── disclosures.ts   # AFFILIATE_DISCLOSURE_VI constant — shared with F0005 page + F0006 posts (US00022)
│   ├── format.ts        # formatVnd() + formatPostDate() + readingTimeVi() — single chokepoints for VN price, date & read-time rendering (US00041, US00061, US00069)
│   ├── nav-items.ts     # NAV_ITEMS constant — the four primary nav routes (typed)
│   ├── site.ts          # SITE_NAME + CONTACT_EMAIL constants — shared site name and primary contact email used by Header, Footer, policy pages, and the About page (US00066, US00102)
│   ├── products.ts      # getAllProducts(), getProductBySlug(), getRelatedProducts() — calls assertAffiliateUrl() + assertCategoryRegistered() + images.length ≥ 1 at build time
│   ├── filters.ts       # PRICE_BUCKETS, SORT_OPTIONS, getFilterOptions, parseFilterParams, applyFilters, compareDefault (US00044)
│   ├── posts.ts         # getAllPosts(), getPostBySlug(), getRelatedPosts() — reads content/posts/*.mdx (US00067)
│   ├── toc.ts           # extractToc(content): TocEntry[] — AST walk via remark-parse + unist-util-visit; slugs via createHeadingSlugger(); h2+h3 only (US00068)
│   └── mdx-slug.ts      # createHeadingSlugger() + rehypeHeadingSlugs — heading-slug chokepoint for PostBody + TOC (US00062)
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
├── CLAUDE.md            # Project rules for AI agents and humans
├── AGENTS.md            # Agent rules (read Next.js docs before coding)
└── README.md            # This file
```

### Module conventions

- **Routes** live under `app/<vietnamese-slug>/`. Use `page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx` per Next.js App Router.
- **Components** in `components/<Name>.tsx`. Server Components by default; add `"use client"` only when needed.
- **Component styles** co-locate as `<Name>.module.css` next to the component file (CSS Modules, scoped). First instance: `components/Footer.tsx` + `components/Footer.module.css` (US00022).
- **Data loaders / formatters** in `lib/` (e.g., `lib/products.ts`, `lib/posts.ts`, `lib/format.ts`). No JSX in `lib/`.
- **Types** in `types/<domain>.ts` (e.g., `types/product.ts`, `types/post.ts`). Barrel at `types/index.ts` — always import from `@/types`.
- **Content** is read at build time from `content/`. No DB, no CMS.
- **Imports** use the `@/*` alias (e.g., `import { getProducts } from "@/lib/products"`). Avoid deep relative paths.
- **Affiliate URLs** are validated in one place: `lib/affiliate.ts` (`assertAffiliateUrl`). Raw `<a>` elements whose `href` targets a Shopee host (`shopee.vn`, `shopee.ee`, `shope.ee`) outside `<AffiliateLink>` are disallowed — block on review.
- **Prices** are formatted in one place: `lib/format.ts`. Every product surface renders prices via `formatVnd(amount)`. No file outside `lib/format.ts` may use `Intl.NumberFormat`, `toLocaleString`, or hand-rolled `"₫"` concatenation on a price value.
- **Dates** are formatted in one place: `lib/format.ts`. Every blog surface renders post dates via `formatPostDate(iso)`. No file outside `lib/format.ts` may call `toLocaleDateString`, `Intl.DateTimeFormat`, or hand-roll a `tháng …` string on a post date.
- **Contact email lives in one place: `lib/site.ts` (`CONTACT_EMAIL`).** No file outside `lib/site.ts` may inline `ttln1201@gmail.com` — Footer, policy pages, and the About page all import the constant.
- **Categories are registered.** Every distinct `product.category` must have an entry in `lib/categories.ts` (slug + Vietnamese display name + 100–200 word intro + ≤160 char meta description). The product loader calls `assertCategoryRegistered()` at build time and fails with the offending slug if a category is missing.
- **Catalog filter state** lives in the URL (`?category=`, `?brand=`, `?price=`, `?sort=`) only — no local state, no Context, no `localStorage`. Round-trips through `lib/filters.ts`; unknown values silently ignored.
- **Blog MDX bodies render through `<PostBody>`** via `@mdx-js/mdx` `evaluate()`. The element/component map lives in `components/mdx/mdx-components.tsx`; the root `mdx-components.tsx` re-exports it. New MDX components register in the shared map only.
- **MDX inline product cards:** Authors type `<ProductCard slug="…" />` in `.mdx` posts. The map key `ProductCard` resolves to `MdxProductCard` (the slug adapter in `components/MdxProductCard.tsx`), not the prop-based `components/ProductCard`. The adapter calls `getProductBySlug` at build time and throws a slug-named `Error` on miss so `next build` fails loudly.
- **Heading slugs** come from `lib/mdx-slug.ts` (`createHeadingSlugger` wrapping `github-slugger`). No other file may call `github-slugger` or hand-roll heading slugs.

### Route map

| Path                   | Source file (planned)              |
| ---------------------- | ---------------------------------- |
| `/`                    | `app/page.tsx` ✅                  |
| `/san-pham`            | `app/san-pham/page.tsx` ✅         |
| `/san-pham/[slug]`     | `app/san-pham/[slug]/page.tsx` ✅  |
| `/danh-muc/[category]` | `app/danh-muc/[category]/page.tsx` ✅ |
| `/chinh-sach-bao-mat`  | `app/chinh-sach-bao-mat/page.tsx` ✅ |
| `/cong-bo-tiep-thi-lien-ket` | `app/cong-bo-tiep-thi-lien-ket/page.tsx` ✅ |
| `/bai-viet`            | `app/bai-viet/page.tsx` ✅         |
| `/bai-viet/[slug]`     | `app/bai-viet/[slug]/page.tsx` ✅  |
| `/ve-chung-toi`        | `app/ve-chung-toi/page.tsx` ✅     |
| `/sitemap.xml`         | `app/sitemap.ts`                   |
| `/robots.txt`          | `app/robots.ts`                    |

✅ = implemented · others to be created by upcoming stories.

## Workflow

1. Story spec lives in `docs/specs/USxxxxx.md`.
2. `/task-planner USxxxxx` reads the spec + the **Codebase structure** section above and produces a plan in `docs/plans/USxxxxx.md`.
3. After approval, `/implement-story USxxxxx` implements it on a feature branch and opens a PR.
4. If the implementation changes the structure, `/implement-story` updates this section and the matching one in `CLAUDE.md` as part of the same PR.

## Core Web Vitals (Vercel Speed Insights)

Real-user Core Web Vitals (LCP, CLS, INP, TTFB, FCP) are collected on every Production page view via [Vercel Speed Insights](https://vercel.com/docs/speed-insights). The `<SpeedInsights />` component is mounted in `app/layout.tsx` and beacons are only sent from the Production environment — local `npm run dev` and Preview deployments are silent by design.

### Where to view metrics

1. Open the Vercel dashboard for this project.
2. Click the **Speed Insights** tab in the project sidebar.
3. Direct URL: `https://vercel.com/thinhvophu/aff-store/speed-insights`

If the tab is empty after a deploy, confirm that:

- Speed Insights is enabled in **Project Settings → Speed Insights**.
- At least one real page view has happened on the live Production URL since the deploy (the dashboard does not back-fill past traffic).

## License

Private. All product data and content © aff-store.
