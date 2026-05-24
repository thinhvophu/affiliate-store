import Link from "next/link";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";
import styles from "./CategoryNav.module.css";

export interface CategoryNavProps {
  /** Currently displayed category slug; omitted from the nav list. */
  currentSlug: CategorySlug;
}

export function CategoryNav({ currentSlug }: CategoryNavProps) {
  const others = Object.values(CATEGORIES).filter((c) => c.slug !== currentSlug);
  if (others.length === 0) return null;

  return (
    <aside>
      <nav aria-label="Danh mục">
        <p className={styles.label}>Danh mục khác</p>
        <ul className={styles.list}>
          {others.map((c) => (
            <li key={c.slug}>
              <Link href={`/danh-muc/${c.slug}/`} className={styles.link}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
