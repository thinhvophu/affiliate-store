import { Suspense } from "react";
import type { Metadata } from "next";
import { ShellLayout } from "@/components/ShellLayout";
import { PostFilters } from "@/components/PostFilters";
import { PostListingGrid } from "@/components/PostListingGrid";
import { getAllPosts } from "@/lib/posts";
import { getPostFilterOptions } from "@/lib/post-filters";
import { getCategoryLabels } from "@/lib/categories";
import { buildPageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

// canonical never reflects filter params — bare path always
export const metadata: Metadata = buildPageMetadata({
  title: "Bài viết & hướng dẫn mua sắm",
  description:
    "Đánh giá, hướng dẫn mua sắm và mẹo chọn thiết bị gaming, công nghệ — cập nhật mới nhất.",
  path: "/bai-viet/",
});

export default function BaiVietPage() {
  const posts = getAllPosts();
  const options = getPostFilterOptions(posts);
  const categoryLabels = getCategoryLabels();

  return (
    <ShellLayout
      leftPanel={
        <Suspense fallback={null}>
          <PostFilters options={options} categoryLabels={categoryLabels} />
        </Suspense>
      }
      leftPanelTitle="Bộ lọc bài viết"
    >
      <h1 className={styles.pageHeading}>Bài viết</h1>
      <Suspense fallback={<div className={styles.gridSkeleton} />}>
        <PostListingGrid posts={posts} options={options} />
      </Suspense>
    </ShellLayout>
  );
}
