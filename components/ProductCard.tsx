import Image from "next/image";
import { AffiliateLink } from "@/components/AffiliateLink";
import affiliateStyles from "@/components/AffiliateLink.module.css";
import { formatVnd } from "@/lib/format";
import type { Product } from "@/types";
import styles from "./ProductCard.module.css";

/**
 * Standard product summary card — F0004 (US00042).
 *
 * Consumed by: product listing grid (US00043), category page grid (US00045),
 * related-products row (US00047), inline MDX <ProductCard slug="…" /> (F0006),
 * homepage featured picks (F0008).
 *
 * The entire card surface is ONE affiliate link (whole-card pattern — US00032).
 * Tab-focus stops exactly once per card. The "Mua ngay" CTA is a <span> —
 * NEVER <button>, NEVER a nested <a>.
 *
 * Server Component — zero hydration cost. The grid container (US00043 / US00045
 * / US00047) owns the responsive column count; this card is fluid inside
 * whatever cell it lands in. The grid MUST use align-items: stretch (CSS Grid
 * default) for the height: 100% fill to work correctly across a row.
 *
 * Requires product.images.length >= 1. Enforcement lives in lib/products.ts;
 * the card trusts the loader per D19 of the approved plan.
 */
export interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <AffiliateLink
      className={`${affiliateStyles.card} ${styles.card}`}
      href={product.affiliateUrl}
      productName={product.name}
      productCategory={product.category}
    >
      <div className={styles.imageFrame}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={styles.image}
        />
        <span className={styles.categoryBadge}>{product.category}</span>
      </div>

      <h3 className={styles.name}>{product.name}</h3>
      <p className={styles.brand}>{product.brand}</p>
      <p className={styles.price}>{formatVnd(product.price)}</p>

      <span data-affiliate-cta className={styles.cta}>
        Mua ngay
      </span>
    </AffiliateLink>
  );
}
