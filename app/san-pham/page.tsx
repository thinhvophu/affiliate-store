import { Suspense } from "react";
import type { Metadata } from "next";
import { ShellLayout } from "@/components/ShellLayout";
import { CatalogFilters } from "@/components/CatalogFilters";
import { CatalogFiltersMobileTrigger } from "@/components/CatalogFiltersMobileTrigger";
import { CatalogGrid } from "@/components/CatalogGrid";
import { getAllProducts } from "@/lib/products";
import { getFilterOptions } from "@/lib/filters";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Tất cả sản phẩm | TechShop",
  description: "Khám phá toàn bộ sản phẩm gaming và công nghệ với giá tốt nhất.",
  // D15: canonical never reflects filter params — bare listing path always
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/san-pham/`,
  },
};

export default function SanPhamPage() {
  const products = getAllProducts();
  const options = getFilterOptions(products);

  return (
    <ShellLayout
      leftPanel={
        <Suspense fallback={null}>
          <CatalogFilters options={options} />
        </Suspense>
      }
    >
      <Suspense fallback={null}>
        <CatalogFiltersMobileTrigger options={options} />
      </Suspense>
      <h1 className={styles.pageHeading}>Tất cả sản phẩm</h1>
      <Suspense fallback={<div className={styles.gridSkeleton} />}>
        <CatalogGrid products={products} />
      </Suspense>
    </ShellLayout>
  );
}
