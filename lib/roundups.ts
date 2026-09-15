/**
 * Roundup currency — F0015 (US00153), decision D6.
 *
 * Spec §6 forbids a stored "post status" field / state machine. Instead,
 * roundup-ness and current/archived status are pure functions of two facts
 * already on disk:
 *
 *   1. A post is a roundup iff `content/deals/<slug>.json` exists —
 *      `postHasDeals()` from `lib/deals.ts` (US00152). No naming convention
 *      is trusted, no frontmatter flag is read.
 *   2. Among a category's roundups, the current one is the newest
 *      `publishedAt`; every other one is archived. Ties break on slug
 *      descending — deterministic, though a roundup slug carries its own
 *      date so this cannot occur in practice (US00152 D6 same-day overwrite).
 *
 * This module imports `lib/deals.ts` and the `Post` type only — never
 * `lib/posts.ts` — so there is no import cycle and `lib/posts.ts` stays
 * unaware of F0015 entirely.
 *
 * `demoteArchivedRoundups()` must only be applied at the call site of a
 * promotion surface (the homepage `<LatestPosts>` strip, the
 * `getRelatedPosts()` pool) — never inside a shared loader. `/bai-viet/` and
 * `sitemap.xml` must keep listing archived roundups (decision D7); they stay
 * reachable, just no longer promoted.
 */

import type { Post } from "@/types";
import { postHasDeals, type GetDealsOptions } from "@/lib/deals";

/** A post is a roundup iff it has a deal sidecar — derived, never stored (D6). */
export function isRoundupPost(post: Post, opts: GetDealsOptions = {}): boolean {
  return postHasDeals(post.slug, opts);
}

/**
 * The current (non-archived) roundup slug per category: the newest
 * `publishedAt` among that category's roundups.
 */
export function currentRoundupSlugs(posts: Post[], opts: GetDealsOptions = {}): Set<string> {
  const currentByCategory = new Map<string, Post>();

  for (const post of posts) {
    if (!isRoundupPost(post, opts)) continue;

    const current = currentByCategory.get(post.category);
    if (!current) {
      currentByCategory.set(post.category, post);
      continue;
    }

    const currentTime = new Date(current.publishedAt).getTime();
    const postTime = new Date(post.publishedAt).getTime();
    if (postTime > currentTime || (postTime === currentTime && post.slug > current.slug)) {
      currentByCategory.set(post.category, post);
    }
  }

  return new Set([...currentByCategory.values()].map((p) => p.slug));
}

/**
 * Drop archived roundups from a promotion surface. Non-roundup posts and the
 * current roundup per category always pass through, order preserved.
 */
export function demoteArchivedRoundups(posts: Post[], opts: GetDealsOptions = {}): Post[] {
  const current = currentRoundupSlugs(posts, opts);
  return posts.filter((post) => !isRoundupPost(post, opts) || current.has(post.slug));
}
