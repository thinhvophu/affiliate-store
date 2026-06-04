import type { TocEntry } from "@/lib/toc";
import styles from "./TableOfContents.module.css";

interface Props {
  entries: TocEntry[];
}

export function TableOfContents({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <nav aria-label="Mục lục" className={styles.nav}>
      <p className={styles.heading}>Mục lục</p>
      <ol className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id} className={entry.depth === 3 ? styles.h3Item : styles.h2Item}>
            <a href={`#${entry.id}`} className={styles.link}>
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
