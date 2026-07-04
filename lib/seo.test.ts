import { describe, it, expect } from "vitest";
import {
  getSiteUrl,
  absoluteUrl,
  buildCanonicalPath,
  buildRootMetadata,
  buildPageMetadata,
  truncateMetaDescription,
  MAX_META_DESCRIPTION_LENGTH,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_LOCALE,
} from "./seo";

describe("getSiteUrl", () => {
  it("returns the trimmed value of NEXT_PUBLIC_SITE_URL", () => {
    expect(getSiteUrl()).toBe("https://example.com");
  });
});

describe("absoluteUrl", () => {
  it("composes correctly for a path with a leading slash", () => {
    expect(absoluteUrl("/x/")).toBe("https://example.com/x/");
  });

  it("composes correctly for a path without a leading slash", () => {
    expect(absoluteUrl("x/")).toBe("https://example.com/x/");
  });
});

describe("buildCanonicalPath", () => {
  it("returns '/' for an empty segment list", () => {
    expect(buildCanonicalPath([])).toBe("/");
  });

  it("joins segments with a single trailing slash", () => {
    expect(buildCanonicalPath(["san-pham", "abc"])).toBe("/san-pham/abc/");
  });

  it("strips redundant slashes from each segment", () => {
    expect(buildCanonicalPath(["/san-pham/", "/abc/"])).toBe("/san-pham/abc/");
  });
});

describe("buildRootMetadata", () => {
  const metadata = buildRootMetadata();

  it("sets metadataBase as a URL instance", () => {
    expect(metadata.metadataBase).toBeInstanceOf(URL);
  });

  it("sets the title template and a non-empty default", () => {
    const title = metadata.title as { template: string; default: string };
    expect(title.template).toBe("%s | aff-store");
    expect(title.default.length).toBeGreaterThan(0);
  });

  it("sets default openGraph fields", () => {
    const openGraph = metadata.openGraph as { type: string; locale: string; images: Array<{ url: string }> };
    expect(openGraph.type).toBe("website");
    expect(openGraph.locale).toBe(DEFAULT_OG_LOCALE);
    expect(openGraph.images[0].url).toBe(DEFAULT_OG_IMAGE);
  });

  it("sets the default twitter card", () => {
    const twitter = metadata.twitter as { card: string };
    expect(twitter.card).toBe("summary_large_image");
  });
});

describe("truncateMetaDescription", () => {
  it("returns input unchanged when at or under the max length", () => {
    const text = "Mô tả ngắn.";
    expect(truncateMetaDescription(text)).toBe(text);
  });

  it("truncates at a sentence boundary when one exists at or after 80 chars in", () => {
    const sentence = `${"A".repeat(85)}. `;
    const rest = "B".repeat(100);
    const text = sentence + rest;
    const result = truncateMetaDescription(text, MAX_META_DESCRIPTION_LENGTH);
    expect(result).toBe(`${"A".repeat(85)}.`);
    expect(result.length).toBeLessThanOrEqual(MAX_META_DESCRIPTION_LENGTH);
  });

  it("truncates at the last whitespace boundary with an ellipsis otherwise", () => {
    const words = Array.from({ length: 40 }, (_, i) => `word${i}`).join(" ");
    const result = truncateMetaDescription(words, 50);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(50);
    const withoutEllipsis = result.slice(0, -1);
    expect(words.startsWith(withoutEllipsis)).toBe(true);
    expect(words[withoutEllipsis.length]).toBe(" ");
  });

  it("never cuts a word in half", () => {
    const words = Array.from({ length: 40 }, (_, i) => `word${i}`).join(" ");
    const result = truncateMetaDescription(words, 50);
    const withoutEllipsis = result.slice(0, -1);
    expect(withoutEllipsis.endsWith(" ")).toBe(false);
    expect(/word\d+$/.test(withoutEllipsis)).toBe(true);
  });

  it("hard-slices with an ellipsis when there is no whitespace at all", () => {
    const text = "A".repeat(200);
    const result = truncateMetaDescription(text, MAX_META_DESCRIPTION_LENGTH);
    expect(result).toBe(`${"A".repeat(MAX_META_DESCRIPTION_LENGTH)}…`);
  });
});

describe("buildPageMetadata", () => {
  it("sets alternates.canonical from the path option", () => {
    const metadata = buildPageMetadata({
      title: "Tiêu đề",
      description: "Mô tả",
      path: "/x/",
    });
    expect(metadata.alternates?.canonical).toBe("/x/");
  });

  it("falls back to DEFAULT_OG_IMAGE when no ogImage is given", () => {
    const metadata = buildPageMetadata({
      title: "Tiêu đề",
      description: "Mô tả",
      path: "/x/",
    });
    const openGraph = metadata.openGraph as { images: Array<{ url: string }> };
    const twitter = metadata.twitter as { images: string[] };
    expect(openGraph.images[0].url).toBe(DEFAULT_OG_IMAGE);
    expect(twitter.images[0]).toBe(DEFAULT_OG_IMAGE);
  });

  it("uses the provided ogImage when given", () => {
    const metadata = buildPageMetadata({
      title: "Tiêu đề",
      description: "Mô tả",
      path: "/x/",
      ogImage: "/static/images/products/foo.jpg",
    });
    const openGraph = metadata.openGraph as { images: Array<{ url: string }> };
    expect(openGraph.images[0].url).toBe("/static/images/products/foo.jpg");
  });

  it("matches OG/Twitter titles and descriptions to the input", () => {
    const metadata = buildPageMetadata({
      title: "Tiêu đề",
      description: "Mô tả",
      path: "/x/",
    });
    const openGraph = metadata.openGraph as { title: string; description: string };
    const twitter = metadata.twitter as { title: string; description: string; card: string };
    expect(openGraph.title).toBe("Tiêu đề");
    expect(openGraph.description).toBe("Mô tả");
    expect(twitter.title).toBe("Tiêu đề");
    expect(twitter.description).toBe("Mô tả");
    expect(twitter.card).toBe("summary_large_image");
  });

  it("truncates the description once for description/openGraph/twitter", () => {
    const longDescription = `${"word ".repeat(60)}`.trim();
    const metadata = buildPageMetadata({
      title: "Tiêu đề",
      description: longDescription,
      path: "/x/",
    });
    const expected = truncateMetaDescription(longDescription);
    const openGraph = metadata.openGraph as { description: string };
    const twitter = metadata.twitter as { description: string };
    expect(metadata.description).toBe(expected);
    expect(openGraph.description).toBe(expected);
    expect(twitter.description).toBe(expected);
  });
});
