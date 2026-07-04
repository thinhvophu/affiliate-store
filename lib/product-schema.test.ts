import { describe, it, expect } from "vitest";
import { buildProductSchema, PRODUCT_AVAILABILITY_IN_STOCK } from "./product-schema";
import type { Product } from "@/types";

const fixtureProduct: Product = {
  slug: "foo",
  name: "Chuột Gaming Foo",
  category: "chuot-gaming",
  brand: "Logitech",
  price: 390000,
  affiliateUrl: "https://shope.ee/abc",
  images: ["/static/images/products/foo.jpg"],
  description: "Chuột gaming siêu nhẹ",
  specs: {},
  publishedAt: "2026-05-01",
  featured: true,
};

describe("buildProductSchema", () => {
  it("builds a complete Product schema", () => {
    const schema = buildProductSchema(fixtureProduct);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Product");
    expect(schema.name).toBe(fixtureProduct.name);
    expect(schema.description).toBe(fixtureProduct.description);
    expect(schema.brand).toEqual({ "@type": "Brand", name: "Logitech" });
    expect(schema.image).toBe("https://example.com/static/images/products/foo.jpg");
    expect(schema.url).toBe("https://example.com/san-pham/foo/");

    const offers = schema.offers as Record<string, unknown>;
    expect(offers.price).toBe(390000);
    expect(offers.priceCurrency).toBe("VND");
    expect(offers.availability).toBe(PRODUCT_AVAILABILITY_IN_STOCK);
    expect(offers.url).toBe(schema.url);
  });

  it("offers.price is the raw number, never formatted", () => {
    const schema = buildProductSchema(fixtureProduct);
    const offers = schema.offers as Record<string, unknown>;
    expect(typeof offers.price).toBe("number");
    expect(offers.price).toBe(390000);
  });

  it("multi-image product still emits a single scalar image (the first)", () => {
    const multiImageProduct: Product = {
      ...fixtureProduct,
      images: [
        "/static/images/products/a.jpg",
        "/static/images/products/b.jpg",
        "/static/images/products/c.jpg",
      ],
    };
    const schema = buildProductSchema(multiImageProduct);
    expect(schema.image).toBe("https://example.com/static/images/products/a.jpg");
  });

  it("brand uses the nested { @type: Brand } form, not a bare string", () => {
    const schema = buildProductSchema(fixtureProduct);
    expect(typeof schema.brand).toBe("object");
    expect(schema.brand).not.toBe(fixtureProduct.brand);
  });

  it("round-trips Vietnamese diacritics and quotes in the description", () => {
    const product: Product = {
      ...fixtureProduct,
      description: 'Chuột "siêu nhẹ" với độ trễ thấp',
    };
    const schema = buildProductSchema(product);
    expect(schema.description).toBe('Chuột "siêu nhẹ" với độ trễ thấp');
  });
});
