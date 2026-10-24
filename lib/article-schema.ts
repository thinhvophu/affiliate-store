import type { Post } from "@/types";
import { absoluteUrl, buildCanonicalPath, getSiteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { getPostAuthor } from "@/lib/authors";

export function buildArticleSchema(post: Post): Record<string, unknown> {
  const url = absoluteUrl(buildCanonicalPath(["bai-viet", post.slug]));
  const cover = post.coverImage.trim() ? post.coverImage : DEFAULT_OG_IMAGE;
  const postAuthor = getPostAuthor(post);
  const author = {
    "@type": "Person",
    name: postAuthor.name,
    url: absoluteUrl(buildCanonicalPath(["tac-gia", postAuthor.slug])),
  };
  const publisher = { "@type": "Organization", name: SITE_NAME, url: getSiteUrl() };

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: absoluteUrl(cover),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author,
    publisher,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}
