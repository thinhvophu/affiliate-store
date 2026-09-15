import Image from "next/image";
import { AffiliateLink } from "@/components/AffiliateLink";
import affiliateStyles from "@/components/AffiliateLink.module.css";
import { formatVnd } from "@/lib/format";
import type { Deal } from "@/types";
import styles from "./DealCard.module.css";

/**
 * Weekly deal-roundup card — F0015 (US00152).
 *
 * Structural sibling of `ProductCard` (US00042): whole-card `<AffiliateLink>`,
 * same no-nested-interactives rule, same `formatVnd` price chokepoint. Every
 * F0003↔F0007 data-* contract attribute is emitted by `<AffiliateLink>`
 * itself, so `AffiliateClickTracker` fires `affiliate_click` for deal-card
 * clicks with zero changes to it or to lib/analytics.ts.
 *
 * D5c — the strikethrough only renders when `originalPriceVnd` is genuinely
 * higher than `priceVnd`. Real scrape data sometimes reports both prices
 * equal alongside a non-zero discountPercent; rendering an identical
 * strikethrough price next to the sale price would look broken. The badge
 * still shows the tool's discountPercent regardless — this repo treats the
 * tool's figures as authoritative and never recomputes a discount.
 */
export interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <AffiliateLink
      className={`${affiliateStyles.card} ${styles.card}`}
      href={deal.affiliateUrl}
      productName={deal.name}
      productCategory={deal.category}
    >
      <div className={styles.imageFrame}>
        <Image
          src={deal.image}
          alt={deal.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={styles.image}
        />
        {deal.discountPercent > 0 && (
          <span className={styles.discountBadge}>-{deal.discountPercent}%</span>
        )}
      </div>

      <h3 className={styles.name}>{deal.name}</h3>
      <p className={styles.priceRow}>
        <span className={styles.price}>{formatVnd(deal.priceVnd)}</span>
        {deal.originalPriceVnd > deal.priceVnd && (
          <s className={styles.originalPrice}>{formatVnd(deal.originalPriceVnd)}</s>
        )}
      </p>
      <p className={styles.social}>
        {deal.rating.toFixed(1)}★ · {deal.soldCount} đã bán
      </p>

      <span data-affiliate-cta className={styles.cta}>
        Xem deal
      </span>
    </AffiliateLink>
  );
}
