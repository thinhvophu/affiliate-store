@AGENTS.md

# CLAUDE.md

Operational cheat sheet for this project.

- **Spec (source of truth):** `docs/spec.md`
- **Feature backlog:** `docs/BACKLOG.md`

## Project

Vietnamese-language, SEO-first affiliate storefront for gaming peripherals & tech gadgets. Monetized via Shopee affiliate links + Google AdSense. Content-driven only — **no auth, no cart, no checkout**. Every product click opens a Shopee affiliate URL in a new tab.

## Stack

- **Framework:** Next.js (App Router), **SSG only** — all pages pre-rendered at build time
- **Content:** MDX for posts, JSON for products (no CMS)
- **Hosting:** Vercel (push to `main` auto-deploys)
- **Scheduled rebuild:** GitHub Actions cron at `.github/workflows/scheduled-deploy.yml` (Mon 02:00 UTC) hits Vercel deploy hook

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

> *"Các liên kết sản phẩm trên trang này là liên kết tiếp thị liên kết. Chúng tôi có thể nhận hoa hồng khi bạn mua hàng qua các liên kết này, không phát sinh thêm chi phí cho bạn."*

Footer must also link to: Privacy Policy, Affiliate Disclosure.

## Env vars

| Name | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical/sitemap base URL | Yes |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 ID; empty = analytics disabled | No |

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
- Get approval before changing something non-trivial (per user rule).
