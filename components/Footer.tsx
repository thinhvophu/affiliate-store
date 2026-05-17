import Link from "next/link";
import { AFFILIATE_DISCLOSURE_VI } from "@/lib/disclosures";
import styles from "./Footer.module.css";

const CONTACT_EMAIL = "ttln1201@gmail.com";

export function Footer() {
  const year = new Date().getUTCFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.topAccent} aria-hidden="true" />

      <div className={styles.container}>
        <section className={styles.column} aria-labelledby="footer-col-about">
          <h2 id="footer-col-about" className={styles.columnTitle}>
            Về chúng tôi
          </h2>
          <ul className={styles.columnList}>
            <li>
              <Link href="/ve-chung-toi/" className={styles.columnLink}>
                Giới thiệu
              </Link>
            </li>
          </ul>
        </section>

        <section className={styles.column} aria-labelledby="footer-col-policy">
          <h2 id="footer-col-policy" className={styles.columnTitle}>
            Chính sách
          </h2>
          <ul className={styles.columnList}>
            <li>
              <Link href="/chinh-sach-bao-mat/" className={styles.columnLink}>
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link
                href="/cong-bo-tiep-thi-lien-ket/"
                className={styles.columnLink}
              >
                Công bố tiếp thị liên kết
              </Link>
            </li>
          </ul>
        </section>

        <section
          className={styles.column}
          aria-labelledby="footer-col-contact"
        >
          <h2 id="footer-col-contact" className={styles.columnTitle}>
            Liên hệ
          </h2>
          <ul className={styles.columnList}>
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className={styles.columnLink}
              >
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </section>

        <section className={styles.column} aria-labelledby="footer-col-follow">
          <h2 id="footer-col-follow" className={styles.columnTitle}>
            Theo dõi
          </h2>
          <p className={styles.columnPlaceholder}>Sắp ra mắt</p>
        </section>
      </div>

      <div className={styles.meta}>
        <small className={styles.disclosure}>{AFFILIATE_DISCLOSURE_VI}</small>
        <p className={styles.copyright}>
          © {year} aff-store. Mọi quyền được bảo lưu.
        </p>
      </div>
    </footer>
  );
}
