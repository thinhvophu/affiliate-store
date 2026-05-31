import Image from "next/image";
import Link from "next/link";
import { formatPostDate } from "@/lib/format";
import { getCategoryLabels } from "@/lib/categories";
import type { Post } from "@/types";
import styles from "./PostCard.module.css";

export function PostCard({ post }: { post: Post }) {
  const categoryLabels = getCategoryLabels();
  const categoryLabel = categoryLabels[post.category] ?? post.category;

  return (
    <Link href={`/bai-viet/${post.slug}/`} className={styles.card}>
      {post.coverImage && (
        <div className={styles.imageFrame}>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 33vw, 50vw"
            className={styles.image}
          />
        </div>
      )}
      <div className={styles.body}>
        <h2 className={styles.title}>{post.title}</h2>
        <p className={styles.summary}>{post.summary}</p>
        <div className={styles.meta}>
          <span className={styles.date}>{formatPostDate(post.publishedAt)}</span>
          <span className={styles.category}>{categoryLabel}</span>
        </div>
      </div>
    </Link>
  );
}
