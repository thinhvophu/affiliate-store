import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getAllProducts } from "@/lib/products";
import { isAffiliateHost } from "@/lib/affiliate";

const MIN_TOTAL_PRODUCTS = 12;
const MIN_PER_CATEGORY = 3;
const MAX_NAME_LENGTH = 70;
const MAX_SLUG_LENGTH = 60;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const BOILERPLATE_PATTERNS: RegExp[] = [
  /!/,
  /\|/,
  /chính hãng/i,
  /giá rẻ/i,
  /BH\s*\d+\s*tháng/i,
  /freeship/i,
  /CAM KẾT/,
];

const DESCRIPTION_BOILERPLATE_PATTERNS: RegExp[] = [/Mô tả chi tiết/i, /Đặc điểm kỹ thuật/i];

describe("catalog quality guard (US00131)", () => {
  const products = getAllProducts();

  it("has at least 12 products", () => {
    expect(products.length).toBeGreaterThanOrEqual(MIN_TOTAL_PRODUCTS);
  });

  it("has at least 3 products in every category represented in the catalog", () => {
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    const underFloor = [...counts.entries()].filter(([, count]) => count < MIN_PER_CATEGORY);
    expect(underFloor, `categories below the ${MIN_PER_CATEGORY} floor: ${JSON.stringify(underFloor)}`).toEqual([]);
  });

  it("every name is ≤70 chars and free of seller boilerplate", () => {
    for (const p of products) {
      expect(p.name.length, `"${p.slug}": name too long (${p.name.length} chars)`).toBeLessThanOrEqual(
        MAX_NAME_LENGTH,
      );
      for (const pattern of BOILERPLATE_PATTERNS) {
        expect(
          pattern.test(p.name),
          `"${p.slug}": name "${p.name}" matches boilerplate pattern ${pattern}`,
        ).toBe(false);
      }
    }
  });

  it("every slug is ≤60 chars and kebab-case ASCII", () => {
    for (const p of products) {
      expect(p.slug.length, `"${p.slug}": slug too long (${p.slug.length} chars)`).toBeLessThanOrEqual(
        MAX_SLUG_LENGTH,
      );
      expect(SLUG_REGEX.test(p.slug), `"${p.slug}": slug is not kebab-case ASCII`).toBe(true);
    }
  });

  it("no description carries Shopee listing boilerplate", () => {
    for (const p of products) {
      for (const pattern of DESCRIPTION_BOILERPLATE_PATTERNS) {
        expect(
          pattern.test(p.description),
          `"${p.slug}": description matches boilerplate pattern ${pattern}`,
        ).toBe(false);
      }
    }
  });

  it("every image path is root-relative and exists under public/", () => {
    for (const p of products) {
      for (const imagePath of p.images) {
        expect(
          imagePath.startsWith("http"),
          `"${p.slug}": image path "${imagePath}" must be root-relative, not remote`,
        ).toBe(false);
        expect(imagePath.startsWith("/"), `"${p.slug}": image path "${imagePath}" must start with "/"`).toBe(
          true,
        );
        const onDisk = path.join(process.cwd(), "public", imagePath);
        expect(fs.existsSync(onDisk), `"${p.slug}": image file missing on disk: ${onDisk}`).toBe(true);
      }
    }
  });

  it("every affiliateUrl host is in the Shopee allow-list", () => {
    for (const p of products) {
      const host = new URL(p.affiliateUrl).hostname.toLowerCase();
      expect(isAffiliateHost(host), `"${p.slug}": affiliateUrl host "${host}" is not allow-listed`).toBe(true);
    }
  });
});
