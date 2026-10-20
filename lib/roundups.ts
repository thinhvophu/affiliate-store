/**
 * Roundup identity — F0016 (US00162).
 *
 * There is exactly one deal-roundup post per category, at the fixed slug
 * `roundupSlugFor(category)`, overwritten in place by `generate:deal-post`.
 * There is no archive and no demotion: the post's freshness is its
 * `updatedAt` frontmatter. A post is still a roundup iff a
 * `content/deals/<slug>.json` sidecar exists (`postHasDeals()`), never via a
 * stored status field.
 *
 * This module imports `lib/deals.ts` and the `Post` type only — never
 * `lib/posts.ts`.
 */

import type { Post } from "@/types";
import { postHasDeals, type GetDealsOptions } from "@/lib/deals";

/** The one evergreen roundup slug for a category — the only place it is derived. */
export function roundupSlugFor(category: string): string {
  return `deal-${category}`;
}

/** A post is a roundup iff it has a deal sidecar — derived, never stored. */
export function isRoundupPost(post: Post, opts: GetDealsOptions = {}): boolean {
  return postHasDeals(post.slug, opts);
}

export function getRoundupForCategory(
  posts: Post[],
  category: string,
  opts: GetDealsOptions = {},
): Post | null {
  return posts.find((p) => p.category === category && isRoundupPost(p, opts)) ?? null;
}

/**
 * Throws naming the offending slug(s) when a category has more than one
 * roundup, or a roundup's slug is not `roundupSlugFor(category)`.
 */
export function assertOneRoundupPerCategory(posts: Post[], opts: GetDealsOptions = {}): void {
  const byCategory = new Map<string, string[]>();

  for (const post of posts) {
    if (!isRoundupPost(post, opts)) continue;

    const expected = roundupSlugFor(post.category);
    if (post.slug !== expected) {
      throw new Error(
        `[roundups] "${post.slug}" is a roundup in "${post.category}" but its slug must be "${expected}".`,
      );
    }
    byCategory.set(post.category, [...(byCategory.get(post.category) ?? []), post.slug]);
  }

  for (const [category, slugs] of byCategory) {
    if (slugs.length > 1) {
      throw new Error(
        `[roundups] category "${category}" has multiple roundups: ${slugs.join(", ")}`,
      );
    }
  }
}
