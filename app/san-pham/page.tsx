import { Suspense } from "react";
import { getAllProducts } from "@/lib/products";
import { ShellLayout } from "@/components/ShellLayout";
import { ProductCard } from "@/components/ProductCard";
import { ProductListingClient } from "@/components/ProductListingClient";
import styles from "@/components/ProductListingClient.module.css";
import type { Metadata } from "next";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Tất cả sản phẩm | TechShop",
  description: "Khám phá toàn bộ sản phẩm gaming và công nghệ với giá tốt nhất.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/san-pham/`,
  },
};

export default function ProductListingPage() {
  const products = getAllProducts();
  const page1 = products.slice(0, PAGE_SIZE);

  return (
    <ShellLayout leftPanel={null}>
      <h1 className={styles.pageHeading}>Tất cả sản phẩm</h1>
      <Suspense
        fallback={
          <div className={styles.grid}>
            {page1.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        }
      >
        <ProductListingClient products={products} />
      </Suspense>
    </ShellLayout>
  );
}
