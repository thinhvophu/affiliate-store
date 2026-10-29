import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CategoryGuides } from "./CategoryGuides";

describe("CategoryGuides", () => {
  it("renders nothing when there are no guides, deal or category link", () => {
    expect(renderToStaticMarkup(<CategoryGuides heading="X" guides={[]} />)).toBe("");
  });

  it("renders the category link alone", () => {
    const html = renderToStaticMarkup(
      <CategoryGuides
        heading="X"
        guides={[]}
        categoryLink={{ href: "/danh-muc/chuot-gaming", label: "Chuột" }}
      />,
    );
    expect(html).toContain('href="/danh-muc/chuot-gaming"');
  });
});
