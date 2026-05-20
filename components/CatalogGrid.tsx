"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  applyFilters,
  parseFilterParams,
  getFilterOptions,
  DEFAULT_SORT_ID,
} from "@/lib/filters";
import type { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import styles from "./CatalogGrid.module.css";

const BASE_PATH = "/san-pham/";

interface Props {
  products: Product[];
  itemsPerPage?: number;
}

export function CatalogGrid({ products, itemsPerPage = 24 }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options = useMemo(() => getFilterOptions(products), [products]);

  const active = useMemo(
    () => parseFilterParams(new URLSearchParams(searchParams.toString()), options),
    [searchParams, options],
  );

  const filtered = useMemo(() => applyFilters(products, active), [products, active]);

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * itemsPerPage;
  const slice = filtered.slice(start, start + itemsPerPage);

  // Build extraParams for Pagination so filter state survives page navigation
  const paginationParams = useMemo((): Record<string, string> => {
    const p: Record<string, string> = {};
    if (active.categories.length > 0) p.category = active.categories.join(",");
    if (active.brands.length > 0) p.brand = active.brands.join(",");
    if (active.priceBucketIds.length > 0) p.price = active.priceBucketIds.join(",");
    if (active.sort !== DEFAULT_SORT_ID) p.sort = active.sort;
    return p;
  }, [active]);

  if (products.length === 0) {
    return <p className={styles.emptyState}>Chưa có sản phẩm nào.</p>;
  }

  if (filtered.length === 0) {
    return (
      <div className={styles.noResults} role="status">
        <p>Không có sản phẩm phù hợp với bộ lọc.</p>
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => router.replace(pathname, { scroll: false })}
        >
          Xóa bộ lọc
        </button>
      </div>
    );
  }

  return (
    <>
      <ul className={styles.grid}>
        {slice.map((p) => (
          <li key={p.slug}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        basePath={BASE_PATH}
        extraParams={paginationParams}
      />
    </>
  );
}
