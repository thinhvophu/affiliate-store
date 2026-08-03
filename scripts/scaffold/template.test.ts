import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { renderPostStub } from "./template";

function input(overrides: Partial<Parameters<typeof renderPostStub>[0]> = {}) {
  return {
    title: "TODO: tiêu đề bài viết",
    summary: "TODO: tóm tắt bài viết",
    category: "chuot-gaming",
    publishedAt: "2026-08-03",
    coverImage: "/static/images/products/chuot-a-1.jpg",
    productSlugs: ["chuot-a"],
    ...overrides,
  };
}

describe("renderPostStub", () => {
  it("produces frontmatter with all required non-empty fields", () => {
    const { data } = matter(renderPostStub(input()));
    expect(data.title).toBe("TODO: tiêu đề bài viết");
    expect(data.summary).toBe("TODO: tóm tắt bài viết");
    expect(data.publishedAt).toBe("2026-08-03");
    expect(data.category).toBe("chuot-gaming");
    expect(data.coverImage).toBe("/static/images/products/chuot-a-1.jpg");
  });

  it("sets tags to an empty array", () => {
    const { data } = matter(renderPostStub(input()));
    expect(data.tags).toEqual([]);
  });

  it("embeds one <ProductCard slug> per named product, in order", () => {
    const { content } = matter(
      renderPostStub(input({ productSlugs: ["chuot-a", "ban-phim-b"] })),
    );
    expect(content).toContain('<ProductCard slug="chuot-a" />');
    expect(content).toContain('<ProductCard slug="ban-phim-b" />');
    expect(content.indexOf('slug="chuot-a"')).toBeLessThan(
      content.indexOf('slug="ban-phim-b"'),
    );
  });

  it("uses the given coverImage (first named product's image)", () => {
    const { data } = matter(
      renderPostStub(input({ coverImage: "/static/images/products/ban-phim-b-1.jpg" })),
    );
    expect(data.coverImage).toBe("/static/images/products/ban-phim-b-1.jpg");
  });

  it("parses back through gray-matter without error", () => {
    expect(() => matter(renderPostStub(input()))).not.toThrow();
  });
});
