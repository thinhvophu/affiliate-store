import { AFFILIATE_DISCLOSURE_VI } from "@/lib/disclosures";
import styles from "./AffiliateDisclosure.module.css";

export function AffiliateDisclosure() {
  return (
    <aside className={styles.disclosure} aria-label="Công bố tiếp thị liên kết">
      <p className={styles.text}>{AFFILIATE_DISCLOSURE_VI}</p>
    </aside>
  );
}
