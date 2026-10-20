/**
 * Reads the `publishedAt` of an already-published evergreen roundup so a
 * weekly overwrite keeps the post's original publish date (F0016/US00162, D2).
 */

import fs from "node:fs";
import matter from "gray-matter";

export function readExistingPublishedAt(postPath: string): string | undefined {
  if (!fs.existsSync(postPath)) return undefined;

  let publishedAt: unknown;
  try {
    publishedAt = matter(fs.readFileSync(postPath, "utf-8")).data.publishedAt;
  } catch (err) {
    throw new Error(`[deal-roundup] ${postPath}: unparsable frontmatter. ${err}`);
  }

  if (typeof publishedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) {
    throw new Error(
      `[deal-roundup] ${postPath}: existing post has no valid publishedAt — refusing to reset it.`,
    );
  }
  return publishedAt;
}
