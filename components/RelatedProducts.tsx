/**
 * RelatedProducts — US00047 / F0004
 *
 * Server Component. Renders the "Sản phẩm liên quan" section on a product
 * detail page. Accepts a pre-computed array of 0 | 3 | 4 Product objects
 * from getRelatedProducts() in lib/products.ts.
 *
 * Returns null when products.length < 3 so the detail page can mount this
 * component unconditionally (Scenario 4 / D10).
 */

import type { CSSProperties } from "react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import styles from "./RelatedProducts.module.css";

export interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length < 3) return null;

  return (
    <section
      className={styles.section}
      aria-labelledby="related-products-heading"
    >
      <h2 id="related-products-heading" className={styles.heading}>
        Sản phẩm liên quan
      </h2>
      <div
        className={styles.grid}
        style={{ "--related-count": products.length } as CSSProperties}
      >
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
