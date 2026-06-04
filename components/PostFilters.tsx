"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  parsePostFilterParams,
  serializePostFilterParams,
  countActivePostFilters,
  type ActivePostFilters,
  type PostFilterOptions,
} from "@/lib/post-filters";
import styles from "./PostFilters.module.css";

interface Props {
  options: PostFilterOptions;
  categoryLabels?: Record<string, string>;
}

export function PostFilters({ options, categoryLabels }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active: ActivePostFilters = useMemo(
    () => parsePostFilterParams(new URLSearchParams(searchParams.toString()), options),
    [searchParams, options],
  );

  const writeFilters = useCallback(
    (next: ActivePostFilters) => {
      const params = serializePostFilterParams(next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const toggle = useCallback(
    (key: "categories" | "tags", value: string) => {
      const current = active[key];
      const exists = current.includes(value);
      const nextList = exists ? current.filter((v) => v !== value) : [...current, value];
      writeFilters({ ...active, [key]: nextList });
    },
    [active, writeFilters],
  );

  const clearAll = useCallback(
    () => writeFilters({ categories: [], tags: [] }),
    [writeFilters],
  );

  const count = countActivePostFilters(active);
  const categoryLabel = (slug: string) => categoryLabels?.[slug] ?? slug;

  return (
    <aside className={styles.root} aria-label="Bộ lọc bài viết">
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
            {active.tags.map((t) => (
              <li key={`tag-${t}`}>
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => toggle("tags", t)}
                  aria-label={`Bỏ chọn tag ${t}`}
                >
                  {t} ×
                </button>
              </li>
            ))}
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
        <legend className={styles.legend}>Thẻ</legend>
        {options.tags.length === 0 && (
          <p className={styles.empty}>Chưa có thẻ</p>
        )}
        {options.tags.map((t) => (
          <label key={t} className={styles.option}>
            <input
              type="checkbox"
              checked={active.tags.includes(t)}
              onChange={() => toggle("tags", t)}
            />
            <span>{t}</span>
          </label>
        ))}
      </fieldset>
    </aside>
  );
}
