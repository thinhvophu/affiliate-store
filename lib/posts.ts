import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Post } from "@/types";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function validatePostFrontmatter(
  data: Record<string, unknown>,
  filePath: string
): void {
  const requiredStrings: string[] = [
    "title",
    "summary",
    "publishedAt",
    "category",
    "coverImage",
  ];
  for (const field of requiredStrings) {
    if (typeof data[field] !== "string" || (data[field] as string).trim() === "") {
      throw new Error(
        `[content] ${filePath}: missing or invalid required frontmatter field "${field}".`
      );
    }
  }

  if (!Array.isArray(data.tags)) {
    throw new Error(
      `[content] ${filePath}: frontmatter "tags" must be an array of strings.`
    );
  }
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));

  if (files.length === 0) {
    return [];
  }

  const posts: Post[] = [];
  const slugMap = new Map<string, string>();

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    let raw: string;
    try {
      raw = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      throw new Error(`[content] ${filePath}: unable to read file. ${err}`);
    }

    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(raw);
    } catch (err) {
      throw new Error(
        `[content] ${filePath}: failed to parse frontmatter. ${err}`
      );
    }

    const frontmatter = parsed.data as Record<string, unknown>;
    validatePostFrontmatter(frontmatter, filePath);

    const slug = path.basename(file, ".mdx");

    const existing = slugMap.get(slug);
    if (existing) {
      throw new Error(
        `[content] Duplicate post slug "${slug}" found in:\n` +
          `  - ${existing}\n` +
          `  - ${filePath}\n` +
          `Slugs must be unique because they are used as URL keys.`
      );
    }
    slugMap.set(slug, filePath);

    posts.push({
      slug,
      title: frontmatter.title as string,
      summary: frontmatter.summary as string,
      publishedAt: frontmatter.publishedAt as string,
      category: frontmatter.category as string,
      tags: frontmatter.tags as string[],
      coverImage: frontmatter.coverImage as string,
      content: parsed.content,
    });
  }

  posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}
