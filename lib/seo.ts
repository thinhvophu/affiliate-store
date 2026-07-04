import type { Metadata } from "next";
import { env } from "@/lib/env";
import { SITE_NAME } from "@/lib/site";

export function getSiteUrl(): string {
  return env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = getSiteUrl();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function buildCanonicalPath(segments: ReadonlyArray<string>): string {
  if (segments.length === 0) return "/";
  const joined = segments
    .map((s) => s.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
  return `/${joined}/`;
}

export const DEFAULT_OG_IMAGE = "/static/images/og-default.png";
export const DEFAULT_OG_LOCALE = "vi_VN";

const DEFAULT_DESCRIPTION_VI =
  "Đánh giá, hướng dẫn mua và liên kết Shopee cho chuột, bàn phím, tai nghe gaming & gadget công nghệ — chọn nhanh sản phẩm tốt, đọc bài viết bằng tiếng Việt.";

export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      template: `%s | ${SITE_NAME}`,
      default: `${SITE_NAME} — Đồ chơi công nghệ & gaming Việt Nam`,
    },
    description: DEFAULT_DESCRIPTION_VI,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: DEFAULT_OG_LOCALE,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

/** Maximum length for <meta description>. SERP snippets are typically ~150–160 chars. */
export const MAX_META_DESCRIPTION_LENGTH = 160;

/**
 * Truncate a description to ≤max chars at a sentence/word boundary.
 * Order of preference: full text → sentence boundary (last ". ") ≥ 80 chars in →
 * last word boundary → hard slice + ellipsis. Never cuts a word in half.
 */
export function truncateMetaDescription(
  text: string,
  max: number = MAX_META_DESCRIPTION_LENGTH,
): string {
  if (text.length <= max) return text;

  const slice = text.slice(0, max);
  const sentenceEnd = slice.lastIndexOf(". ");
  if (sentenceEnd >= 80) return slice.slice(0, sentenceEnd + 1);

  const wordEnd = slice.lastIndexOf(" ");
  const truncated = wordEnd > 0 ? slice.slice(0, wordEnd) : slice;
  return `${truncated}…`;
}

export interface PageMetadataInput {
  /** Page title (raw — title template adds " | <site name>"). */
  title: string;
  /** Long-form description; truncated for <meta description>. */
  description: string;
  /** Absolute-from-root path WITH trailing slash, e.g. "/san-pham/". */
  path: string;
  /** Optional per-page OG image (absolute or root-relative). Falls back to DEFAULT_OG_IMAGE. */
  ogImage?: string;
  /** Optional OG image alt text. Falls back to title. */
  ogImageAlt?: string;
  /** OG type. Defaults to "website"; product/post details pass "article". */
  ogType?: "website" | "article";
}

/** Per-page metadata builder lives in one place: lib/seo.ts. No file outside this module
 * may build a canonical URL, truncate a meta description, or assemble an OG/Twitter object. */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const { title, description, path, ogImage, ogImageAlt, ogType = "website" } = input;
  const truncatedDescription = truncateMetaDescription(description);
  const image = ogImage ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description: truncatedDescription,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: truncatedDescription,
      url: path,
      type: ogType,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: ogImageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: truncatedDescription,
      images: [image],
    },
  };
}
