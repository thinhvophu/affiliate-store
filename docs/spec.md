# Storefront Affiliate Page — Project Specification

> **Status:** Draft  
> **Last updated:** 2026-05-02  
> **Stack:** Next.js · Vercel · MDX · Shopee Affiliate  
> **Feature backlog:** [`docs/BACKLOG.md`](./BACKLOG.md)

---

## 1. Overview

A Vietnamese-language, SEO-first affiliate storefront showcasing curated gaming peripherals and tech gadgets. Monetized via Shopee affiliate links and Google AdSense. Distributed through organic Google search and existing social channels (Facebook, YouTube).

The site is purely content-driven — no user accounts, no cart, no checkout. Every product click routes to Shopee via an affiliate URL.

---

## 2. Goals

| Goal | Priority |
|---|---|
| Drive affiliate clicks to Shopee product pages | P0 |
| Rank on Vietnamese long-tail buying-intent keywords | P0 |
| Serve as a link hub for social channel audiences | P1 |
| Support Google AdSense display ads | P1 |
| Enable Google Analytics tracking | P2 |

---

## 3. Technical Stack

### 3.1 Framework

- **Next.js** (App Router) with **Static Site Generation (SSG)**
- All pages are pre-rendered at build time — no server-side rendering required
- Dynamic data (product list, blog posts) sourced from local JSON/MDX files at build time

### 3.2 Content

- **Blog/guide posts:** MDX files stored in `/content/posts/`
- **Product data:** JSON files stored in `/content/products/`
- New content is published by adding files and triggering a redeploy — no CMS needed for now

### 3.3 Deployment

- **Platform:** Vercel (free tier sufficient to start)
- **Redeploy schedule:** Automated via GitHub Actions on a cron schedule (daily or weekly) to refresh affiliate link metadata if needed
- **Manual deploy:** Push to `main` branch triggers Vercel deploy automatically

### 3.4 GitHub Actions

Cron job workflow (`.github/workflows/scheduled-deploy.yml`):

```yaml
on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 02:00 UTC
  workflow_dispatch:       # Allow manual trigger
```

Triggers a Vercel deploy hook to rebuild the site on schedule.

### 3.5 SEO — Core Requirements

SEO is a first-class concern, not an afterthought.

- **`<title>` and `<meta description>`** — unique per page, keyword-optimized
- **Open Graph tags** — for social sharing previews
- **Structured data (JSON-LD):**
  - `Product` schema on product detail pages
  - `Article` schema on blog/guide pages
  - `BreadcrumbList` on all pages
- **Sitemap:** Auto-generated at `/sitemap.xml` on build
- **robots.txt:** Allow all, point to sitemap
- **Canonical URLs:** Set on all pages to prevent duplicate content
- **Core Web Vitals:** SSG + Vercel CDN ensures fast load; images must use `next/image` for optimization
- **Semantic HTML:** Proper heading hierarchy (`h1` → `h2` → `h3`), `<main>`, `<article>`, `<nav>`

---

## 4. Site Structure

```
/                            → Homepage (featured picks + category highlights)
/san-pham/                   → Product listing page (filterable grid)
/san-pham/[slug]/            → Product detail page (thin — mainly affiliate CTA)
/danh-muc/[category]/        → Category page (filtered product grid + intro text)
/bai-viet/                   → Blog post listing page
/bai-viet/[slug]/            → Blog post / buying guide (SEO content)
/ve-chung-toi/               → About page (trust signal)
/sitemap.xml                 → Auto-generated sitemap
/robots.txt                  → Crawler rules
```

---

## 5. UI/UX Specification

### 5.1 Global Theme

| Property | Value |
|---|---|
| Style | Minimalism — clean, low visual noise |
| Language | Vietnamese |
| Primary color | Configurable via CSS variable (`--color-primary`), default Shopee orange `#EE4D2D` |
| Font | System font stack (no external font dependency for performance) |
| Responsive | Mobile-first, breakpoints at 768px and 1280px |

### 5.2 Global Layout

