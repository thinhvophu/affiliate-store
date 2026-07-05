import type { MetadataRoute } from "next";
import { absoluteUrl, buildCanonicalPath } from "@/lib/seo";
import { getAllProducts } from "@/lib/products";
import { getAllPosts } from "@/lib/posts";
import { getAllCategorySlugs } from "@/lib/categories";

const BUILD_TIME = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getAllProducts();
  const posts = getAllPosts();
  const categorySlugs = getAllCategorySlugs();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl(buildCanonicalPath([])), lastModified: BUILD_TIME },
    { url: absoluteUrl(buildCanonicalPath(["san-pham"])), lastModified: BUILD_TIME },
    { url: absoluteUrl(buildCanonicalPath(["bai-viet"])), lastModified: BUILD_TIME },
    { url: absoluteUrl(buildCanonicalPath(["ve-chung-toi"])), lastModified: BUILD_TIME },
    { url: absoluteUrl(buildCanonicalPath(["chinh-sach-bao-mat"])), lastModified: BUILD_TIME },
    { url: absoluteUrl(buildCanonicalPath(["cong-bo-tiep-thi-lien-ket"])), lastModified: BUILD_TIME },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: absoluteUrl(buildCanonicalPath(["danh-muc", slug])),
    lastModified: BUILD_TIME,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(buildCanonicalPath(["san-pham", p.slug])),
    lastModified: new Date(p.publishedAt),
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(buildCanonicalPath(["bai-viet", post.slug])),
    lastModified: new Date(post.publishedAt),
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries, ...postEntries];
}
