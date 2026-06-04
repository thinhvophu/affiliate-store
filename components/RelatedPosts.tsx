import type { CSSProperties } from "react";
import type { Post } from "@/types";
import { PostCard } from "@/components/PostCard";
import styles from "./RelatedPosts.module.css";

export interface RelatedPostsProps {
  posts: Post[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="related-posts-heading">
      <h2 id="related-posts-heading" className={styles.heading}>
        Bài viết liên quan
      </h2>
      <div
        className={styles.grid}
        style={{ "--related-count": posts.length } as CSSProperties}
      >
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </section>
  );
}
