import { describe, it, expect } from "vitest";
import {
  buildCategoryBreadcrumbs,
  buildProductBreadcrumbs,
  buildPostBreadcrumbs,
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
