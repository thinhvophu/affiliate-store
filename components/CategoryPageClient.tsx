"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import styles from "./CategoryPageClient.module.css";

const PAGE_SIZE = 24;

interface CategoryPageClientProps {
  /** All products pre-filtered to this category, sorted publishedAt desc + slug asc. */
  products: Product[];
  /** The category slug — used to build pagination hrefs. */
  categorySlug: string;
}

function CategoryGrid({ products, categorySlug }: CategoryPageClientProps) {
  const searchParams = useSearchParams();
  const rawPage = searchParams.get("page") ?? undefined;

  const n = rawPage === undefined ? 1 : Number(rawPage);
  const page = Number.isInteger(n) && n >= 1 ? n : 1;

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = products.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (products.length === 0) {
    return (
      <p className={styles.empty}>Chưa có sản phẩm trong danh mục này.</p>
    );
  }

  return (
    <>
      <ul className={styles.grid} role="list">
        {slice.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Pagination
            basePath={`/danh-muc/${categorySlug}`}
            currentPage={safePage}
            totalPages={totalPages}
          />
        </div>
      )}
    </>
  );
}

export function CategoryPageClient({ products, categorySlug }: CategoryPageClientProps) {
  const firstPage = products.slice(0, PAGE_SIZE);

  return (
    <Suspense
      fallback={
        <ul className={styles.grid} role="list">
          {firstPage.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      }
    >
      <CategoryGrid products={products} categorySlug={categorySlug} />
    </Suspense>
  );
}
