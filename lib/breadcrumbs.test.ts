import { describe, it, expect } from "vitest";
import {
  buildCategoryBreadcrumbs,
  buildProductBreadcrumbs,
  buildPostBreadcrumbs,
  breadcrumbListJsonLd,
} from "@/lib/breadcrumbs";
import type { Product } from "@/types";
import type { Post } from "@/types";

const fixtureProduct: Product = {
  slug: "logitech-g102",
  name: "Chuột Gaming Logitech G102",
  category: "chuot-gaming",
  brand: "Logitech",
  price: 390000,
  affiliateUrl: "https://shope.ee/abc",
  images: ["/static/images/products/logitech-g102.jpg"],
  description: "Chuột gaming",
  specs: {},
  publishedAt: "2026-05-01",
  featured: true,
};

const fixturePost: Post = {
  slug: "top-5-chuot-gaming",
  title: "Top 5 Chuột Gaming Dưới 500k",
  summary: "...",
  publishedAt: "2026-05-02",
  category: "chuot-gaming",
  tags: ["chuot gaming"],
  coverImage: "/static/images/blog/test.jpg",
  content: "# Nội dung bài viết",
};

describe("buildCategoryBreadcrumbs", () => {
  it("returns [Trang chủ, Sản phẩm, <category>] for a registered slug", () => {
    const crumbs = buildCategoryBreadcrumbs("chuot-gaming");
    expect(crumbs).toHaveLength(3);
    expect(crumbs[0]).toEqual({ label: "Trang chủ", href: "/" });
    expect(crumbs[1]).toEqual({ label: "Sản phẩm", href: "/san-pham/" });
    expect(crumbs[2]).toEqual({ label: "Chuột gaming", href: "/danh-muc/chuot-gaming/" });
  });

  it("returns 2-item fallback for unknown slug", () => {
    const crumbs = buildCategoryBreadcrumbs("unknown-slug");
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe("Trang chủ");
    expect(crumbs[1].label).toBe("Sản phẩm");
  });
});

describe("buildProductBreadcrumbs", () => {
  it("returns 4-item trail with correct hrefs", () => {
    const crumbs = buildProductBreadcrumbs(fixtureProduct);
    expect(crumbs).toHaveLength(4);
    expect(crumbs[0]).toEqual({ label: "Trang chủ", href: "/" });
    expect(crumbs[1]).toEqual({ label: "Sản phẩm", href: "/san-pham/" });
    expect(crumbs[2]).toEqual({ label: "Chuột gaming", href: "/danh-muc/chuot-gaming/" });
    expect(crumbs[3]).toEqual({
      label: fixtureProduct.name,
      href: `/san-pham/${fixtureProduct.slug}/`,
    });
  });

  it("category label comes from getCategoryMeta, not the slug itself", () => {
    const crumbs = buildProductBreadcrumbs(fixtureProduct);
    expect(crumbs[2].label).toBe("Chuột gaming");
    expect(crumbs[2].label).not.toBe("chuot-gaming");
  });
});

describe("buildPostBreadcrumbs", () => {
  it("returns 4-item trail with correct hrefs", () => {
    const crumbs = buildPostBreadcrumbs(fixturePost);
    expect(crumbs).toHaveLength(4);
    expect(crumbs[0]).toEqual({ label: "Trang chủ", href: "/" });
    expect(crumbs[1]).toEqual({ label: "Bài viết", href: "/bai-viet/" });
    expect(crumbs[2]).toEqual({ label: "Chuột gaming", href: "/danh-muc/chuot-gaming/" });
    expect(crumbs[3]).toEqual({
      label: fixturePost.title,
      href: `/bai-viet/${fixturePost.slug}/`,
    });
  });
});

interface ListItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

describe("breadcrumbListJsonLd", () => {
  it("maps a three-item trail to three ListItems with 1-indexed positions", () => {
    const crumbs = buildCategoryBreadcrumbs("chuot-gaming");
    const schema = breadcrumbListJsonLd(crumbs);
    const itemListElement = schema.itemListElement as ListItem[];

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(itemListElement).toHaveLength(3);
    itemListElement.forEach((entry, i) => {
      expect(entry["@type"]).toBe("ListItem");
      expect(entry.position).toBe(i + 1);
    });
  });

  it("passes name through verbatim, including diacritics", () => {
    const crumbs = buildProductBreadcrumbs(fixtureProduct);
    const itemListElement = breadcrumbListJsonLd(crumbs).itemListElement as ListItem[];

    expect(itemListElement.map((e) => e.name)).toEqual(crumbs.map((c) => c.label));
    expect(itemListElement[2].name).toBe("Chuột gaming");
  });

  it("builds absolute item URLs from NEXT_PUBLIC_SITE_URL, preserving the path", () => {
    const crumbs = buildProductBreadcrumbs(fixtureProduct);
    const itemListElement = breadcrumbListJsonLd(crumbs).itemListElement as ListItem[];

    itemListElement.forEach((entry, i) => {
      expect(entry.item).toBe(`https://example.com${crumbs[i].href}`);
    });
    expect(itemListElement[3].item).toBe(
      `https://example.com/san-pham/${fixtureProduct.slug}/`,
    );
  });

  it("returns an empty itemListElement for an empty items array", () => {
    const schema = breadcrumbListJsonLd([]);
    expect(schema.itemListElement).toEqual([]);
  });

  it("preserves order exactly (no re-sorting)", () => {
    const crumbs = buildPostBreadcrumbs(fixturePost);
    const itemListElement = breadcrumbListJsonLd(crumbs).itemListElement as ListItem[];

    expect(itemListElement.map((e) => e.name)).toEqual([
      "Trang chủ",
      "Bài viết",
      "Chuột gaming",
      fixturePost.title,
    ]);
  });
});
