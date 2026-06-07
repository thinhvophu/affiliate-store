import Link from "next/link";
import { CATEGORIES, getCategoryLabels } from "@/lib/categories";
import styles from "./CategoryHighlights.module.css";

export function CategoryHighlights() {
  const labels = getCategoryLabels();
  const slugs = Object.keys(CATEGORIES);

  if (slugs.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="home-categories-heading">
      <header className={styles.header}>
        <h2 id="home-categories-heading" className={styles.heading}>
          Danh mục
        </h2>
      </header>
      <ul className={styles.grid}>
        {slugs.map((slug) => (
          <li key={slug} className={styles.item}>
            <Link href={`/danh-muc/${slug}/`} className={styles.link}>
              {labels[slug]}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
