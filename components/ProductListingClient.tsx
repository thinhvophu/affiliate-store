"use client";

import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import type { Product } from "@/types";
import styles from "./ProductListingClient.module.css";

const PAGE_SIZE = 24;
const BASE_PATH = "/san-pham/";

export function ProductListingClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("page");
  const currentPage = raw ? parseInt(raw, 10) : 1;
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  if (products.length === 0) {
    return <p className={styles.emptyState}>Chưa có sản phẩm nào.</p>;
  }

  if (!Number.isInteger(currentPage) || currentPage < 1 || currentPage > totalPages) {
    return <p className={styles.emptyState}>Trang không tồn tại.</p>;
  }

  const offset = (currentPage - 1) * PAGE_SIZE;
  const slice = products.slice(offset, offset + PAGE_SIZE);

  return (
    <>
      <div className={styles.grid}>
        {slice.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath={BASE_PATH} />
    </>
  );
}
