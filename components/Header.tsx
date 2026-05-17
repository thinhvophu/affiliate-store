import Link from "next/link";
import styles from "@/components/Header.module.css";
import { HeaderNav } from "@/components/HeaderNav";
import { HeaderMobileMenu } from "@/components/HeaderMobileMenu";

const SITE_NAME = "aff-store";

export function Header() {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={`${SITE_NAME} — Trang chủ`}>
          <span className={styles.logoMark} aria-hidden="true">
            AS
          </span>
          <span className={styles.siteName}>{SITE_NAME}</span>
        </Link>

        <HeaderNav />
        <HeaderMobileMenu />
      </div>
    </header>
  );
}
