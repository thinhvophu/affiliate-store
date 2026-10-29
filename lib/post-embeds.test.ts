import { describe, expect, it } from "vitest";
import type { Post } from "@/types";
import { extractProductEmbeds, getPostsEmbeddingProduct } from "./post-embeds";

function post(slug: string, publishedAt: string, content: string): Post {
  return {
    slug,
    title: slug,
    summary: "A summary that is at least fifty characters long for the test fixture.",
    publishedAt,
    category: "chuot-gaming",
    tags: ["x"],
    coverImage: "/x.jpg",
    content,
  };
}

describe("extractProductEmbeds", () => {
  it("returns unique slugs in first-seen order", () => {
    const content = `<ProductCard slug="b" />\n<ProductCard slug="a" />\n<ProductCard slug="b" />`;
    expect(extractProductEmbeds(content)).toEqual(["b", "a"]);
  });

  it("returns [] when there are no embeds", () => {
    expect(extractProductEmbeds("plain text")).toEqual([]);
  });
});

describe("getPostsEmbeddingProduct", () => {
  it("lists a post once even if it embeds the slug twice", () => {
    const posts = [post("p1", "2026-01-01", `<ProductCard slug="a" /> <ProductCard slug="a" />`)];
    expect(getPostsEmbeddingProduct("a", posts).map((p) => p.slug)).toEqual(["p1"]);
  });

  it("returns newest first across posts and skips non-embedding posts", () => {
    const posts = [
      post("old", "2026-01-01", `<ProductCard slug="a" />`),
      post("none", "2026-03-01", `<ProductCard slug="z" />`),
      post("new", "2026-02-01", `<ProductCard slug="a" />`),
    ];
    expect(getPostsEmbeddingProduct("a", posts).map((p) => p.slug)).toEqual(["new", "old"]);
  });

  it("returns [] when nothing embeds the product", () => {
    expect(getPostsEmbeddingProduct("a", [post("p", "2026-01-01", "x")])).toEqual([]);
  });
});
