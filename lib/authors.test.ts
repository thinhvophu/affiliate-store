import { describe, it, expect } from "vitest";
import {
  AUTHOR_PLACEHOLDER,
  PRIMARY_AUTHOR_SLUG,
  assertAuthorRegistered,
  authorPath,
  getAllAuthors,
  getAuthor,
  getPostAuthor,
} from "./authors";
import { validatePostAuthor } from "./posts";
import type { Post } from "@/types";

const post: Post = {
  slug: "p",
  title: "t",
  summary: "s",
  publishedAt: "2026-05-01",
  category: "chuot-gaming",
  tags: [],
  coverImage: "/x.png",
  content: "",
};

describe("authors registry (US00166)", () => {
  it("getPostAuthor falls back to the primary author", () => {
    expect(getPostAuthor(post).slug).toBe(PRIMARY_AUTHOR_SLUG);
  });

  it("getPostAuthor honours a registered frontmatter author", () => {
    expect(getPostAuthor({ ...post, author: PRIMARY_AUTHOR_SLUG }).slug).toBe(PRIMARY_AUTHOR_SLUG);
  });

  it("assertAuthorRegistered throws naming the post and the author", () => {
    expect(() => assertAuthorRegistered("ghost", "p")).toThrow(/"p".*"ghost"/);
    expect(() => assertAuthorRegistered(PRIMARY_AUTHOR_SLUG, "p")).not.toThrow();
  });

  it("validatePostAuthor throws naming the post slug for an unknown or non-string author", () => {
    expect(() => validatePostAuthor({ author: "ghost" }, "my-post")).toThrow(/my-post.*ghost/);
    expect(() => validatePostAuthor({ author: 3 }, "my-post")).toThrow(/my-post/);
    expect(() => validatePostAuthor({}, "my-post")).not.toThrow();
  });

  it("authorPath is a literal no-trailing-slash path", () => {
    expect(authorPath("abc")).toBe("/tac-gia/abc");
  });

  it("every author has a kebab-case slug, a name and a non-empty bio", () => {
    for (const a of getAllAuthors()) {
      expect(a.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(a.name.trim()).not.toBe("");
      expect(a.bio.length).toBeGreaterThan(0);
      expect(getAuthor(a.slug)).toBe(a);
    }
  });

  it("no author field is still the TODO(author) placeholder", () => {
    for (const a of getAllAuthors()) {
      for (const [field, value] of Object.entries(a)) {
        const text = JSON.stringify(value);
        expect(text.includes(AUTHOR_PLACEHOLDER), `author "${a.slug}" field "${field}"`).toBe(
          false,
        );
      }
      expect(a.slug.includes("todo"), `author "${a.slug}" field "slug"`).toBe(false);
    }
  });
});
