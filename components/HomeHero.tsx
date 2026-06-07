import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import styles from "./HomeHero.module.css";

export default function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <p className={styles.eyebrow}>{SITE_NAME}</p>
      <h1 id="home-hero-heading" className={styles.heading}>
        Đồ chơi công nghệ &amp; gaming Việt Nam
      </h1>
      <p className={styles.tagline}>
        Đánh giá ngắn gọn, hướng dẫn mua thực tế, và liên kết Shopee cho chuột, bàn phím, tai nghe
        và phụ kiện công nghệ — chọn nhanh sản phẩm phù hợp với ngân sách của bạn.
      </p>
      <div className={styles.ctaGroup}>
        <Link href="/san-pham/" className={styles.ctaPrimary}>
          Khám phá sản phẩm
        </Link>
        <Link href="/bai-viet/" className={styles.ctaSecondary}>
          Đọc bài viết &amp; hướng dẫn
        </Link>
      </div>
    </section>
  );
}
