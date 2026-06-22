import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { getAllProducts } from "@/lib/products";
import { getAllPosts } from "@/lib/posts";
import { buildPageMetadata } from "@/lib/seo";
import HomeHero from "@/components/HomeHero";
import {
  FeaturedProducts,
  MAX_FEATURED_PRODUCTS,
} from "@/components/FeaturedProducts";
import { CategoryHighlights } from "@/components/CategoryHighlights";
import { LatestPosts } from "@/components/LatestPosts";
import styles from "./page.module.css";

const HOME_TITLE = `${SITE_NAME} — Đồ chơi công nghệ & gaming Việt Nam`;

// Homepage title is an absolute override (matches root layout's title.default)
// so the root title.template doesn't double-append " | aff-store".
export const metadata: Metadata = {
  ...buildPageMetadata({
    title: HOME_TITLE,
    description:
      "Đánh giá, hướng dẫn mua và liên kết Shopee cho chuột, bàn phím, tai nghe gaming & gadget công nghệ — chọn nhanh sản phẩm tốt, đọc bài viết bằng tiếng Việt.",
    path: "/",
  }),
  title: { absolute: HOME_TITLE },
};

export default function HomePage() {
  const featured = getAllProducts()
    .filter((p) => p.featured)
    .slice(0, MAX_FEATURED_PRODUCTS);
  const posts = getAllPosts();

  return (
    <div className={styles.container}>
      <HomeHero />
      <FeaturedProducts products={featured} />
      <CategoryHighlights />
      <LatestPosts posts={posts} />
    </div>
  );
}
