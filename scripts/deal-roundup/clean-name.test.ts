import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findBoilerplateViolations } from "@/lib/seller-boilerplate";
import { parseDealsSnapshot } from "../ingest/sources/deal-schema";
import { cleanDealName } from "./clean-name";

describe("cleanDealName", () => {
  it("keeps only the segment before the first pipe", () => {
    expect(
      cleanDealName(
        "Chuột Gaming Razer DeathAdder Essential | Quang Học | 5 Nút Lập Trình | Led Đơn",
      ),
    ).toBe("Chuột Gaming Razer DeathAdder Essential");
  });

  it("strips [..] and 【..】 promo segments and exclamation marks", () => {
    expect(cleanDealName("[HOT] Chuột Logitech G102 【Freeship】 giá tốt!")).toBe(
      "Chuột Logitech G102 giá tốt",
    );
  });

  it.each([
    ["chính hãng", "Tai nghe Havit H2590BT CHÍNH HÃNG"],
    ["giá rẻ", "Tai nghe Havit H2590BT Giá Rẻ"],
    ["BH n tháng", "Tai nghe Havit H2590BT BH 12 tháng"],
    ["Bảo hành n tháng", "Tai nghe Havit H2590BT - Bảo hành 24 tháng"],
    ["freeship", "Tai nghe Havit H2590BT FreeShip"],
    ["cam kết", "Tai nghe Havit H2590BT cam kết đổi trả"],
  ])("removes the %s phrase case-insensitively", (_label, raw) => {
    const cleaned = cleanDealName(raw);
    expect(cleaned).not.toBeNull();
    expect(findBoilerplateViolations(cleaned as string)).toEqual([]);
    expect(cleaned).toContain("Tai nghe Havit H2590BT");
  });

  it("drops dangling 'Hàng' and separators left behind", () => {
    expect(cleanDealName("Tai Nghe Havit H2590BT Pro - Hàng chính hãng")).toBe(
      "Tai Nghe Havit H2590BT Pro",
    );
  });

  it("cuts an overlong name at the last word boundary within 70 chars", () => {
    const raw =
      "Chuột máy tính có dây TEKKIN Holy Sword M800 có app cute silent không tiếng ồn LED RGB 7 nút bấm";
    const cleaned = cleanDealName(raw) as string;
    expect(cleaned.length).toBeLessThanOrEqual(70);
    expect(raw.startsWith(cleaned)).toBe(true);
    expect(raw[cleaned.length]).toBe(" ");
  });

  it.each(["| | !!", "【Freeship】", "[HOT]", "!"])("returns null for %j", (raw) => {
    expect(cleanDealName(raw)).toBeNull();
  });

  it("gives a non-null, violation-free name for every real name in data/deals/2026-10-12.json", () => {
    const file = path.join(process.cwd(), "data", "deals", "2026-10-12.json");
    const snapshot = parseDealsSnapshot(JSON.parse(fs.readFileSync(file, "utf-8")), file);
    const names = snapshot.results.flatMap((r) => r.deals.map((d) => d.name));
    expect(names.length).toBeGreaterThan(0);
    for (const raw of names) {
      const cleaned = cleanDealName(raw);
      expect(cleaned, `"${raw}" cleaned to null`).not.toBeNull();
      expect(findBoilerplateViolations(cleaned as string), `"${raw}" → "${cleaned}"`).toEqual([]);
    }
  });
});
