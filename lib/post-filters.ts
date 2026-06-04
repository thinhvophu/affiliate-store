import type { Post } from "@/types";

export interface PostFilterOptions {
  categories: string[];
  tags: string[];
}

export interface ActivePostFilters {
  categories: string[];
  tags: string[];
}

export function getPostFilterOptions(posts: readonly Post[]): PostFilterOptions {
  const categories = Array.from(new Set(posts.map((p) => p.category))).sort((a, b) =>
    a.localeCompare(b, "vi"),
  );
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort((a, b) =>
    a.localeCompare(b, "vi"),
  );
  return { categories, tags };
}

export function parsePostFilterParams(
  params: URLSearchParams,
  options: PostFilterOptions,
): ActivePostFilters {
  const knownCategories = new Set(options.categories);
  const knownTags = new Set(options.tags);

  const readList = (key: string): string[] =>
    (params.get(key) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const categories = readList("category").filter((c) => knownCategories.has(c));
  const tags = readList("tag").filter((t) => knownTags.has(t));

  return { categories, tags };
}

export function serializePostFilterParams(f: ActivePostFilters): URLSearchParams {
  const out = new URLSearchParams();
  if (f.categories.length > 0) out.set("category", f.categories.join(","));
  if (f.tags.length > 0) out.set("tag", f.tags.join(","));
  return out;
}

// AND across dimensions: post must match selected category AND contain at least one selected tag.
// Preserves getAllPosts() newest-first order (no re-sort).
export function applyPostFilters(posts: readonly Post[], f: ActivePostFilters): Post[] {
  const catSet = new Set(f.categories);
  const tagSet = new Set(f.tags);

  return posts.filter((p) => {
    if (catSet.size > 0 && !catSet.has(p.category)) return false;
    if (tagSet.size > 0 && !p.tags.some((t) => tagSet.has(t))) return false;
    return true;
  });
}

export function countActivePostFilters(f: ActivePostFilters): number {
  return f.categories.length + f.tags.length;
}
