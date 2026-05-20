import Link from "next/link";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageHref = (page: number) =>
    page === 1 ? basePath : `${basePath}?page=${page}`;

  return (
    <nav className={styles.nav} aria-label="Phân trang">
      {currentPage > 1 && (
        <Link className={styles.link} href={pageHref(currentPage - 1)}>
          ← Trước
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          className={`${styles.link} ${page === currentPage ? styles.active : ""}`}
          href={pageHref(page)}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link className={styles.link} href={pageHref(currentPage + 1)}>
          Sau →
        </Link>
      )}
    </nav>
  );
}
