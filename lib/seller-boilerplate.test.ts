import { describe, expect, it } from "vitest";
import {
  MAX_DISPLAY_NAME_LENGTH,
  SELLER_BOILERPLATE_RULES,
  findBoilerplateViolations,
} from "./seller-boilerplate";

const POSITIVE: Record<string, string> = {
  pipe: "Razer Pro | HyperSpeed",
  bracket: "[HOT] Razer Pro",
  bang: "Razer Pro!",
  "chinh-hang": "Razer Pro Chính Hãng",
  "gia-re": "Razer Pro GIÁ RẺ",
  warranty: "Razer Pro Bảo hành 24 tháng",
  freeship: "Razer Pro FreeShip",
  "cam-ket": "Razer Pro CAM KẾT",
};

describe("SELLER_BOILERPLATE_RULES", () => {
  it("has a positive case for every rule", () => {
    expect(Object.keys(POSITIVE).sort()).toEqual(SELLER_BOILERPLATE_RULES.map((r) => r.id).sort());
  });

  for (const rule of SELLER_BOILERPLATE_RULES) {
    it(`${rule.id}: flags its positive case`, () => {
      expect(findBoilerplateViolations(POSITIVE[rule.id]).map((r) => r.id)).toContain(rule.id);
    });
  }

  it("BH n tháng short form is flagged", () => {
    expect(findBoilerplateViolations("Razer Pro BH 12 tháng").map((r) => r.id)).toContain(
      "warranty",
    );
  });

  it("passes a clean name, including a plain 'bảo hành' word", () => {
    expect(findBoilerplateViolations("Chuột Gaming Razer DeathAdder Essential")).toEqual([]);
    expect(findBoilerplateViolations("Tai nghe có chế độ bảo hành riêng")).toEqual([]);
  });

  it("flags names over the length cap and under the floor", () => {
    expect(
      findBoilerplateViolations("a".repeat(MAX_DISPLAY_NAME_LENGTH + 1)).map((r) => r.id),
    ).toContain("too-long");
    expect(findBoilerplateViolations("ab").map((r) => r.id)).toContain("too-short");
  });
});
