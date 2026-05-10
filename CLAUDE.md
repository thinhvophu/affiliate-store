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

> Last updated: US00115 (Speed Insights: app/layout.tsx mounts <SpeedInsights />)

### Top-level layout

```
aff-store/
├── app/                 # Next.js App Router (routes, layouts, route handlers)
│   ├── layout.tsx       # Root layout — <html lang="vi">, imports globals.css, mounts <SpeedInsights />
│   ├── globals.css      # Global CSS reset + design tokens (US00016)
│   └── page.tsx         # Homepage (/)
├── components/          # Reusable React components (PascalCase.tsx)
├── content/             # Static content sources
│   ├── products/        # *.json — one file per product (see Product JSON shape)
│   └── posts/           # *.mdx — one file per blog post
├── lib/                 # Pure utilities, data loaders, formatters (no React)
│   ├── products.ts      # getAllProducts(), getProductBySlug() — reads content/products/*.json
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
- **Data loaders / formatters** in `lib/` (e.g., `lib/products.ts`, `lib/posts.ts`, `lib/format.ts`). No JSX in `lib/`.
- **Types** in `types/<domain>.ts` (e.g., `types/product.ts`, `types/post.ts`). Barrel at `types/index.ts` — always import from `@/types`.
- **Content** is read at build time from `content/`. No DB, no CMS.
- **Imports** use the `@/*` alias (e.g., `import { getProducts } from "@/lib/products"`). Avoid deep relative paths.

### Route map (planned — see "Routes" section below for SEO/render strategy)

| Path                   | Source file (planned)              |
| ---------------------- | ---------------------------------- |
| `/`                    | `app/page.tsx` ✅                  |
| `/san-pham`            | `app/san-pham/page.tsx`            |
| `/san-pham/[slug]`     | `app/san-pham/[slug]/page.tsx`     |
| `/danh-muc/[category]` | `app/danh-muc/[category]/page.tsx` |
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
