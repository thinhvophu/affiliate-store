import type { Metadata } from "next";
import { env } from "@/lib/env";
import { SITE_NAME } from "@/lib/site";

export function getSiteUrl(): string {
  return env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
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

export interface BuildPageMetadataOpts {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
}

export function buildPageMetadata(opts: BuildPageMetadataOpts): Metadata {
  const { title, description, path, image, type = "website", publishedTime } = opts;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      ...(publishedTime ? { publishedTime } : {}),
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
