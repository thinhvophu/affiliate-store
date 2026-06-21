import { describe, it, expect } from "vitest";
import {
  getSiteUrl,
  absoluteUrl,
  buildCanonicalPath,
  buildRootMetadata,
  buildPageMetadata,
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

describe("buildPageMetadata", () => {
  it("sets alternates.canonical from the path option", () => {
    const metadata = buildPageMetadata({
      title: "Tiêu đề",
      description: "Mô tả",
      path: "/x/",
    });
    expect(metadata.alternates?.canonical).toBe("/x/");
  });
});