```
┌─────────────────────────────────────────────┐
│  HEADER: Logo · Site name · Navigation menu  │
├──────────────┬──────────────────────────────┤
│              │                              │
│  LEFT PANEL  │      MAIN CONTENT            │
│  (filter /   │   (products / article /      │
│   metadata)  │    blog list)                │
│              │                              │
│  ~280px      │   fills remaining width      │
│              │                              │
├──────────────┴──────────────────────────────┤
│  FOOTER: Contact · Copyright · Social links  │
└─────────────────────────────────────────────┘
```

- On mobile: left panel collapses into a top filter bar or slide-out drawer
- Main content captures primary visual focus — left panel is secondary

#### Header
- Site logo (SVG, configurable)
- Site name / tagline
- Navigation: Trang chủ · Sản phẩm · Bài viết · Về chúng tôi
- Sticky on scroll (optional, P2)

#### Footer
- Contact info (email or social handle)
- Copyright notice with current year
- Links: Privacy Policy · Affiliate Disclosure

### 5.3 Page: Product Listing (`/san-pham/`)

**Purpose:** Browse and filter all affiliate products.

**Left panel — Filters:**
- Product category (checkbox list)
- Price range (slider or preset ranges)
- Brand (checkbox list)
- Sort by: Mới nhất · Giá thấp → cao · Giá cao → thấp · Phổ biến

**Main content — Product grid:**
- Responsive grid: 2 columns mobile / 3 columns tablet / 4 columns desktop
- Each product card displays:
  - Product thumbnail image
  - Product name
  - Price (formatted: `₫1.200.000`)
  - Category tag / badge
  - "Xem trên Shopee" CTA button
- Clicking anywhere on the card opens the Shopee affiliate URL in a **new browser tab**
- **Pagination:** Page-based (not infinite scroll) — 24 products per page
  - Pagination must be crawlable by Google (use `?page=N` query params with proper canonical)

**SEO notes for this page:**
- Each category page (`/danh-muc/[category]/`) duplicates this grid filtered by category
- Category pages must include a 100–200 word introductory text block above the grid for keyword relevance

### 5.4 Page: Product Detail (`/san-pham/[slug]/`)

**Purpose:** Thin landing page per product — mainly for structured data and affiliate CTA.

**Content:**
- Product name (`h1`)
- Product images (gallery)
- Short description (1–3 sentences)
- Key specs (simple table)
- Price
- Prominent "Mua trên Shopee" button → affiliate URL, opens new tab
- Breadcrumb: Trang chủ › Sản phẩm › [Category] › [Product name]
- Related products (3–4 cards, same category)

**SEO:** `Product` JSON-LD schema with name, image, description, offers (price, availability).

### 5.5 Page: Blog Post Listing (`/bai-viet/`)

**Purpose:** Index of all buying guides and review posts.

**Left panel:** Categories or tags filter (simple link list).

**Main content:**
- Posts ordered by `publishedAt` descending (newest first)
- Each item displays:
  - Title (linked)
  - Short summary / excerpt (2–3 sentences)
  - Published date (formatted: `02 tháng 5, 2026`)
  - Category tag
  - Estimated read time (optional, P2)
- Pagination: 12 posts per page

### 5.6 Page: Blog Post / Buying Guide (`/bai-viet/[slug]/`)

**Purpose:** Primary SEO content page. This is what ranks on Google.

**Left panel:** Table of contents (generated from MDX headings), sticky on desktop.

**Main content:**
- Article title (`h1`)
- Published date + estimated read time
- Hero image
- MDX-rendered article body
  - Supports: headings, tables, bullet lists, inline images, code blocks (for specs)
- Affiliate product cards embedded inline (component: `<ProductCard slug="..." />`)
- Author byline (anonymous — site name as author is fine)
- Related posts (3 cards at bottom)

**SEO:**
- `Article` JSON-LD schema
- `og:title`, `og:description`, `og:image` from frontmatter
- Reading time in meta is a soft signal but good UX

