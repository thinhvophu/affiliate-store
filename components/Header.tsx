import Link from "next/link";
import styles from "@/components/Header.module.css";
import { HeaderNav } from "@/components/HeaderNav";
import { HeaderMobileMenu } from "@/components/HeaderMobileMenu";
import { HeaderStickyShadow } from "@/components/HeaderStickyShadow";

const SITE_NAME = "aff-store";

export function Header() {
  return (
    <>
      <HeaderStickyShadow />
      <header className={styles.header} role="banner" data-site-header>
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
    </>
  );
}
