import { afterEach, describe, expect, it, vi } from "vitest";
import { printDealSummary } from "./report";

afterEach(() => vi.restoreAllMocks());

describe("printDealSummary", () => {
  it("prints the skipped-as-recent group and footer count", () => {
    const lines: string[] = [];
    vi.spyOn(console, "log").mockImplementation((m: string) => void lines.push(m));

    printDealSummary({
      requested: 5,
      deals: [],
      dropped: [],
      skippedRecent: [
        { rank: 1, name: "Chuột A" },
        { rank: 3, name: "Chuột C" },
      ],
      snapshotPath: "/x/2026-10-26.json",
      query: "chuột gaming",
    });

    const out = lines.join("\n");
    expect(out).toMatch(/Skipped as recent \(2\):/);
    expect(out).toMatch(/deal#3 — Chuột C/);
    expect(out).toMatch(/skipped as recent: 2/);
  });
});
