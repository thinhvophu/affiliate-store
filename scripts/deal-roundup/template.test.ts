import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { renderDealPostStub, type DealPostStubInput } from "./template";

function baseInput(overrides: Partial<DealPostStubInput> = {}): DealPostStubInput {
  return {
    category: "chuot-gaming",
    categoryName: "Chuột gaming",
    publishedAt: "2026-09-07",
    coverImage: "/static/images/deals/deal-chuot-gaming-2026-09-07-1.jpg",
    deals: [
      { id: "deal-chuot-gaming-2026-09-07-1", name: "Chuột Gaming Logitech G102 Lightsync" },
      { id: "deal-chuot-gaming-2026-09-07-2", name: "Chuột Gaming Razer DeathAdder" },
      { id: "deal-chuot-gaming-2026-09-07-3", name: "Chuột Gaming Rapoo V16" },
      { id: "deal-chuot-gaming-2026-09-07-4", name: "Chuột Gaming Fuhlen L102" },
      { id: "deal-chuot-gaming-2026-09-07-5", name: "Chuột Gaming HyperX Pulsefire" },
    ],
    ...overrides,
  };
}

describe("renderDealPostStub", () => {
  it("round-trips through gray-matter with valid frontmatter", () => {
    const stub = renderDealPostStub(baseInput());
    const parsed = matter(stub);

    expect(parsed.data.title).toEqual(expect.any(String));
    expect(parsed.data.summary).toEqual(expect.any(String));
    expect(parsed.data.publishedAt).toBe("2026-09-07");
    expect(parsed.data.category).toBe("chuot-gaming");
    expect(Array.isArray(parsed.data.tags)).toBe(true);
    expect(parsed.data.tags.length).toBeGreaterThan(0);
    expect(parsed.data.coverImage).toBe("/static/images/deals/deal-chuot-gaming-2026-09-07-1.jpg");
  });

  it("title ends with 'tuần này' and contains no TODO", () => {
    const stub = renderDealPostStub(baseInput());
    const { data } = matter(stub);
    expect(data.title.toLowerCase().endsWith("tuần này")).toBe(true);
    expect(data.title).not.toMatch(/TODO/i);
  });

  it("summary is a genuine 50–160 char sentence with no TODO", () => {
    const stub = renderDealPostStub(baseInput());
    const { data } = matter(stub);
    expect(data.summary.length).toBeGreaterThanOrEqual(50);
    expect(data.summary.length).toBeLessThanOrEqual(160);
    expect(data.summary).not.toMatch(/TODO/i);
  });

  it("tags are non-empty", () => {
    const stub = renderDealPostStub(baseInput());
    const { data } = matter(stub);
    expect(data.tags.length).toBeGreaterThanOrEqual(1);
  });

  it("emits exactly one <DealCard id> per deal, in order", () => {
    const stub = renderDealPostStub(baseInput());
    const matches = [...stub.matchAll(/<DealCard id="([^"]+)"/g)].map((m) => m[1]);
    expect(matches).toEqual([
      "deal-chuot-gaming-2026-09-07-1",
      "deal-chuot-gaming-2026-09-07-2",
      "deal-chuot-gaming-2026-09-07-3",
      "deal-chuot-gaming-2026-09-07-4",
      "deal-chuot-gaming-2026-09-07-5",
    ]);
  });

  it("has exactly two h2 (## ) headings", () => {
    const stub = renderDealPostStub(baseInput());
    const { content } = matter(stub);
    const h2s = content.match(/^## /gm) ?? [];
    expect(h2s.length).toBe(2);
  });

  it("has one h3 heading per deal", () => {
    const stub = renderDealPostStub(baseInput());
    const { content } = matter(stub);
    const h3s = content.match(/^### /gm) ?? [];
    expect(h3s.length).toBe(5);
  });

  it("both roundup-lead markers are present exactly once", () => {
    const stub = renderDealPostStub(baseInput());
    expect(stub.match(/\{\/\* roundup-lead:start \*\/\}/g)?.length).toBe(1);
    expect(stub.match(/\{\/\* roundup-lead:end \*\/\}/g)?.length).toBe(1);
  });

  it("uses the registry category display name, lowercased, not the raw category slug", () => {
    const stub = renderDealPostStub(baseInput({ categoryName: "Tai nghe gaming" }));
    const { data } = matter(stub);
    expect(data.title).toContain("tai nghe gaming");
    expect(data.title).not.toContain("chuot-gaming");
  });
});
