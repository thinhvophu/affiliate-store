import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { MethodologyNote } from "./MethodologyNote";
import { METHODOLOGY_DEAL_VI, METHODOLOGY_GUIDE_VI } from "@/lib/disclosures";

describe("MethodologyNote (US00166)", () => {
  it("guide variant shows the guide copy and links to the author methodology anchor", () => {
    const html = renderToStaticMarkup(<MethodologyNote variant="guide" authorSlug="abc" />);
    expect(html).toContain(METHODOLOGY_GUIDE_VI);
    expect(html).toContain('href="/tac-gia/abc#cach-chon-san-pham"');
  });

  it("deal variant says picks come from Shopee's ranking and weren't tested hands-on", () => {
    const html = renderToStaticMarkup(<MethodologyNote variant="deal" authorSlug="abc" />);
    expect(html).toContain(METHODOLOGY_DEAL_VI);
    expect(METHODOLOGY_DEAL_VI).toMatch(/Shopee/);
    expect(METHODOLOGY_DEAL_VI).toMatch(/chưa/);
    expect(html).not.toContain(METHODOLOGY_GUIDE_VI);
    expect(html).toContain('href="/tac-gia/abc#cach-chon-san-pham"');
  });
});
