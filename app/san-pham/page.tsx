import { Suspense } from "react";
import type { Metadata } from "next";
import { ShellLayout } from "@/components/ShellLayout";
import { CatalogFilters } from "@/components/CatalogFilters";
import { CatalogFiltersMobileTrigger } from "@/components/CatalogFiltersMobileTrigger";
import { CatalogGrid } from "@/components/CatalogGrid";
import { getAllProducts } from "@/lib/products";
import { getFilterOptions } from "@/lib/filters";
import { getCategoryLabels } from "@/lib/categories";
import { buildPageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

// D15: canonical never reflects filter params — bare listing path always
export const metadata: Metadata = buildPageMetadata({
  title: "Tất cả sản phẩm",
  description: "Khám phá toàn bộ sản phẩm gaming và công nghệ với giá tốt nhất.",
  path: "/san-pham/",
});

export default function SanPhamPage() {
  const products = getAllProducts();
  const options = getFilterOptions(products);
  const categoryLabels = getCategoryLabels();

  return (
    <ShellLayout
      leftPanel={
        <Suspense fallback={null}>
          <CatalogFilters options={options} categoryLabels={categoryLabels} />
        </Suspense>
      }
    >
      <Suspense fallback={null}>
        <CatalogFiltersMobileTrigger options={options} categoryLabels={categoryLabels} />
      </Suspense>
      <h1 className={styles.pageHeading}>Tất cả sản phẩm</h1>
      <Suspense fallback={<div className={styles.gridSkeleton} />}>
        <CatalogGrid products={products} />
      </Suspense>
    </ShellLayout>
  );
}
