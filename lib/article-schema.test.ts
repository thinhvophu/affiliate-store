import { describe, it, expect } from "vitest";
import { buildArticleSchema } from "./article-schema";
import type { Post } from "@/types";

const fixturePost: Post = {
  slug: "top-5-tai-nghe-gaming",
  title: "Top 5 Tai Nghe Gaming Dưới 500k Năm 2026",
  summary: "Tổng hợp tai nghe gaming đáng mua trong tầm giá 500k.",
  publishedAt: "2026-05-20",
  category: "tai-nghe",
  tags: ["tai nghe gaming", "budget"],
  coverImage: "/static/images/blog/tai-nghe-gaming-500k.png",
  content: "# Hello",
};

describe("buildArticleSchema", () => {
  it("builds a complete Article schema", () => {
    const schema = buildArticleSchema(fixturePost);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Article");
    expect(schema.headline).toBe(fixturePost.title);
    expect(schema.image).toBe(
      "https://example.com/static/images/blog/tai-nghe-gaming-500k.png",
    );
    expect(schema.datePublished).toBe("2026-05-20");
    expect(schema.author).toEqual({
      "@type": "Organization",
      name: "aff-store",
      url: "https://example.com",
    });
    expect(schema.publisher).toEqual(schema.author);
    expect(schema.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": "https://example.com/bai-viet/top-5-tai-nghe-gaming/",
    });
  });

  it("falls back to the default OG image when coverImage is empty", () => {
    const post: Post = { ...fixturePost, coverImage: "" };
    const schema = buildArticleSchema(post);
    expect(schema.image).toBe("https://example.com/static/images/og-default.png");
  });

  it("falls back to the default OG image when coverImage is whitespace only", () => {
    const post: Post = { ...fixturePost, coverImage: "   " };
    const schema = buildArticleSchema(post);
    expect(schema.image).toBe("https://example.com/static/images/og-default.png");
  });

  it("returns an already-absolute coverImage unchanged", () => {
    const post: Post = { ...fixturePost, coverImage: "https://cdn.example.com/x.jpg" };
    const schema = buildArticleSchema(post);
    expect(schema.image).toBe("https://cdn.example.com/x.jpg");
  });

  it("mainEntityOfPage @id ends with a single trailing slash, no double slash", () => {
    const schema = buildArticleSchema(fixturePost);
    const mainEntity = schema.mainEntityOfPage as Record<string, unknown>;
    expect(mainEntity["@id"]).toMatch(/\/bai-viet\/top-5-tai-nghe-gaming\/$/);
    expect(mainEntity["@id"]).not.toMatch(/\/\/bai-viet/);
  });

  it("headline is the verbatim post title, no truncation", () => {
    const longTitlePost: Post = {
      ...fixturePost,
      title:
        "Đây Là Một Tiêu Đề Rất Dài Để Kiểm Tra Rằng Headline Không Bị Cắt Ngắn Trong JSON-LD",
    };
    const schema = buildArticleSchema(longTitlePost);
    expect(schema.headline).toBe(longTitlePost.title);
  });

  it("datePublished is the raw ISO string, not reformatted", () => {
    const schema = buildArticleSchema(fixturePost);
    expect(schema.datePublished).toBe("2026-05-20");
  });

  it("author and publisher are identical Organization objects using SITE_NAME", () => {
    const schema = buildArticleSchema(fixturePost);
    expect(schema.author).toEqual(schema.publisher);
    const author = schema.author as Record<string, unknown>;
    expect(author["@type"]).toBe("Organization");
    expect(author.name).toBe("aff-store");
  });
});
