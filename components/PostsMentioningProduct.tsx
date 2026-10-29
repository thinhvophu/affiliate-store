import Link from "next/link";
import type { Post } from "@/types";
import styles from "./PostsMentioningProduct.module.css";

export interface PostsMentioningProductProps {
  posts: Post[];
}

export function PostsMentioningProduct({ posts }: PostsMentioningProductProps) {
  if (posts.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="posts-mentioning-heading">
      <h2 id="posts-mentioning-heading" className={styles.heading}>
        Bài viết nhắc đến sản phẩm này
      </h2>
      <ul className={styles.list}>
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/bai-viet/${p.slug}`} className={styles.link}>
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
