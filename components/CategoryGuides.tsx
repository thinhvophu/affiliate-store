import Link from "next/link";
import type { Post } from "@/types";
import { formatPostDate } from "@/lib/format";
import styles from "./CategoryGuides.module.css";

export interface CategoryGuidesProps {
  heading: string;
  guides: Post[];
  dealPost?: Post | null;
  categoryLink?: { href: string; label: string };
}

export function CategoryGuides({ heading, guides, dealPost, categoryLink }: CategoryGuidesProps) {
  if (guides.length === 0 && !dealPost && !categoryLink) return null;

  return (
    <section className={styles.section} aria-labelledby="category-guides-heading">
      <h2 id="category-guides-heading" className={styles.heading}>
        {heading}
      </h2>
      {guides.length > 0 && (
        <ul className={styles.list}>
          {guides.map((g) => (
            <li key={g.slug} className={styles.item}>
              <Link href={`/bai-viet/${g.slug}`} className={styles.link}>
                {g.title}
              </Link>
              <span className={styles.date}>{formatPostDate(g.publishedAt)}</span>
              <p className={styles.summary}>{g.summary}</p>
            </li>
          ))}
        </ul>
      )}
      {(dealPost || categoryLink) && (
        <p className={styles.extra}>
          {dealPost && (
            <Link href={`/bai-viet/${dealPost.slug}`} className={styles.extraLink}>
              Xem deal tuần này →
            </Link>
          )}
          {categoryLink && (
            <Link href={categoryLink.href} className={styles.extraLink}>
              Xem tất cả sản phẩm {categoryLink.label.toLowerCase()} →
            </Link>
          )}
        </p>
      )}
    </section>
  );
}