**MDX frontmatter schema:**
```yaml
---
title: "Top 5 Tai Nghe Gaming Dưới 500k Năm 2026"
summary: "So sánh chi tiết 5 tai nghe gaming tốt nhất trong tầm giá 500k..."
publishedAt: "2026-05-02"
category: "tai-nghe"
tags: ["tai nghe gaming", "budget", "review"]
coverImage: "/static/images/blog/tai-nghe-gaming-500k.png"
---
```

**Publishing workflow:** Add MDX file to `/content/posts/` → push to `main` → Vercel rebuilds → post is live.

---

## 6. Analytics & Monitoring

> Not required for launch. Architecture must be ready for integration without code changes.

### 6.1 Google Analytics 4

- Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to environment variables (empty = disabled)
- `GoogleAnalytics` component conditionally rendered in root layout only when env var is set
- No analytics loaded in development

### 6.2 Google Search Console

- Submit `sitemap.xml` on launch day
- Verify via `next-sitemap` generated file or DNS TXT record

### 6.3 Affiliate Click Tracking

- All affiliate link clicks are tracked as GA4 events: `affiliate_click` with properties `product_name`, `product_category`, `destination_url`
- Enables identifying top-converting products without Shopee's own dashboard

---

## 7. Content Strategy (Operational)

### 7.1 Product Data (`/content/products/`)

Each product is a JSON entry:

```json
{
  "slug": "logitech-g102-lightsync",
  "name": "Chuột Gaming Logitech G102 Lightsync",
  "category": "chuot-gaming",
  "brand": "Logitech",
  "price": 390000,
  "affiliateUrl": "https://shope.ee/...",
  "images": ["/static/images/products/logitech-g102.jpg"],
  "description": "Chuột gaming giá rẻ, phù hợp cho game thủ mới bắt đầu.",
  "specs": {
    "DPI": "200–8000",
    "Sensor": "Optical",
    "Weight": "85g"
  },
  "publishedAt": "2026-05-01",
  "featured": true
}
```

### 7.2 Blog Content Pipeline

Weekly cadence (AI-assisted):
1. Identify 1–2 long-tail Vietnamese buyer-intent keywords
2. Generate MDX draft using AI (Claude) with structured prompt template
3. Review for accuracy, insert real affiliate links via `<ProductCard />` components
4. Add cover image placeholder, fill frontmatter
5. Push to `main` → auto-deploys

Target: 4–8 published posts per month.

### 7.3 Content Types (Priority Order)

| Type | Example | SEO Value |
|---|---|---|
| Buying guide | "Tai nghe gaming dưới 500k loại nào tốt?" | High |
| Comparison | "So sánh Logitech G102 vs E-Dra EM625S" | High |
| Best-of list | "Top 5 chuột gaming cho tay nhỏ 2026" | High |
| Setup guide | "Cách setup góc gaming cơ bản dưới 5 triệu" | Medium |
| Product spotlight | "Review nhanh: Bàn phím Akko 3068B" | Medium |

---

## 8. Affiliate Disclosure

Per Vietnamese consumer protection norms and Google's quality guidelines, every page must include a visible affiliate disclosure:

> *"Các liên kết sản phẩm trên trang này là liên kết tiếp thị liên kết. Chúng tôi có thể nhận hoa hồng khi bạn mua hàng qua các liên kết này, không phát sinh thêm chi phí cho bạn."*

Place in: footer (all pages) + top of each blog post.

---

## 9. Launch Checklist

- [ ] Domain registered and pointed to Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` env var set
- [ ] At least 12 products added to `/content/products/`
- [ ] At least 5 blog posts written and reviewed before launch
- [ ] `sitemap.xml` verified at `/sitemap.xml`
- [ ] `robots.txt` verified
- [ ] Affiliate disclosure visible on all pages
- [ ] Google Search Console property created, sitemap submitted
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var ready (can be empty at launch)
- [ ] All affiliate URLs tested (open correct Shopee page in new tab)
- [ ] Mobile responsiveness checked on real device
- [ ] Core Web Vitals passing in Vercel dashboard

---

## 10. Out of Scope (v1)

- User accounts or saved products
- Comments or user-generated content
- Real-time price sync with Shopee API
- Search functionality (deferred to v2)
- Dark mode
- Multilingual support (English)
