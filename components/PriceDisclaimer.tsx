import { PRICE_CHANGE_DISCLAIMER_VI } from "@/lib/disclosures";
import styles from "./PriceDisclaimer.module.css";

/**
 * Price-may-have-changed notice for weekly deal-roundup posts — F0015 (US00152).
 * Rendered next to <AffiliateDisclosure /> only when `postHasDeals(post.slug)`
 * is true (app/bai-viet/[slug]/page.tsx) — ordinary buying guides never see it.
 */
export function PriceDisclaimer() {
  return (
    <aside className={styles.disclaimer} aria-label="Lưu ý về giá">
      <p className={styles.text}>{PRICE_CHANGE_DISCLAIMER_VI}</p>
    </aside>
  );
}
