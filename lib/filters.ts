import type { Product } from "@/types";
import { formatVnd } from "@/lib/format";

export interface PriceBucket {
  id: "under-200k" | "200-500k" | "500k-1tr" | "1tr-3tr" | "over-3tr";
  min: number;
  max: number;
  label: string;
}

export const PRICE_BUCKETS: readonly PriceBucket[] = [
  { id: "under-200k", min: 0, max: 200_000, label: `Dưới ${formatVnd(200_000)}` },
  {
    id: "200-500k",
    min: 200_000,
    max: 500_000,
    label: `${formatVnd(200_000)} – ${formatVnd(500_000)}`,
  },
  {
    id: "500k-1tr",
    min: 500_000,
    max: 1_000_000,
    label: `${formatVnd(500_000)} – ${formatVnd(1_000_000)}`,
  },
  {
    id: "1tr-3tr",
    min: 1_000_000,
    max: 3_000_000,
    label: `${formatVnd(1_000_000)} – ${formatVnd(3_000_000)}`,
  },
  {
    id: "over-3tr",
    min: 3_000_000,
    max: Number.POSITIVE_INFINITY,
    label: `Trên ${formatVnd(3_000_000)}`,
  },
] as const;

export interface SortOption {
  id: "relevance" | "price-asc" | "price-desc" | "newest";
  label: string;
}

export const SORT_OPTIONS: readonly SortOption[] = [
  { id: "relevance", label: "Mặc định" },
  { id: "price-asc", label: "Giá tăng dần" },
  { id: "price-desc", label: "Giá giảm dần" },
  { id: "newest", label: "Mới nhất" },
] as const;

export const DEFAULT_SORT_ID: SortOption["id"] = "relevance";

export interface FilterOptions {
  categories: string[];
  brands: string[];
  priceBuckets: readonly PriceBucket[];
}

export function getFilterOptions(products: readonly Product[]): FilterOptions {
  const categories = Array.from(new Set(products.map((p) => p.category))).sort((a, b) =>
    a.localeCompare(b, "vi"),
  );
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort((a, b) =>
    a.localeCompare(b, "vi"),
  );
  return { categories, brands, priceBuckets: PRICE_BUCKETS };
}

export interface ActiveFilters {
  categories: string[];
  brands: string[];
  priceBucketIds: PriceBucket["id"][];
  sort: SortOption["id"];
}

const PRICE_BUCKET_ID_SET = new Set(PRICE_BUCKETS.map((b) => b.id));
const SORT_ID_SET = new Set(SORT_OPTIONS.map((s) => s.id));

export function parseFilterParams(
  searchParams: URLSearchParams,
  options: FilterOptions,
): ActiveFilters {
  const knownCategories = new Set(options.categories);
  const knownBrands = new Set(options.brands);

  const readList = (key: string): string[] =>
    (searchParams.get(key) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const categories = readList("category").filter((c) => knownCategories.has(c));
  const brands = readList("brand").filter((b) => knownBrands.has(b));
  const priceBucketIds = readList("price").filter(
    (id): id is PriceBucket["id"] => PRICE_BUCKET_ID_SET.has(id as PriceBucket["id"]),
  );

  const sortRaw = searchParams.get("sort") ?? "";
  const sort: SortOption["id"] = SORT_ID_SET.has(sortRaw as SortOption["id"])
    ? (sortRaw as SortOption["id"])
    : DEFAULT_SORT_ID;

  return { categories, brands, priceBucketIds, sort };
}

export function serializeFilterParams(filters: ActiveFilters): URLSearchParams {
  const out = new URLSearchParams();
  if (filters.categories.length > 0) out.set("category", filters.categories.join(","));
  if (filters.brands.length > 0) out.set("brand", filters.brands.join(","));
  if (filters.priceBucketIds.length > 0) out.set("price", filters.priceBucketIds.join(","));
  if (filters.sort !== DEFAULT_SORT_ID) out.set("sort", filters.sort);
  return out;
}

// publishedAt desc, slug asc — shared with CatalogGrid so both use the same stable default order
export function compareDefault(a: Product, b: Product): number {
  const t = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  if (t !== 0) return t;
  return a.slug.localeCompare(b.slug);
}

export function applyFilters(products: readonly Product[], filters: ActiveFilters): Product[] {
  const catSet = new Set(filters.categories);
  const brandSet = new Set(filters.brands);
  const bucketSet = new Set(filters.priceBucketIds);
  const activeBuckets = PRICE_BUCKETS.filter((b) => bucketSet.has(b.id));

  const filtered = products.filter((p) => {
    if (catSet.size > 0 && !catSet.has(p.category)) return false;
    if (brandSet.size > 0 && !brandSet.has(p.brand)) return false;
    if (activeBuckets.length > 0) {
      const inAny = activeBuckets.some((b) => p.price >= b.min && p.price < b.max);
      if (!inAny) return false;
    }
    return true;
  });

  switch (filters.sort) {
    case "price-asc":
      return [...filtered].sort((a, b) => a.price - b.price || compareDefault(a, b));
    case "price-desc":
      return [...filtered].sort((a, b) => b.price - a.price || compareDefault(a, b));
    case "newest":
    case "relevance":
    default:
      return [...filtered].sort(compareDefault);
  }
}

export function countActiveFilters(filters: ActiveFilters): number {
  return (
    filters.categories.length +
    filters.brands.length +
    filters.priceBucketIds.length +
    (filters.sort !== DEFAULT_SORT_ID ? 1 : 0)
  );
}
