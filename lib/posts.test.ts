import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getAllPosts } from "./posts";
import { readImageSize, MIN_COVER_IMAGE_SHORT_SIDE_PX } from "./image-meta";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

describe("getAllPosts() cover images (US00133)", () => {
  const posts = getAllPosts();

  it("has at least one post", () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  it("every post's coverImage resolves to a real image at or above the floor", () => {
    for (const post of posts) {
      const size = readImageSize(post.coverImage);
      expect(size, `${post.slug}: coverImage "${post.coverImage}" should resolve`).not.toBeNull();
      const shortSide = Math.min(size!.width, size!.height);
      expect(shortSide).toBeGreaterThanOrEqual(MIN_COVER_IMAGE_SHORT_SIDE_PX);
    }
  });

  it("no two posts share the same coverImage", () => {
    const covers = posts.map((p) => p.coverImage);
    expect(new Set(covers).size).toBe(covers.length);
  });

  it("no post content references either deleted orphan placeholder", () => {
    const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
      expect(raw).not.toMatch(/logitech-g102-lightsync|keychron-k2-v2/);
    }
  });
});
