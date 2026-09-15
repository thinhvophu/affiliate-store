import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Post } from "@/types";
import { currentRoundupSlugs, demoteArchivedRoundups, isRoundupPost } from "./roundups";

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

describe("currentRoundupSlugs / demoteArchivedRoundups", () => {
  it("keeps the single roundup in a category current (Scenario 1)", () => {
    writeSidecar("deal-chuot-gaming-2026-08-01");
    const posts = [post({ slug: "deal-chuot-gaming-2026-08-01", publishedAt: "2026-08-01" })];

    expect(currentRoundupSlugs(posts, { dealsDir })).toEqual(
      new Set(["deal-chuot-gaming-2026-08-01"]),
    );
    expect(demoteArchivedRoundups(posts, { dealsDir })).toEqual(posts);
  });

  it("keeps only the newest publishedAt among three roundups in one category (Scenario 3)", () => {
    writeSidecar("deal-chuot-gaming-2026-08-01");
    writeSidecar("deal-chuot-gaming-2026-08-08");
    writeSidecar("deal-chuot-gaming-2026-08-15");
    const posts = [
      post({ slug: "deal-chuot-gaming-2026-08-15", publishedAt: "2026-08-15" }),
      post({ slug: "deal-chuot-gaming-2026-08-08", publishedAt: "2026-08-08" }),
      post({ slug: "deal-chuot-gaming-2026-08-01", publishedAt: "2026-08-01" }),
    ];

    expect(currentRoundupSlugs(posts, { dealsDir })).toEqual(
      new Set(["deal-chuot-gaming-2026-08-15"]),
    );
    const demoted = demoteArchivedRoundups(posts, { dealsDir });
    expect(demoted.map((p) => p.slug)).toEqual(["deal-chuot-gaming-2026-08-15"]);
  });

  it("keeps each category's own current roundup independently", () => {
    writeSidecar("deal-chuot-gaming-2026-08-08");
    writeSidecar("deal-chuot-gaming-2026-08-01");
    writeSidecar("deal-tai-nghe-gaming-2026-08-05");
    const posts = [
      post({
        slug: "deal-chuot-gaming-2026-08-08",
        category: "chuot-gaming",
        publishedAt: "2026-08-08",
      }),
      post({
        slug: "deal-chuot-gaming-2026-08-01",
        category: "chuot-gaming",
        publishedAt: "2026-08-01",
      }),
      post({
        slug: "deal-tai-nghe-gaming-2026-08-05",
        category: "tai-nghe-gaming",
        publishedAt: "2026-08-05",
      }),
    ];

    expect(currentRoundupSlugs(posts, { dealsDir })).toEqual(
      new Set(["deal-chuot-gaming-2026-08-08", "deal-tai-nghe-gaming-2026-08-05"]),
    );
  });

  it("always passes non-roundup posts through, order preserved", () => {
    writeSidecar("deal-chuot-gaming-2026-08-08");
    writeSidecar("deal-chuot-gaming-2026-08-01");
    const posts = [
      post({ slug: "logitech-g102-review", publishedAt: "2026-08-10" }),
      post({
        slug: "deal-chuot-gaming-2026-08-08",
        publishedAt: "2026-08-08",
      }),
      post({ slug: "razer-deathadder-review", publishedAt: "2026-08-06" }),
      post({
        slug: "deal-chuot-gaming-2026-08-01",
        publishedAt: "2026-08-01",
      }),
    ];

    const demoted = demoteArchivedRoundups(posts, { dealsDir });
    expect(demoted.map((p) => p.slug)).toEqual([
      "logitech-g102-review",
      "deal-chuot-gaming-2026-08-08",
      "razer-deathadder-review",
    ]);
  });

  it("returns the list unchanged when there are no roundups at all", () => {
    const posts = [
      post({ slug: "logitech-g102-review", publishedAt: "2026-08-10" }),
      post({ slug: "razer-deathadder-review", publishedAt: "2026-08-06" }),
    ];
    expect(demoteArchivedRoundups(posts, { dealsDir })).toEqual(posts);
  });
});
