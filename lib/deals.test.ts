import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAllDeals, getDealById, getDealsForPost, postHasDeals } from "./deals";
import { getAllPosts } from "./posts";
import { findBoilerplateViolations } from "./seller-boilerplate";
import type { Deal } from "@/types";

let root: string;
let dealsDir: string;

interface DealFixtureOverrides {
  id?: string;
  name?: string;
  priceVnd?: number;
  originalPriceVnd?: number;
  discountPercent?: number;
  rating?: number;
  soldCount?: number;
  image?: string;
  affiliateUrl?: string;
  category?: string;
  itemId?: unknown;
  shopId?: unknown;
}

function dealFixture(overrides: DealFixtureOverrides = {}) {
  return {
    id: "deal-chuot-gaming-2026-09-07-1",
    name: "Chuột Gaming Logitech G102 Lightsync",
    priceVnd: 349000,
    originalPriceVnd: 499000,
    discountPercent: 30,
    rating: 4.7,
    soldCount: 1500,
    image: "/static/images/deals/deal-chuot-gaming-2026-09-07-1.jpg",
    affiliateUrl: "https://s.shopee.vn/deal-aff-1",
    category: "chuot-gaming",
    ...overrides,
  };
}

function writeSidecar(fileBasename: string, deals: unknown[]): void {
  fs.writeFileSync(path.join(dealsDir, `${fileBasename}.json`), JSON.stringify(deals, null, 2));
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "deals-"));
  dealsDir = path.join(root, "content", "deals");
  fs.mkdirSync(dealsDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("getAllDeals", () => {
  it("loads every deal across every sidecar file", () => {
    const postSlug = "deal-chuot-gaming-2026-09-07";
    writeSidecar(postSlug, [
      dealFixture({ id: `${postSlug}-1` }),
      dealFixture({ id: `${postSlug}-2`, name: "Chuột Gaming Razer DeathAdder" }),
    ]);

    const deals = getAllDeals({ dealsDir });
    expect(deals).toHaveLength(2);
    expect(deals.map((d) => d.id)).toEqual([`${postSlug}-1`, `${postSlug}-2`]);
  });

  it("returns [] when the deals directory does not exist", () => {
    const missingDir = path.join(root, "content", "does-not-exist");
    expect(getAllDeals({ dealsDir: missingDir })).toEqual([]);
  });

  it("throws naming the deal id when affiliateUrl host is not allow-listed", () => {
    const postSlug = "deal-tai-nghe-2026-09-07";
    writeSidecar(postSlug, [
      dealFixture({ id: `${postSlug}-1`, affiliateUrl: "https://evil.example.com/x" }),
    ]);

    expect(() => getAllDeals({ dealsDir })).toThrow(
      new RegExp(`${postSlug}-1.*not an allowed Shopee host`, "s"),
    );
  });

  it("throws naming the deal id when itemId is not a number (US00165)", () => {
    const postSlug = "deal-tai-nghe-2026-09-07";
    writeSidecar(postSlug, [dealFixture({ id: `${postSlug}-1`, itemId: "41773751059" })]);

    expect(() => getAllDeals({ dealsDir })).toThrow(new RegExp(`${postSlug}-1.*itemId`, "s"));
  });

  it("accepts a sidecar with numeric itemId/shopId and one without (US00165)", () => {
    const postSlug = "deal-tai-nghe-2026-09-07";
    writeSidecar(postSlug, [
      dealFixture({ id: `${postSlug}-1`, itemId: 1, shopId: 2 }),
      dealFixture({ id: `${postSlug}-2` }),
    ]);

    expect(getAllDeals({ dealsDir })).toHaveLength(2);
  });

  it("throws when a deal's image is a remote URL instead of a root-relative path", () => {
    const postSlug = "deal-tai-nghe-2026-09-07";
    writeSidecar(postSlug, [
      dealFixture({
        id: `${postSlug}-1`,
        image: "https://down-vn.img.susercontent.com/file/deal-1",
      }),
    ]);

    expect(() => getAllDeals({ dealsDir })).toThrow(/must be a root-relative/);
  });

  it("throws naming both files on a duplicate id across two sidecars", () => {
    // An operator's copy-paste error: file B's entry still carries file A's id.
    // Duplicate detection fires before the (also true) basename mismatch would.
    writeSidecar("deal-a", [dealFixture({ id: "deal-a-1" })]);
    fs.writeFileSync(
      path.join(dealsDir, "deal-b.json"),
      JSON.stringify([{ ...dealFixture(), id: "deal-a-1" }]),
    );

    expect(() => getAllDeals({ dealsDir })).toThrow(/Duplicate deal id/);
  });

  it("throws when a deal's id does not match its own file's basename", () => {
    writeSidecar("deal-chuot-gaming-2026-09-07", [
      dealFixture({ id: "deal-chuot-gaming-2026-09-14-1" }),
    ]);

    expect(() => getAllDeals({ dealsDir })).toThrow(
      /must match "deal-chuot-gaming-2026-09-07-<n>"/,
    );
  });

  it("throws naming the deal id when category is not registered", () => {
    const postSlug = "deal-tai-nghe-2026-09-07";
    writeSidecar(postSlug, [dealFixture({ id: `${postSlug}-1`, category: "unregistered-cat" })]);

    expect(() => getAllDeals({ dealsDir })).toThrow(new RegExp(`${postSlug}-1`));
  });

  it("memoises per directory — a second call does not re-read the directory", () => {
    const postSlug = "deal-chuot-gaming-2026-09-07";
    writeSidecar(postSlug, [dealFixture({ id: `${postSlug}-1` })]);

    const spy = vi.spyOn(fs, "readdirSync");
    getAllDeals({ dealsDir });
    const callsAfterFirst = spy.mock.calls.length;
    getAllDeals({ dealsDir });
    expect(spy.mock.calls.length).toBe(callsAfterFirst);
  });
});

describe("getDealById", () => {
  it("returns the matching deal", () => {
    const postSlug = "deal-chuot-gaming-2026-09-07";
    writeSidecar(postSlug, [dealFixture({ id: `${postSlug}-1` })]);

    const deal = getDealById(`${postSlug}-1`, { dealsDir });
    expect(deal?.name).toBe("Chuột Gaming Logitech G102 Lightsync");
  });

  it("returns null on a miss", () => {
    expect(getDealById("no-such-id", { dealsDir })).toBeNull();
  });
});

describe("getDealsForPost", () => {
  it("returns only this post's deals, in id order", () => {
    const postA = "deal-chuot-gaming-2026-09-07";
    const postB = "deal-tai-nghe-2026-09-07";
    writeSidecar(postA, [
      dealFixture({ id: `${postA}-2` }),
      dealFixture({ id: `${postA}-1` }),
      dealFixture({ id: `${postA}-10` }),
    ]);
    writeSidecar(postB, [dealFixture({ id: `${postB}-1`, category: "tai-nghe-gaming" })]);

    const deals = getDealsForPost(postA, { dealsDir });
    expect(deals.map((d) => d.id)).toEqual([`${postA}-1`, `${postA}-2`, `${postA}-10`]);
  });
});

describe("postHasDeals", () => {
  it("is true when a sidecar exists for the post", () => {
    const postSlug = "deal-chuot-gaming-2026-09-07";
    writeSidecar(postSlug, [dealFixture({ id: `${postSlug}-1` })]);
    expect(postHasDeals(postSlug, { dealsDir })).toBe(true);
  });

  it("is false for an ordinary buying-guide post with no sidecar", () => {
    expect(postHasDeals("logitech-g102-lightsync-review", { dealsDir })).toBe(false);
  });
});

function describeNameViolations(deals: Pick<Deal, "id" | "name">[]): string[] {
  return deals.flatMap((d) =>
    findBoilerplateViolations(d.name).map(
      (rule) => `"${d.id}": name "${d.name}" breaks rule "${rule.id}" (${rule.label})`,
    ),
  );
}

function describeHeadingMismatches(
  slug: string,
  content: string,
  deals: Pick<Deal, "id" | "name">[],
): string[] {
  const nameById = new Map(deals.map((d) => [d.id, d.name]));
  const problems: string[] = [];
  const embed = /<DealCard\s+id="([^"]+)"\s*\/>/g;
  for (const match of content.matchAll(embed)) {
    const id = match[1];
    const name = nameById.get(id);
    if (name === undefined) continue;
    const before = content.slice(0, match.index);
    const heading = [...before.matchAll(/^### \d+\. (.+)$/gm)].pop()?.[1];
    if (heading !== name) {
      problems.push(
        `post "${slug}", deal "${id}": heading ${JSON.stringify(heading)} does not match sidecar name ${JSON.stringify(name)}`,
      );
    }
  }
  return problems;
}

describe("deal display-name guard (US00164)", () => {
  it("names the deal id and broken rule on a fixture with a pipe", () => {
    const messages = describeNameViolations([{ id: "deal-x-1", name: "Chuột Razer | Quang Học" }]);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('"deal-x-1"');
    expect(messages[0]).toContain('rule "pipe"');
  });

  it("flags a heading that was edited without the sidecar name", () => {
    const content = '### 1. Chuột Razer Cobra\n\n<DealCard id="deal-x-1" />\n';
    expect(
      describeHeadingMismatches("deal-x", content, [{ id: "deal-x-1", name: "Chuột Razer" }]),
    ).toHaveLength(1);
    expect(
      describeHeadingMismatches("deal-x", content, [{ id: "deal-x-1", name: "Chuột Razer Cobra" }]),
    ).toEqual([]);
  });

  it("every live deal name is free of seller boilerplate", () => {
    expect(describeNameViolations(getAllDeals())).toEqual([]);
  });

  it("every live roundup heading matches its sidecar deal name", () => {
    const problems = getAllPosts().flatMap((post) =>
      describeHeadingMismatches(post.slug, post.content, getDealsForPost(post.slug)),
    );
    expect(problems).toEqual([]);
  });
});
