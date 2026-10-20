import { describe, expect, it } from "vitest";
import { getAllPosts } from "@/lib/posts";
import { LEGACY_ROUNDUP_REDIRECTS, findRedirectCollisions, type LegacyRedirect } from "./redirects";
import { roundupSlugFor } from "./roundups";

const slugOf = (urlPath: string) => urlPath.replace(/^\/bai-viet\//, "");

describe("LEGACY_ROUNDUP_REDIRECTS", () => {
  it("contains all 13 dated roundup sources", () => {
    expect(LEGACY_ROUNDUP_REDIRECTS).toHaveLength(13);
    expect(LEGACY_ROUNDUP_REDIRECTS.map((r) => r.source)).toContain(
      "/bai-viet/deal-chuot-gaming-2026-09-27",
    );
  });

  it("never shadows a live post", () => {
    const slugs = getAllPosts().map((p) => p.slug);
    expect(findRedirectCollisions(LEGACY_ROUNDUP_REDIRECTS, slugs)).toEqual([]);
  });

  it("points every destination at an existing evergreen roundup", () => {
    const posts = getAllPosts();
    for (const r of LEGACY_ROUNDUP_REDIRECTS) {
      const target = posts.find((p) => p.slug === slugOf(r.destination));
      expect(target, `missing destination post for ${r.source}`).toBeDefined();
      expect(slugOf(r.destination)).toBe(roundupSlugFor(target!.category));
    }
  });

  it("has permanent, slash-free, unique entries", () => {
    const sources = LEGACY_ROUNDUP_REDIRECTS.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
    for (const r of LEGACY_ROUNDUP_REDIRECTS) {
      expect(r.permanent).toBe(true);
      expect(r.source.endsWith("/")).toBe(false);
      expect(r.destination.endsWith("/")).toBe(false);
    }
  });
});

describe("findRedirectCollisions", () => {
  it("names a source slug that is still a live post", () => {
    const redirects: LegacyRedirect[] = [
      { source: "/bai-viet/deal-x-2026-01-01", destination: "/bai-viet/deal-x", permanent: true },
    ];
    expect(findRedirectCollisions(redirects, ["deal-x", "deal-x-2026-01-01"])).toEqual([
      "deal-x-2026-01-01",
    ]);
  });
});
