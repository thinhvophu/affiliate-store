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

> Last updated: US00113 (PR validation CI workflow: .github/workflows/ci.yml)

### Top-level layout

```
aff-store/
├── app/                 # Next.js App Router (routes, layouts, route handlers)
│   ├── layout.tsx       # Root layout — <html lang="vi">
│   └── page.tsx         # Homepage (/)
├── components/          # Reusable React components (PascalCase.tsx)
├── content/             # Static content sources
│   ├── products/        # *.json — one file per product
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
├── CLAUDE.md            # Project rules for AI agents and humans
├── AGENTS.md            # Agent rules (read Next.js docs before coding)
└── README.md            # This file
```

### Module conventions

- **Routes** live under `app/<vietnamese-slug>/`. Use `page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx` per Next.js App Router.
- **Components** in `components/<Name>.tsx`. Server Components by default; add `"use client"` only when needed.
- **Data loaders / formatters** in `lib/` (e.g., `lib/products.ts`, `lib/posts.ts`, `lib/format.ts`). No JSX in `lib/`.
- **Types** in `types/<domain>.ts` (e.g., `types/product.ts`, `types/post.ts`). Barrel at `types/index.ts` — always import from `@/types`.
- **Content** is read at build time from `content/`. No DB, no CMS.
- **Imports** use the `@/*` alias (e.g., `import { getProducts } from "@/lib/products"`). Avoid deep relative paths.

### Route map

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

## Workflow

1. Story spec lives in `docs/specs/USxxxxx.md`.
2. `/task-planner USxxxxx` reads the spec + the **Codebase structure** section above and produces a plan in `docs/plans/USxxxxx.md`.
3. After approval, `/implement-story USxxxxx` implements it on a feature branch and opens a PR.
4. If the implementation changes the structure, `/implement-story` updates this section and the matching one in `CLAUDE.md` as part of the same PR.

## License

Private. All product data and content © aff-store.
