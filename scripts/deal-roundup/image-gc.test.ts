import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findUnreferencedDealImages } from "./image-gc";

let root: string;
let imagesDir: string;
let dealsDir: string;
let postsDir: string;

function opts() {
  return { imagesDir, dealsDir, postsDir };
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "image-gc-"));
  imagesDir = path.join(root, "images");
  dealsDir = path.join(root, "deals");
  postsDir = path.join(root, "posts");
  for (const d of [imagesDir, dealsDir, postsDir]) fs.mkdirSync(d);
});
afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

function sidecar(image: string) {
  fs.writeFileSync(
    path.join(dealsDir, "deal-chuot-gaming.json"),
    JSON.stringify([
      {
        id: "deal-chuot-gaming-1",
        name: "Deal",
        priceVnd: 1,
        originalPriceVnd: 2,
        discountPercent: 50,
        rating: 4.5,
        soldCount: 1,
        image,
        affiliateUrl: "https://s.shopee.vn/x",
        category: "chuot-gaming",
      },
    ]),
  );
}

describe("findUnreferencedDealImages", () => {
  it("returns [] for an empty images dir", () => {
    expect(findUnreferencedDealImages(opts())).toEqual([]);
  });

  it("keeps images referenced by a sidecar, a coverImage or an MDX body", () => {
    for (const f of ["a.jpg", "b.jpg", "c.jpg", "orphan.jpg"]) {
      fs.writeFileSync(path.join(imagesDir, f), "x");
    }
    sidecar("/static/images/deals/a.jpg");
    fs.writeFileSync(
      path.join(postsDir, "p.mdx"),
      '---\ncoverImage: "/static/images/deals/b.jpg"\n---\n![](/static/images/deals/c.jpg)\n',
    );

    expect(findUnreferencedDealImages(opts())).toEqual([path.join(imagesDir, "orphan.jpg")]);
  });
});
