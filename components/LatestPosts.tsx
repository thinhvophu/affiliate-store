import Link from "next/link";
import type { Post } from "@/types";
import { PostCard } from "@/components/PostCard";
import styles from "./LatestPosts.module.css";

export const LATEST_POSTS_COUNT = 4;

export interface LatestPostsProps {
  posts: Post[];
}

export function LatestPosts({ posts }: LatestPostsProps) {
  const latest = posts.slice(0, LATEST_POSTS_COUNT);

  if (latest.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="latest-posts-heading">
      <header className={styles.header}>
        <h2 id="latest-posts-heading" className={styles.heading}>
          Bài viết mới nhất
        </h2>
        <Link href="/bai-viet/" className={styles.seeAll}>
          Xem tất cả
        </Link>
      </header>
      <div className={styles.grid} data-count={latest.length}>
        {latest.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
