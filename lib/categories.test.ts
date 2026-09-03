import { describe, it, expect } from "vitest";
import type { Product } from "@/types";
import { getAllProducts } from "@/lib/products";
import sitemap from "@/app/sitemap";
import {
  CATEGORIES,
  DEFERRED_CATEGORIES,
  MIN_PRODUCTS_PER_CATEGORY,
  assertCategoriesStocked,
} from "@/lib/categories";

function makeProduct(overrides: Partial<Product>): Product {
  return {
    slug: "test-product",
    name: "Test Product",
    category: "chuot-gaming",
    brand: "Test",
    price: 100000,
    affiliateUrl: "https://shope.ee/test",
    images: ["/static/images/products/test.jpg"],
    description: "Test description.",
    specs: {},
    publishedAt: "2026-01-01",
    featured: false,
    ...overrides,
  };
}

describe("assertCategoriesStocked (US00132)", () => {
  it("throws naming a category with 0 products", () => {
    const products = [makeProduct({ category: "chuot-gaming" })];
    expect(() =>
      assertCategoriesStocked(products, { "chuot-gaming": {} as never, "empty-cat": {} as never }),
    ).toThrow(/empty-cat/);
  });

  it("throws naming a category with 2 products (below the floor of 3)", () => {
    const products = [
      makeProduct({ slug: "a", category: "under-cat" }),
      makeProduct({ slug: "b", category: "under-cat" }),
    ];
    expect(() => assertCategoriesStocked(products, { "under-cat": {} as never })).toThrow(
      /under-cat/,
    );
  });

  it("does not throw when a category has exactly 3 products", () => {
    const products = [
      makeProduct({ slug: "a", category: "ok-cat" }),
      makeProduct({ slug: "b", category: "ok-cat" }),
      makeProduct({ slug: "c", category: "ok-cat" }),
    ];
    expect(() => assertCategoriesStocked(products, { "ok-cat": {} as never })).not.toThrow();
  });

  it("names every offending category in a single throw", () => {
    const products = [makeProduct({ category: "has-one" })];
    expect(() =>
      assertCategoriesStocked(products, { "has-one": {} as never, "has-zero": {} as never }),
    ).toThrow(/has-one.*has-zero|has-zero.*has-one/s);
  });

  it("the live registry + live catalog passes", () => {
    expect(() => assertCategoriesStocked(getAllProducts(), CATEGORIES)).not.toThrow();
  });
});

describe("CATEGORIES registry (US00132)", () => {
  it("no slug appears in both CATEGORIES and DEFERRED_CATEGORIES", () => {
    const active = Object.keys(CATEGORIES);
    const deferred = Object.keys(DEFERRED_CATEGORIES);
    const overlap = active.filter((slug) => deferred.includes(slug));
    expect(overlap).toEqual([]);
  });

  it("man-hinh-gaming and ghe-gaming are deferred, not active", () => {
    expect(CATEGORIES["man-hinh-gaming"]).toBeUndefined();
    expect(CATEGORIES["ghe-gaming"]).toBeUndefined();
    expect(DEFERRED_CATEGORIES["man-hinh-gaming"]).toBeDefined();
    expect(DEFERRED_CATEGORIES["ghe-gaming"]).toBeDefined();
  });

  it("every registered category has at least MIN_PRODUCTS_PER_CATEGORY products", () => {
    const products = getAllProducts();
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    for (const slug of Object.keys(CATEGORIES)) {
      expect(
        counts.get(slug) ?? 0,
        `"${slug}" has fewer than ${MIN_PRODUCTS_PER_CATEGORY} products`,
      ).toBeGreaterThanOrEqual(MIN_PRODUCTS_PER_CATEGORY);
    }
  });
});

describe("sitemap.xml category entries (US00132)", () => {
  it("every /danh-muc/ entry has at least MIN_PRODUCTS_PER_CATEGORY products", () => {
    const products = getAllProducts();
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    const entries = sitemap().filter((entry) => entry.url.includes("/danh-muc/"));
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      const slug = entry.url.split("/danh-muc/")[1]?.replace(/\/$/, "");
      expect(
        counts.get(slug ?? "") ?? 0,
        `sitemap entry "${entry.url}" has fewer than ${MIN_PRODUCTS_PER_CATEGORY} products`,
      ).toBeGreaterThanOrEqual(MIN_PRODUCTS_PER_CATEGORY);
    }
  });
});
