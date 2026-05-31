import { Suspense } from "react";
import type { Metadata } from "next";
import { PostListingClient } from "@/components/PostListingClient";
import { getAllPosts } from "@/lib/posts";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Bài viết & hướng dẫn mua sắm | TechShop",
  description:
    "Đánh giá, hướng dẫn mua sắm và mẹo chọn thiết bị gaming, công nghệ — cập nhật mới nhất.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/bai-viet/` },
};

export default function BaiVietPage() {
  const posts = getAllPosts();
  return (
    <>
      <h1 className={styles.pageHeading}>Bài viết</h1>
      <Suspense fallback={<div className={styles.gridSkeleton} />}>
        <PostListingClient posts={posts} />
      </Suspense>
    </>
  );
}
