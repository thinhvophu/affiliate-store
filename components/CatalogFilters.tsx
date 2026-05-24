"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  PRICE_BUCKETS,
  SORT_OPTIONS,
  DEFAULT_SORT_ID,
  parseFilterParams,
  serializeFilterParams,
  countActiveFilters,
  type ActiveFilters,
  type FilterOptions,
  type SortOption,
} from "@/lib/filters";
import styles from "./CatalogFilters.module.css";

interface Props {
  options: FilterOptions;
  categoryLabels?: Record<string, string>;
}

export function CatalogFilters({ options, categoryLabels }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active: ActiveFilters = useMemo(
    () => parseFilterParams(new URLSearchParams(searchParams.toString()), options),
    [searchParams, options],
  );

  // D13: replace not push; D14: strip ?page to reset pagination
  const writeFilters = useCallback(
    (next: ActiveFilters) => {
      const params = serializeFilterParams(next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const toggle = useCallback(
    <K extends "categories" | "brands" | "priceBucketIds">(
      key: K,
      value: string,
    ) => {
      const current = active[key] as string[];
      const exists = current.includes(value);
      const nextList = exists ? current.filter((v) => v !== value) : [...current, value];
      writeFilters({ ...active, [key]: nextList } as ActiveFilters);
    },
    [active, writeFilters],
  );

  const setSort = useCallback(
    (sort: SortOption["id"]) => writeFilters({ ...active, sort }),
    [active, writeFilters],
  );

  const clearAll = useCallback(
    () =>
      writeFilters({
        categories: [],
        brands: [],
        priceBucketIds: [],
        sort: DEFAULT_SORT_ID,
      }),
    [writeFilters],
  );

  const count = countActiveFilters(active);
  const categoryLabel = (slug: string) => categoryLabels?.[slug] ?? slug;

  return (
    <aside className={styles.root} aria-label="Bộ lọc sản phẩm">
      {count > 0 && (
        <div role="status" className={styles.status}>
          <div className={styles.statusRow}>
            <span className={styles.statusCount}>{count} bộ lọc đang áp dụng</span>
            <button type="button" onClick={clearAll} className={styles.clearAll}>
              Xóa tất cả
            </button>
          </div>
          <ul className={styles.chips}>
            {active.categories.map((c) => (
              <li key={`cat-${c}`}>
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => toggle("categories", c)}
                  aria-label={`Bỏ chọn danh mục ${categoryLabel(c)}`}
                >
                  {categoryLabel(c)} ×
                </button>
              </li>
            ))}
            {active.brands.map((b) => (
              <li key={`brand-${b}`}>
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => toggle("brands", b)}
                  aria-label={`Bỏ chọn thương hiệu ${b}`}
                >
                  {b} ×
                </button>
              </li>
            ))}
            {active.priceBucketIds.map((id) => {
              const bucket = PRICE_BUCKETS.find((b) => b.id === id);
              if (!bucket) return null;
              return (
                <li key={`price-${id}`}>
                  <button
                    type="button"
                    className={styles.chip}
                    onClick={() => toggle("priceBucketIds", id)}
                    aria-label={`Bỏ chọn giá ${bucket.label}`}
                  >
                    {bucket.label} ×
                  </button>
                </li>
              );
            })}
            {active.sort !== DEFAULT_SORT_ID && (
              <li key="sort">
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => setSort(DEFAULT_SORT_ID)}
                  aria-label={`Bỏ chọn sắp xếp ${SORT_OPTIONS.find((s) => s.id === active.sort)?.label}`}
                >
                  {SORT_OPTIONS.find((s) => s.id === active.sort)?.label} ×
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Danh mục</legend>
        {options.categories.length === 0 && (
          <p className={styles.empty}>Chưa có danh mục</p>
        )}
        {options.categories.map((c) => (
          <label key={c} className={styles.option}>
            <input
              type="checkbox"
              checked={active.categories.includes(c)}
              onChange={() => toggle("categories", c)}
            />
            <span>{categoryLabel(c)}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Thương hiệu</legend>
        {options.brands.length === 0 && (
          <p className={styles.empty}>Chưa có thương hiệu</p>
        )}
        {options.brands.map((b) => (
          <label key={b} className={styles.option}>
            <input
              type="checkbox"
              checked={active.brands.includes(b)}
              onChange={() => toggle("brands", b)}
            />
            <span>{b}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Giá</legend>
        {PRICE_BUCKETS.map((b) => (
          <label key={b.id} className={styles.option}>
            <input
              type="checkbox"
              checked={active.priceBucketIds.includes(b.id)}
              onChange={() => toggle("priceBucketIds", b.id)}
            />
            <span>{b.label}</span>
          </label>
        ))}
      </fieldset>

      <div className={styles.group}>
        <label htmlFor="catalog-sort" className={styles.legend}>
          Sắp xếp
        </label>
        <select
          id="catalog-sort"
          className={styles.select}
          value={active.sort}
          onChange={(e) => setSort(e.target.value as SortOption["id"])}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
