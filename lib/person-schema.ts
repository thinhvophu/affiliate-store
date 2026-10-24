import type { Author } from "@/lib/authors";
import { absoluteUrl, buildCanonicalPath, getSiteUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export function buildPersonSchema(author: Author): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: absoluteUrl(buildCanonicalPath(["tac-gia", author.slug])),
    description: author.bio[0],
    ...(author.jobTitle && { jobTitle: author.jobTitle }),
    ...(author.avatar && { image: absoluteUrl(author.avatar) }),
    ...(author.sameAs?.length && { sameAs: author.sameAs }),
    worksFor: { "@type": "Organization", name: SITE_NAME, url: getSiteUrl() },
  };
}
