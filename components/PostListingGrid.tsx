"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import {
  parsePostFilterParams,
  applyPostFilters,
  type PostFilterOptions,
} from "@/lib/post-filters";
import type { Post } from "@/types";
import styles from "./PostListingGrid.module.css";

const PAGE_SIZE = 12;
const BASE_PATH = "/bai-viet/";

interface Props {
  posts: Post[];
  options: PostFilterOptions;
}

export function PostListingGrid({ posts, options }: Props) {
  const searchParams = useSearchParams();

  const filtered = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    const active = parsePostFilterParams(params, options);
    return applyPostFilters(posts, active);
  }, [searchParams, posts, options]);

  const rawPage = searchParams.get("page");
  const currentPage = rawPage ? parseInt(rawPage, 10) : 1;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const hasActiveFilters = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return (params.get("category") ?? "").length > 0 || (params.get("tag") ?? "").length > 0;
  }, [searchParams]);

  if (posts.length === 0) {
    return <p className={styles.emptyState}>Chưa có bài viết nào.</p>;
  }

  if (filtered.length === 0 && hasActiveFilters) {
    return <p className={styles.noResults}>Không có bài viết nào phù hợp với bộ lọc đã chọn.</p>;
  }

  if (!Number.isInteger(currentPage) || currentPage < 1 || currentPage > totalPages) {
    return <p className={styles.emptyState}>Trang không tồn tại.</p>;
  }

  const offset = (currentPage - 1) * PAGE_SIZE;
  const slice = filtered.slice(offset, offset + PAGE_SIZE);

  const extraParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== "page") extraParams[key] = value;
  });

  return (
    <>
      <div className={styles.grid}>
        {slice.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={BASE_PATH}
        extraParams={extraParams}
      />
    </>
  );
}
