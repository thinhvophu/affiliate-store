import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { syncContentQueue } from "./sync-content-queue";

let root: string;
let productsDir: string;
let postsDir: string;
let queueFile: string;

function writeProduct(slug: string, category = "chuot-gaming"): void {
  fs.writeFileSync(
    path.join(productsDir, `${slug}.json`),
    JSON.stringify(
      {
        slug,
        name: "Chuột Gaming Test",
        category,
        brand: "TestBrand",
        price: 199000,
        affiliateUrl: "https://shope.ee/test",
        images: [`/static/images/products/${slug}-1.jpg`],
        description: "Mô tả sản phẩm test.",
        specs: { DPI: "800-3200" },
        publishedAt: "2026-05-01",
        featured: false,
      },
      null,
      2,
    ),
  );
}

function writePost(name: string, slugs: string[]): void {
  const embeds = slugs.map((s) => `<ProductCard slug="${s}" />`).join("\n\n");
  fs.writeFileSync(path.join(postsDir, name), `---\ntitle: "Test"\n---\n\n${embeds}\n`);
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "sync-content-queue-"));
  productsDir = path.join(root, "products");
  postsDir = path.join(root, "posts");
  queueFile = path.join(root, "data", "content-queue.md");
  fs.mkdirSync(productsDir, { recursive: true });
  fs.mkdirSync(postsDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("syncContentQueue", () => {
  it("adds every product with no post embed as pending, on first run", () => {
    writeProduct("logitech-g305-lightspeed-wireless");
    writeProduct("razer-deathadder-essential");

    const result = syncContentQueue({ productsDir, postsDir, queueFile });

    expect(result.added.sort()).toEqual(
      ["logitech-g305-lightspeed-wireless", "razer-deathadder-essential"].sort(),
    );
    expect(result.rows.every((r) => r.status === "pending")).toBe(true);
    expect(fs.existsSync(queueFile)).toBe(true);
  });

  it("auto-publishes a row once a ProductCard embed for it appears in a post", () => {
    writeProduct("logitech-g305-lightspeed-wireless");
    syncContentQueue({ productsDir, postsDir, queueFile });

    writePost("review.mdx", ["logitech-g305-lightspeed-wireless"]);
    const result = syncContentQueue({ productsDir, postsDir, queueFile });

    expect(result.autoPublished).toEqual(["logitech-g305-lightspeed-wireless"]);
    expect(result.rows[0].status).toBe("published");
  });

  it("preserves a hand-edited status (e.g. drafted) across re-syncs when still unpublished", () => {
    writeProduct("razer-deathadder-essential");
    syncContentQueue({ productsDir, postsDir, queueFile });

    const edited = fs
      .readFileSync(queueFile, "utf-8")
      .replace("| razer-deathadder-essential | chuot-gaming | pending |", "| razer-deathadder-essential | chuot-gaming | drafted |");
    fs.writeFileSync(queueFile, edited, "utf-8");

    const result = syncContentQueue({ productsDir, postsDir, queueFile });

    expect(result.added).toEqual([]);
    expect(result.autoPublished).toEqual([]);
    expect(result.rows[0].status).toBe("drafted");
  });

  it("drops a row once its product fixture no longer exists in the catalog", () => {
    writeProduct("logitech-g305-lightspeed-wireless");
    syncContentQueue({ productsDir, postsDir, queueFile });

    fs.rmSync(path.join(productsDir, "logitech-g305-lightspeed-wireless.json"));
    const result = syncContentQueue({ productsDir, postsDir, queueFile });

    expect(result.removed).toEqual(["logitech-g305-lightspeed-wireless"]);
    expect(result.rows).toEqual([]);
  });

  it("throws naming the slug when the queue file has a corrupted status value", () => {
    writeProduct("razer-deathadder-essential");
    fs.mkdirSync(path.dirname(queueFile), { recursive: true });
    fs.writeFileSync(
      queueFile,
      "| slug | category | status |\n| --- | --- | --- |\n" +
        "| razer-deathadder-essential | chuot-gaming | bogus-status |\n",
    );

    expect(() => syncContentQueue({ productsDir, postsDir, queueFile })).toThrow(
      /invalid status "bogus-status".*razer-deathadder-essential/,
    );
  });
});
