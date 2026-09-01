import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getAllPosts } from "./posts";
import { readImageSize, MIN_COVER_IMAGE_SHORT_SIDE_PX } from "./image-meta";
import { countWords, MIN_POST_WORDS } from "./format";

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

describe("getAllPosts() publish-grade depth (US00134)", () => {
  const posts = getAllPosts();

  it("every post clears the MIN_POST_WORDS depth floor — no exemption list", () => {
    const short = posts
      .map((p) => ({ slug: p.slug, words: countWords(p.content) }))
      .filter((p) => p.words < MIN_POST_WORDS);
    expect(short, `posts below ${MIN_POST_WORDS} words: ${JSON.stringify(short)}`).toEqual([]);
  });

  it("no post frontmatter or body carries a TODO placeholder", () => {
    for (const post of posts) {
      const haystack = [post.title, post.summary, post.content].join("\n");
      expect(haystack, `${post.slug} still has a TODO placeholder`).not.toMatch(/TODO/i);
    }
  });

  it("every post has at least one tag", () => {
    for (const post of posts) {
      expect(post.tags.length, `${post.slug} has no tags`).toBeGreaterThanOrEqual(1);
    }
  });

  it("every summary is a genuine 50–160 char meta description, not a truncated first line", () => {
    for (const post of posts) {
      expect(
        post.summary.length,
        `${post.slug}: summary is ${post.summary.length} chars`,
      ).toBeGreaterThanOrEqual(50);
      expect(
        post.summary.length,
        `${post.slug}: summary is ${post.summary.length} chars`,
      ).toBeLessThanOrEqual(160);

      const firstParagraph = post.content.trim().split(/\n\s*\n/)[0]?.trim() ?? "";
      const probe = post.summary.slice(0, 40);
      expect(
        firstParagraph.startsWith(probe),
        `${post.slug}: summary looks like a truncated copy of the body's first paragraph`,
      ).toBe(false);
    }
  });

  it("every post embeds at least one <ProductCard slug=…>", () => {
    for (const post of posts) {
      const embeds = post.content.match(/<ProductCard\s+slug="/g) ?? [];
      expect(embeds.length, `${post.slug} has no <ProductCard> embed`).toBeGreaterThanOrEqual(1);
    }
  });

  it("every post has at least two h2 sections so the TOC has something to render", () => {
    for (const post of posts) {
      const h2s = post.content.match(/^## /gm) ?? [];
      expect(h2s.length, `${post.slug} has ${h2s.length} h2 sections`).toBeGreaterThanOrEqual(2);
    }
  });
});
