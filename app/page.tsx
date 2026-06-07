import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import HomeHero from "@/components/HomeHero";
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
  return (
    <div className={styles.container}>
      <HomeHero />
      {/* US00082 placeholder: <FeaturedProducts /> */}
      {/* US00083 placeholder: <CategoryHighlights /> */}
      {/* US00084 placeholder: <LatestPosts /> */}
    </div>
  );
}
