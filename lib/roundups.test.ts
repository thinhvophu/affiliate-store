import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Post } from "@/types";
import { getAllPosts } from "@/lib/posts";
import {
  assertOneRoundupPerCategory,
  getCategoryGuides,
  getRoundupForCategory,
  isRoundupPost,
  prioritizeGuides,
  roundupSlugFor,
} from "./roundups";

let root: string;
let dealsDir: string;

function post(overrides: Partial<Post> = {}): Post {
  return {
    slug: "some-post",
    title: "Some post",
    summary: "A summary that is at least fifty characters long for the test fixture.",
    publishedAt: "2026-08-01",
    category: "chuot-gaming",
    tags: ["deal"],
    coverImage: "/static/images/deals/some-post-1.jpg",
    content: "content",
    ...overrides,
  };
}

function writeSidecar(postSlug: string): void {
  fs.writeFileSync(
    path.join(dealsDir, `${postSlug}.json`),
    JSON.stringify([
      {
        id: `${postSlug}-1`,
        name: "Deal",
        priceVnd: 100000,
        originalPriceVnd: 200000,
        discountPercent: 50,
        rating: 4.5,
        soldCount: 100,
        image: `/static/images/deals/${postSlug}-1.jpg`,
        affiliateUrl: "https://s.shopee.vn/deal-aff",
        category: "chuot-gaming",
      },
    ]),
  );
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "roundups-"));
  dealsDir = path.join(root, "content", "deals");
  fs.mkdirSync(dealsDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("isRoundupPost", () => {
  it("is true for a post with a sidecar", () => {
    writeSidecar("deal-chuot-gaming-2026-08-01");
    expect(isRoundupPost(post({ slug: "deal-chuot-gaming-2026-08-01" }), { dealsDir })).toBe(true);
  });

  it("is false for an ordinary buying guide with no sidecar", () => {
    expect(isRoundupPost(post({ slug: "logitech-g102-review" }), { dealsDir })).toBe(false);
  });
});

describe("roundupSlugFor", () => {
  it("derives the evergreen slug from the category", () => {
    expect(roundupSlugFor("chuot-gaming")).toBe("deal-chuot-gaming");
  });
});

describe("getRoundupForCategory", () => {
  it("returns the category's roundup and ignores ordinary posts", () => {
    writeSidecar("deal-chuot-gaming");
    const posts = [post({ slug: "logitech-g102-review" }), post({ slug: "deal-chuot-gaming" })];
    expect(getRoundupForCategory(posts, "chuot-gaming", { dealsDir })?.slug).toBe(
      "deal-chuot-gaming",
    );
    expect(getRoundupForCategory(posts, "tai-nghe-gaming", { dealsDir })).toBeNull();
  });
});

describe("getCategoryGuides", () => {
  it("leaves out roundups and sorts newest first", () => {
    writeSidecar("deal-chuot-gaming");
    const posts = [
      post({ slug: "old", publishedAt: "2026-01-01" }),
      post({ slug: "deal-chuot-gaming" }),
      post({ slug: "new", publishedAt: "2026-05-01" }),
      post({ slug: "other-cat", category: "tai-nghe-gaming" }),
    ];
    expect(getCategoryGuides(posts, "chuot-gaming", { dealsDir }).map((p) => p.slug)).toEqual([
      "new",
      "old",
    ]);
  });

  it("returns [] for a category with no guides", () => {
    expect(getCategoryGuides([post()], "tai-nghe-gaming", { dealsDir })).toEqual([]);
  });
});

describe("prioritizeGuides", () => {
  it("puts guides before roundups and keeps order within each group", () => {
    writeSidecar("deal-a");
    writeSidecar("deal-b");
    const posts = [
      post({ slug: "deal-a" }),
      post({ slug: "g1" }),
      post({ slug: "deal-b" }),
      post({ slug: "g2" }),
    ];
    expect(prioritizeGuides(posts, { dealsDir }).map((p) => p.slug)).toEqual([
      "g1",
      "g2",
      "deal-a",
      "deal-b",
    ]);
  });
});

describe("assertOneRoundupPerCategory", () => {
  it("passes with one correctly-slugged roundup per category", () => {
    writeSidecar("deal-chuot-gaming");
    writeSidecar("deal-tai-nghe-gaming");
    const posts = [
      post({ slug: "deal-chuot-gaming" }),
      post({ slug: "deal-tai-nghe-gaming", category: "tai-nghe-gaming" }),
      post({ slug: "logitech-g102-review" }),
    ];
    expect(() => assertOneRoundupPerCategory(posts, { dealsDir })).not.toThrow();
  });

  it("throws on a roundup whose slug is not roundupSlugFor(category)", () => {
    writeSidecar("deal-chuot-gaming-2026-08-01");
    const posts = [post({ slug: "deal-chuot-gaming-2026-08-01" })];
    expect(() => assertOneRoundupPerCategory(posts, { dealsDir })).toThrow(
      /deal-chuot-gaming-2026-08-01/,
    );
  });

  it("throws on two roundups in one category", () => {
    writeSidecar("deal-chuot-gaming");
    writeSidecar("deal-chuot-gaming-2026-08-01");
    const posts = [
      post({ slug: "deal-chuot-gaming" }),
      post({ slug: "deal-chuot-gaming-2026-08-01" }),
    ];
    expect(() => assertOneRoundupPerCategory(posts, { dealsDir })).toThrow();
  });
});

describe("live content (US00163)", () => {
  it("has exactly one evergreen roundup per category", () => {
    expect(() => assertOneRoundupPerCategory(getAllPosts())).not.toThrow();
  });

  it("every roundup was updated after it was first published", () => {
    for (const p of getAllPosts()) {
      if (!isRoundupPost(p)) continue;
      expect(p.updatedAt, `${p.slug} has no updatedAt`).toBeDefined();
      expect(p.publishedAt < p.updatedAt!, `${p.slug} publishedAt must precede updatedAt`).toBe(
        true,
      );
    }
  });
});
