import { describe, expect, it } from "vitest";
import type { Product } from "@/types";
import { selectProductsForCategory } from "./select-products";

function product(overrides: Partial<Product> = {}): Product {
  return {
    slug: "p",
    name: "Product",
    category: "chuot-gaming",
    brand: "Brand",
    price: 100000,
    affiliateUrl: "https://shope.ee/x",
    images: ["/static/images/products/p-1.jpg"],
    description: "desc",
    specs: {},
    publishedAt: "2026-01-01",
    featured: false,
    ...overrides,
  };
}

describe("selectProductsForCategory", () => {
  it("only returns products in the given category", () => {
    const products = [
      product({ slug: "a", category: "chuot-gaming" }),
      product({ slug: "b", category: "ban-phim-gaming" }),
    ];
    const picked = selectProductsForCategory(products, "chuot-gaming");
    expect(picked.map((p) => p.slug)).toEqual(["a"]);
  });

  it("prefers featured products over non-featured", () => {
    const products = [
      product({ slug: "a", featured: false, publishedAt: "2026-03-01" }),
      product({ slug: "b", featured: true, publishedAt: "2026-01-01" }),
    ];
    const picked = selectProductsForCategory(products, "chuot-gaming");
    expect(picked.map((p) => p.slug)).toEqual(["b", "a"]);
  });

  it("breaks ties by publishedAt desc, then slug asc", () => {
    const products = [
      product({ slug: "z", publishedAt: "2026-01-01" }),
      product({ slug: "a", publishedAt: "2026-02-01" }),
      product({ slug: "b", publishedAt: "2026-02-01" }),
    ];
    const picked = selectProductsForCategory(products, "chuot-gaming", 3);
    expect(picked.map((p) => p.slug)).toEqual(["a", "b", "z"]);
  });

  it("caps at max (default 2)", () => {
    const products = [
      product({ slug: "a", publishedAt: "2026-03-01" }),
      product({ slug: "b", publishedAt: "2026-02-01" }),
      product({ slug: "c", publishedAt: "2026-01-01" }),
    ];
    const picked = selectProductsForCategory(products, "chuot-gaming");
    expect(picked.map((p) => p.slug)).toEqual(["a", "b"]);
  });

  it("returns an empty array when the category has no products", () => {
    const picked = selectProductsForCategory(
      [product({ category: "ban-phim-gaming" })],
      "chuot-gaming",
    );
    expect(picked).toEqual([]);
  });
});
