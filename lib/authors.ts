import type { Post } from "@/types";

export interface Author {
  slug: string;
  name: string;
  jobTitle?: string;
  bio: string[];
  avatar?: string;
  sameAs?: string[];
}

/** Marks owner-supplied details not yet received; lib/authors.test.ts fails while any remain. */
export const AUTHOR_PLACEHOLDER = "TODO(author)";

export const PRIMARY_AUTHOR_SLUG = "todo-author";

const AUTHORS: Record<string, Author> = {
  [PRIMARY_AUTHOR_SLUG]: {
    slug: PRIMARY_AUTHOR_SLUG,
    name: `${AUTHOR_PLACEHOLDER} tên tác giả`,
    jobTitle: `${AUTHOR_PLACEHOLDER} chức danh`,
    bio: [`${AUTHOR_PLACEHOLDER} tiểu sử 2–4 đoạn ngắn bằng tiếng Việt.`],
  },
};

export function getAllAuthors(): Author[] {
  return Object.values(AUTHORS);
}

export function getAuthor(slug: string): Author | undefined {
  return AUTHORS[slug];
}

export function assertAuthorRegistered(slug: string, postSlug: string): void {
  if (!getAuthor(slug)) {
    throw new Error(`[authors] post "${postSlug}": unknown author "${slug}".`);
  }
}

export function getPostAuthor(post: Post): Author {
  return AUTHORS[post.author ?? PRIMARY_AUTHOR_SLUG] ?? AUTHORS[PRIMARY_AUTHOR_SLUG];
}

/** Literal path so client bundles can use it without importing lib/seo.ts (US00161). */
export function authorPath(slug: string): string {
  return `/tac-gia/${slug}`;
}
