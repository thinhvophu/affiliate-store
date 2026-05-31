"use client";

import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import type { Post } from "@/types";
import styles from "./PostListingClient.module.css";

const PAGE_SIZE = 12;
const BASE_PATH = "/bai-viet/";

export function PostListingClient({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("page");
  const currentPage = raw ? parseInt(raw, 10) : 1;
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));

  if (posts.length === 0) {
    return <p className={styles.emptyState}>Chưa có bài viết nào.</p>;
  }

  if (!Number.isInteger(currentPage) || currentPage < 1 || currentPage > totalPages) {
    return <p className={styles.emptyState}>Trang không tồn tại.</p>;
  }

  const offset = (currentPage - 1) * PAGE_SIZE;
  const slice = posts.slice(offset, offset + PAGE_SIZE);

  return (
    <>
      <div className={styles.grid}>
        {slice.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath={BASE_PATH} />
    </>
  );
}
