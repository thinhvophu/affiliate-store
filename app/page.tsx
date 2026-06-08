import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { getAllProducts } from "@/lib/products";
import { getAllPosts } from "@/lib/posts";
import HomeHero from "@/components/HomeHero";
import {
  FeaturedProducts,
  MAX_FEATURED_PRODUCTS,
} from "@/components/FeaturedProducts";
import { CategoryHighlights } from "@/components/CategoryHighlights";
import { LatestPosts } from "@/components/LatestPosts";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Đồ chơi công nghệ & gaming Việt Nam`,
  description:
    "Đánh giá, hướng dẫn mua và liên kết Shopee cho chuột, bàn phím, tai nghe gaming & gadget công nghệ — chọn nhanh sản phẩm tốt, đọc bài viết bằng tiếng Việt.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/`,
  },
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
