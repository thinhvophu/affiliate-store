import { describe, expect, it } from "vitest";
import { buildCatalogIndex, classify, registerAccepted } from "./dedupe";
import type { Product } from "@/types";

function product(overrides: Partial<Product> = {}): Product {
  return {
    slug: "chuot-gaming-logitech",
    name: "Chuột Gaming Logitech",
    category: "chuot-gaming",
    brand: "Logitech",
    price: 199000,
    affiliateUrl: "https://shope.ee/existing-1",
    images: ["/static/images/products/chuot-gaming-logitech.jpg"],
    description: "Mô tả.",
    specs: { DPI: "800-3200" },
    publishedAt: "2026-05-01",
    featured: false,
    ...overrides,
  };
}

describe("classify", () => {
  it("classifies a matching affiliateUrl as duplicate, keeping the existing slug", () => {
    const index = buildCatalogIndex([product()]);
    const result = classify("https://shope.ee/existing-1", "some-other-slug", index);
    expect(result).toEqual({ kind: "duplicate", slug: "chuot-gaming-logitech" });
  });

  it("classifies a brand-new affiliateUrl and free slug as new", () => {
    const index = buildCatalogIndex([product()]);
    const result = classify("https://shope.ee/brand-new", "ban-phim-co", index);
    expect(result).toEqual({ kind: "new", slug: "ban-phim-co" });
  });

  it("disambiguates a slug collision from a distinct affiliateUrl and flags it", () => {
    const index = buildCatalogIndex([product()]);
    const result = classify(
      "https://shope.ee/different-product",
      "chuot-gaming-logitech",
      index,
    );
    expect(result).toEqual({ kind: "collision", slug: "chuot-gaming-logitech-2" });
  });

  it("duplicate check takes priority over slug collision", () => {
    const index = buildCatalogIndex([product()]);
    const result = classify("https://shope.ee/existing-1", "chuot-gaming-logitech", index);
    expect(result.kind).toBe("duplicate");
  });

  it("treats a second identical candidate within the same run as duplicate", () => {
    const index = buildCatalogIndex([]);
    const first = classify("https://shope.ee/new-1", "ban-phim-co", index);
    expect(first.kind).toBe("new");
    registerAccepted(index, "https://shope.ee/new-1", first.slug);

    const second = classify("https://shope.ee/new-1", "ban-phim-co", index);
    expect(second).toEqual({ kind: "duplicate", slug: "ban-phim-co" });
  });

  it("disambiguates a within-run slug collision from a distinct affiliateUrl", () => {
    const index = buildCatalogIndex([]);
    const first = classify("https://shope.ee/new-1", "ban-phim-co", index);
    registerAccepted(index, "https://shope.ee/new-1", first.slug);

    const second = classify("https://shope.ee/new-2", "ban-phim-co", index);
    expect(second).toEqual({ kind: "collision", slug: "ban-phim-co-2" });
  });
});
