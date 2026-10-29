import Link from "next/link";
import type { Post } from "@/types";
import styles from "./DealPageLink.module.css";

export interface DealPageLinkProps {
  dealPost: Post | null;
  categoryName: string;
}

export function DealPageLink({ dealPost, categoryName }: DealPageLinkProps) {
  if (!dealPost) return null;

  return (
    <aside className={styles.callout}>
      <Link href={`/bai-viet/${dealPost.slug}`} className={styles.link}>
        Xem deal {categoryName.toLowerCase()} tuần này →
      </Link>
    </aside>
  );
}
