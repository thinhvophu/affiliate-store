import { describe, expect, it } from "vitest";
import type { Candidate } from "./candidate";
import { validateCandidate } from "./validate";

function baseCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    name: "Chuột Gaming Test",
    brand: "TestBrand",
    price: 199000,
    affiliateUrl: "https://shope.ee/test-product",
    description: "Mô tả sản phẩm test.",
    specs: { DPI: "800-3200" },
    imageUrls: ["/static/images/products/test.jpg"],
    category: "chuot-gaming",
    sourceRef: "test#1",
    ...overrides,
  };
}

describe("validateCandidate", () => {
  it("rejects a candidate with no price", () => {
    const rejection = validateCandidate(baseCandidate({ price: Number.NaN }), "test-slug");
    expect(rejection?.reason).toContain("price");
  });

  it("rejects a candidate with empty specs", () => {
    const rejection = validateCandidate(baseCandidate({ specs: {} }), "test-slug");
    expect(rejection?.reason).toContain("specs");
  });

  it("rejects a candidate with a disallowed affiliateUrl host", () => {
    const rejection = validateCandidate(
      baseCandidate({ affiliateUrl: "https://evil.com/x" }),
      "test-slug",
    );
    expect(rejection?.reason).toContain("evil.com");
  });

  it("rejects a candidate with an unregistered category", () => {
    const rejection = validateCandidate(
      baseCandidate({ category: "khong-ton-tai" }),
      "test-slug",
    );
    expect(rejection?.reason).toContain("khong-ton-tai");
  });

  it("accepts a fully-populated candidate", () => {
    const rejection = validateCandidate(baseCandidate(), "test-slug");
    expect(rejection).toBeNull();
  });
});
