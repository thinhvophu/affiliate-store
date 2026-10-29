/**
 * Product → posts embed index — F0016 (US00167).
 *
 * The one place that parses `<ProductCard slug="…">` out of post bodies.
 * Takes `posts` as a parameter and never imports `lib/posts.ts`.
 */

import type { Post } from "@/types";

const PRODUCT_CARD_RE = /<ProductCard\s+slug="([^"]+)"/g;

/** Unique embedded product slugs, in first-seen order. */
export function extractProductEmbeds(content: string): string[] {
  const slugs = new Set<string>();
  for (const match of content.matchAll(PRODUCT_CARD_RE)) slugs.add(match[1]);
  return [...slugs];
}

/** Posts embedding the product, each once, newest first. */
export function getPostsEmbeddingProduct(productSlug: string, posts: Post[]): Post[] {
  return posts
    .filter((p) => extractProductEmbeds(p.content).includes(productSlug))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
