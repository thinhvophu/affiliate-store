import Link from "next/link";
import type { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import styles from "./FeaturedProducts.module.css";

export const MAX_FEATURED_PRODUCTS = 8;

export interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const hasProducts = products.length > 0;

  return (
    <section
      className={styles.section}
      aria-labelledby="featured-products-heading"
    >
      <header className={styles.header}>
        <h2 id="featured-products-heading" className={styles.heading}>
          Sản phẩm nổi bật
        </h2>
        <Link href="/san-pham/" className={styles.viewAll}>
          Xem tất cả
        </Link>
      </header>

      {hasProducts ? (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Hiện chưa có sản phẩm nổi bật.</p>
      )}
    </section>
  );
}
