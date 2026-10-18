# Traffic Improvement Plan

> Analysis date: 2026-10-18 · Site live ~1 month (https://www.muagear.com) · Status: **approved**

## Baseline (GA4 property `muagear` / 413699722, last 60 days)

- **Real organic traffic: 4 sessions in ~6 weeks** (3 landed on `/`, 1 on `/bai-viet/deal-ban-phim-gaming-2026-10-01`).
- ~70% of the 58 sessions are not real visitors:
  - **Bots:** Council Bluffs, Ashburn, Frankfurt (datacenter locations).
  - **Internal:** ~20 sessions from Ho Chi Minh City + 15 sessions from the `vercel.com` referral (1 user, ~5 min avg — owner testing).
- `affiliate_click`: 5 events (likely mostly internal tests).
- Content: 14 posts — **10 of them (71%) are dated weekly deal roundups**, only 4 evergreen guides. 15 products across 3 categories. Sitemap has 38 URLs.
- Search Console was **not** checked (no GSC tool connected) — indexing status unconfirmed.

## Improvement points (highest impact first)

### 1. 🔴 Critical — Every canonical URL points to a redirect

- **Issue:** canonical, `og:url`, JSON-LD, breadcrumbs, `sitemap.xml` and in-post links all use a trailing slash (`/bai-viet/x/`), but the live server 308-redirects them to `/bai-viet/x`.
- **Evidence:** `curl -I https://www.muagear.com/bai-viet/top-5-chuot-gaming-gia-re/` → `308 location: /bai-viet/top-5-chuot-gaming-gia-re`. All 38 sitemap URLs redirect. Header/nav links already use the no-slash form.
- **Fix:** change `buildCanonicalPath()` in `lib/seo.ts` to drop the trailing slash (matches Next's default and the existing internal links), **or** set `trailingSlash: true` in `next.config.ts`. Use one style everywhere (also the `/bai-viet/…/` links written into deal posts by `supersede.ts`/templates). Then resubmit the sitemap.
- **Why first:** a small change that likely blocks indexing right now (GSC reports these as "Page with redirect" / conflicting canonical).

### 2. 🔴 Critical — Indexing isn't confirmed

- **Evidence:** only 4 organic sessions total.
- **Fix (in Google Search Console):** verify the property, submit `sitemap.xml`, request indexing for the 4 evergreen guides + 3 category pages, and read the "Pages" report for "Page with redirect" / "Crawled – currently not indexed".

### 3. 🔴 High — Content strategy targets queries nobody searches

- **Issue:** titles like "Top 5 deal chuột gaming trên Shopee (05/10/2026)" are dated and templated. Each week creates a **new URL** for the same query (4 chuột deal posts compete with each other — keyword cannibalization), and each one is archived after 7 days.
- **Evidence:** 10/14 posts are deal roundups; two weeks of the same template differ by only ~75 lines once numbers are stripped.
- **Fix:**
  - Shift effort to **evergreen buying guides** for real Vietnamese queries, e.g. "chuột gaming dưới 500k", "tai nghe gaming dưới 300k", "bàn phím cơ dưới 1 triệu", "G304 vs G102", "<model> có tốt không". Validate with Keyword Planner CSVs in `analyze/`.
  - For deals: **one fixed URL per category** (e.g. `/bai-viet/deal-chuot-gaming/`) refreshed weekly, so authority builds on one URL instead of being spread across dated posts.

### 4. 🟠 High — Catalog is too small, product pages are thin

- **Evidence:** 15 products, 3 categories, 38 URLs in total; product descriptions mostly restate the Shopee listing.
- **Fix:** grow to 50+ products; add categories (lót chuột, tay cầm, webcam, micro). Pair key products with "review / có tốt không" posts (high buying intent).

### 5. 🟠 Medium — Deal post quality looks spammy

- **Issue:** H3 headings are raw seller titles (e.g. "Chuột Gaming Razer DeathAdder Essential | Quang Học | 5 Nút Lập Trình | Led Đơn | Đệm Cao Cu"). The same products repeat week after week (DeathAdder Essential, Onikuma K98, DAREU EK75 appear 3× each).
- **Evidence:** `content/deals/*.json`, `content/posts/deal-*.mdx`.
- **Fix:** clean deal names using the same boilerplate rules `lib/products.test.ts` applies to products; skip products featured in the last N weeks.

### 6. 🟠 Medium — No distribution or backlinks

- **Issue:** a one-month-old domain gets almost nothing from Google on its own.
- **Evidence:** 0 social/referral traffic apart from `vercel.com`.
- **Fix:** share guides and deals where Vietnamese gamers already are — Facebook gaming-gear groups, Voz, Tinhte, TikTok / YouTube Shorts. Aim for a few real backlinks. Fastest source of early traffic while SEO builds up.

### 7. 🟡 Medium — Weak trust signals (E-E-A-T) for reviews

- **Issue:** author is the "MuaGear" Organization, no real person, all images come from Shopee. Google's reviews system ranks this kind of affiliate content low.
- **Evidence:** Article JSON-LD `author: { "@type": "Organization" }`.
- **Fix:** add a real author with a bio page, hands-on notes, own photos, and a short "how we test" note on each post.

### 8. 🟡 Low–Medium — Thin internal linking

- **Evidence:** homepage links to only 4 posts; guides, category pages and deals barely link to each other.
- **Fix:** category pages → their guides; guides ↔ each other; deal posts → evergreen guides.

### 9. 🟡 Low — GA data is polluted

- **Evidence:** bots + owner sessions ≈ 70% of traffic.
- **Fix:** add an internal-traffic filter for the owner's IP, exclude the `vercel.com` referral, and link GA4 with GSC so progress is measurable.

## Suggested order

1. **This week:** #1 (trailing-slash fix) and #2 (GSC submit + inspect) — small, and may be what's blocking indexing today.
2. **Next:** #9 (clean measurement) and #5 (deal name cleanup).
3. **Ongoing, biggest long-term drivers:** #3 (evergreen content + fixed deal URLs) and #6 (distribution), then #4, #7, #8.
