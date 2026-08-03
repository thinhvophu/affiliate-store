/**
 * MDX post-stub renderer — F0012 (US00126).
 *
 * Pure string builder: frontmatter satisfying `lib/posts.ts`'s
 * `validatePostFrontmatter` (non-empty title/summary/publishedAt/category/
 * coverImage, `tags` as an array) + one `<ProductCard slug>` embed per named
 * product. No filesystem access here — `scripts/scaffold-post.ts` owns I/O.
 */

export interface PostStubInput {
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  coverImage: string;
  productSlugs: string[];
}

export function renderPostStub(input: PostStubInput): string {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(input.title)}`,
    `summary: ${JSON.stringify(input.summary)}`,
    `publishedAt: ${JSON.stringify(input.publishedAt)}`,
    `category: ${JSON.stringify(input.category)}`,
    "tags: []",
    `coverImage: ${JSON.stringify(input.coverImage)}`,
    "---",
  ].join("\n");

  const body = [
    "",
    "{/* TODO: viết phần mở bài và nội dung đánh giá */}",
    "",
    ...input.productSlugs.map((slug) => `<ProductCard slug="${slug}" />`),
    "",
  ].join("\n");

  return `${frontmatter}\n${body}`;
}
