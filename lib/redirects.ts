/**
 * Legacy roundup URLs — F0016 (US00163).
 *
 * Every dated `deal-<category>-<date>` roundup was consolidated into the one
 * evergreen `deal-<category>` post (US00162). These explicit, permanent
 * redirects keep inbound links and indexed URLs alive. Deliberately literal
 * (no pattern) so it can never catch a slug that never existed.
 *
 * `next.config.ts` imports this with a relative path, so this module must stay
 * free of `@/` imports.
 */

export interface LegacyRedirect {
  source: string;
  destination: string;
  permanent: true;
}

export const LEGACY_ROUNDUP_REDIRECTS: readonly LegacyRedirect[] = [
  {
    source: "/bai-viet/deal-chuot-gaming-2026-09-27",
    destination: "/bai-viet/deal-chuot-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-chuot-gaming-2026-10-01",
    destination: "/bai-viet/deal-chuot-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-chuot-gaming-2026-10-05",
    destination: "/bai-viet/deal-chuot-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-chuot-gaming-2026-10-12",
    destination: "/bai-viet/deal-chuot-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-chuot-gaming-2026-10-19",
    destination: "/bai-viet/deal-chuot-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-ban-phim-gaming-2026-10-01",
    destination: "/bai-viet/deal-ban-phim-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-ban-phim-gaming-2026-10-05",
    destination: "/bai-viet/deal-ban-phim-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-ban-phim-gaming-2026-10-12",
    destination: "/bai-viet/deal-ban-phim-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-ban-phim-gaming-2026-10-19",
    destination: "/bai-viet/deal-ban-phim-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-tai-nghe-gaming-2026-10-01",
    destination: "/bai-viet/deal-tai-nghe-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-tai-nghe-gaming-2026-10-05",
    destination: "/bai-viet/deal-tai-nghe-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-tai-nghe-gaming-2026-10-12",
    destination: "/bai-viet/deal-tai-nghe-gaming",
    permanent: true,
  },
  {
    source: "/bai-viet/deal-tai-nghe-gaming-2026-10-20",
    destination: "/bai-viet/deal-tai-nghe-gaming",
    permanent: true,
  },
];

/** Slugs in `redirects` that are still live posts — each would be shadowed by its redirect. */
export function findRedirectCollisions(
  redirects: readonly LegacyRedirect[],
  postSlugs: readonly string[],
): string[] {
  const live = new Set(postSlugs);
  return redirects
    .map((r) => r.source.replace(/^\/bai-viet\//, ""))
    .filter((slug) => live.has(slug));
}
