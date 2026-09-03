import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renameProduct } from "./rename-product";

let root: string;
let productsDir: string;
let imagesDir: string;
let postsDir: string;

function writeFixture(slug: string, imageCount = 1): void {
  const images = Array.from(
    { length: imageCount },
    (_, i) => `/static/images/products/${slug}-${i + 1}.jpg`,
  );
  fs.writeFileSync(
    path.join(productsDir, `${slug}.json`),
    JSON.stringify(
      {
        slug,
        name: "Chuột Gaming Test",
        category: "chuot-gaming",
        brand: "TestBrand",
        price: 199000,
        affiliateUrl: "https://shope.ee/test",
        images,
        description: "Mô tả sản phẩm test.",
        specs: { DPI: "800-3200" },
        publishedAt: "2026-05-01",
        featured: false,
      },
      null,
      2,
    ),
  );
  for (let i = 0; i < imageCount; i++) {
    fs.writeFileSync(path.join(imagesDir, `${slug}-${i + 1}.jpg`), `fake-bytes-${i}`);
  }
}

function readFixture(slug: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(productsDir, `${slug}.json`), "utf-8"));
}

function writePost(name: string, content: string): void {
  fs.writeFileSync(path.join(postsDir, name), content);
}

function readPost(name: string): string {
  return fs.readFileSync(path.join(postsDir, name), "utf-8");
}

/** No-op mover for tests — swaps `fs.renameSync` in for `git mv` so tests don't need a git repo. */
const fsMover = (from: string, to: string): void => fs.renameSync(from, to);

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "rename-product-"));
  productsDir = path.join(root, "products");
  imagesDir = path.join(root, "images");
  postsDir = path.join(root, "posts");
  fs.mkdirSync(productsDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.mkdirSync(postsDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("renameProduct", () => {
  it("renames all five touch-points on the happy path", () => {
    writeFixture("old-slug-long", 2);
    writePost(
      "guide.mdx",
      [
        "---",
        'coverImage: "/static/images/products/old-slug-long-1.jpg"',
        "---",
        "",
        '<ProductCard slug="old-slug-long" />',
        "",
      ].join("\n"),
    );

    renameProduct({
      from: "old-slug-long",
      to: "new-slug",
      productsDir,
      imagesDir,
      postsDir,
      mv: fsMover,
    });

    expect(fs.existsSync(path.join(productsDir, "old-slug-long.json"))).toBe(false);
    expect(fs.existsSync(path.join(productsDir, "new-slug.json"))).toBe(true);

    const fixture = readFixture("new-slug");
    expect(fixture.slug).toBe("new-slug");
    expect(fixture.images).toEqual([
      "/static/images/products/new-slug-1.jpg",
      "/static/images/products/new-slug-2.jpg",
    ]);

    expect(fs.existsSync(path.join(imagesDir, "old-slug-long-1.jpg"))).toBe(false);
    expect(fs.existsSync(path.join(imagesDir, "old-slug-long-2.jpg"))).toBe(false);
    expect(fs.existsSync(path.join(imagesDir, "new-slug-1.jpg"))).toBe(true);
    expect(fs.existsSync(path.join(imagesDir, "new-slug-2.jpg"))).toBe(true);

    const post = readPost("guide.mdx");
    expect(post).toContain('coverImage: "/static/images/products/new-slug-1.jpg"');
    expect(post).toContain('<ProductCard slug="new-slug" />');
    expect(post).not.toContain("old-slug-long");
  });

  it("rewrites coverImage and ProductCard slug across multiple posts", () => {
    writeFixture("dual-ref-slug", 1);
    writePost(
      "post-a.mdx",
      [
        "---",
        'coverImage: "/static/images/products/dual-ref-slug-1.jpg"',
        "---",
        "",
        '<ProductCard slug="dual-ref-slug" />',
      ].join("\n"),
    );
    writePost(
      "post-b.mdx",
      ["---", 'coverImage: "/static/images/products/other-slug-1.jpg"', "---", ""].join("\n"),
    );

    renameProduct({
      from: "dual-ref-slug",
      to: "renamed-slug",
      productsDir,
      imagesDir,
      postsDir,
      mv: fsMover,
    });

    expect(readPost("post-a.mdx")).toContain("renamed-slug");
    expect(readPost("post-a.mdx")).not.toContain("dual-ref-slug");
    // Unrelated post referencing a different slug is untouched.
    expect(readPost("post-b.mdx")).toContain("other-slug");
  });

  it("throws and writes nothing when --from does not exist", () => {
    expect(() =>
      renameProduct({
        from: "missing-slug",
        to: "new-slug",
        productsDir,
        imagesDir,
        postsDir,
        mv: fsMover,
      }),
    ).toThrow(/does not exist|not found/i);
  });

  it("throws and writes nothing when --to is already taken", () => {
    writeFixture("slug-a");
    writeFixture("slug-b");

    expect(() =>
      renameProduct({
        from: "slug-a",
        to: "slug-b",
        productsDir,
        imagesDir,
        postsDir,
        mv: fsMover,
      }),
    ).toThrow(/already exists|taken/i);

    // No partial work: slug-a's fixture must still be intact.
    expect(fs.existsSync(path.join(productsDir, "slug-a.json"))).toBe(true);
  });

  it("throws when --to exceeds 60 chars", () => {
    writeFixture("short-slug");
    const longTo = "a".repeat(61);

    expect(() =>
      renameProduct({
        from: "short-slug",
        to: longTo,
        productsDir,
        imagesDir,
        postsDir,
        mv: fsMover,
      }),
    ).toThrow(/60/);

    expect(fs.existsSync(path.join(productsDir, "short-slug.json"))).toBe(true);
  });

  it("throws when --to is not kebab-case ASCII", () => {
    writeFixture("short-slug");

    expect(() =>
      renameProduct({
        from: "short-slug",
        to: "Not_Valid_Slug",
        productsDir,
        imagesDir,
        postsDir,
        mv: fsMover,
      }),
    ).toThrow(/kebab-case|invalid/i);
  });

  it("leaves no reference to the old slug anywhere after a rename", () => {
    writeFixture("stale-slug", 1);
    writePost(
      "combo.mdx",
      [
        "---",
        'coverImage: "/static/images/products/stale-slug-1.jpg"',
        "---",
        "",
        '<ProductCard slug="stale-slug" />',
      ].join("\n"),
    );

    renameProduct({
      from: "stale-slug",
      to: "fresh-slug",
      productsDir,
      imagesDir,
      postsDir,
      mv: fsMover,
    });

    const allFiles = [
      ...fs.readdirSync(productsDir).map((f) => path.join(productsDir, f)),
      ...fs.readdirSync(postsDir).map((f) => path.join(postsDir, f)),
    ];
    for (const file of allFiles) {
      expect(fs.readFileSync(file, "utf-8")).not.toContain("stale-slug");
    }
    expect(fs.readdirSync(imagesDir).some((f) => f.includes("stale-slug"))).toBe(false);
  });
});
