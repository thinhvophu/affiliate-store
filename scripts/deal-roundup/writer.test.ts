import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAllDeals } from "@/lib/deals";
import type { Deal } from "@/types";
import { writeDealSidecar } from "./writer";

let root: string;
let dealsDir: string;

function sampleDeals(postSlug: string): Deal[] {
  return [
    {
      id: `${postSlug}-1`,
      name: "Chuột Gaming Logitech G102 Lightsync",
      priceVnd: 349000,
      originalPriceVnd: 499000,
      discountPercent: 30,
      rating: 4.7,
      soldCount: 1500,
      image: `/static/images/deals/${postSlug}-1.jpg`,
      affiliateUrl: "https://s.shopee.vn/deal-aff-1",
      category: "chuot-gaming",
    },
    {
      id: `${postSlug}-2`,
      name: "Chuột Gaming Razer DeathAdder",
      priceVnd: 599000,
      originalPriceVnd: 899000,
      discountPercent: 33,
      rating: 4.9,
      soldCount: 3200,
      image: `/static/images/deals/${postSlug}-2.jpg`,
      affiliateUrl: "https://s.shopee.vn/deal-aff-2",
      category: "chuot-gaming",
    },
  ];
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "deal-writer-"));
  dealsDir = path.join(root, "content", "deals");
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("writeDealSidecar", () => {
  it("writes valid JSON that getAllDeals() reads back identically", () => {
    const postSlug = "deal-chuot-gaming-2026-09-07";
    const deals = sampleDeals(postSlug);

    const filePath = writeDealSidecar(postSlug, deals, { dealsDir });
    expect(fs.existsSync(filePath)).toBe(true);

    const readBack = getAllDeals({ dealsDir });
    expect(readBack).toEqual(deals);
  });

  it("refuses to write a remote image URL", () => {
    const postSlug = "deal-chuot-gaming-2026-09-07";
    const deals = sampleDeals(postSlug);
    deals[0].image = "https://down-vn.img.susercontent.com/file/deal-1";

    expect(() => writeDealSidecar(postSlug, deals, { dealsDir })).toThrow(/remote image URL/);
    expect(fs.existsSync(dealsDir)).toBe(false);
  });
});
