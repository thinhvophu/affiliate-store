import { describe, expect, it } from "vitest";
import { disambiguate, slugifyProductName } from "./slug";

describe("slugifyProductName", () => {
  it("folds diacritics and lowercases", () => {
    expect(slugifyProductName("Chuột Gaming Logitech")).toBe("chuot-gaming-logitech");
  });

  it("transliterates đ/Đ", () => {
    expect(slugifyProductName("Đế kê tay")).toBe("de-ke-tay");
  });

  it("matches an existing-fixture-style slug exactly", () => {
    expect(slugifyProductName("Chuột Gaming Logitech G102 Lightsync")).toBe(
      "chuot-gaming-logitech-g102-lightsync",
    );
  });

  it("collapses runs of separators into a single hyphen", () => {
    expect(slugifyProductName("Bàn phím  --  cơ  RGB")).toBe("ban-phim-co-rgb");
  });

  it("trims leading/trailing separators", () => {
    expect(slugifyProductName("  !Tai nghe!  ")).toBe("tai-nghe");
  });

  it("returns an empty string for symbol-only input", () => {
    expect(slugifyProductName("!!!???")).toBe("");
  });
});

describe("disambiguate", () => {
  it("returns the base unchanged when free", () => {
    expect(disambiguate("chuot-gaming", () => false)).toBe("chuot-gaming");
  });

  it("appends -2 when the base is taken", () => {
    const taken = new Set(["chuot-gaming"]);
    expect(disambiguate("chuot-gaming", (c) => taken.has(c))).toBe("chuot-gaming-2");
  });

  it("keeps incrementing past -2 until a free slug is found", () => {
    const taken = new Set(["chuot-gaming", "chuot-gaming-2", "chuot-gaming-3"]);
    expect(disambiguate("chuot-gaming", (c) => taken.has(c))).toBe("chuot-gaming-4");
  });
});
