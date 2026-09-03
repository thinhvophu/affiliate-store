import { describe, expect, it, vi } from "vitest";
import { normalizeBase, verifyCanonical } from "./verify-canonical";

function mockFetch(routes: Record<string, string>): typeof fetch {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const path = new URL(url).pathname;
    const body = routes[path];
    if (body === undefined) {
      return new Response("not found", { status: 404 });
    }
    return new Response(body, { status: 200 });
  }) as unknown as typeof fetch;
}

function sitemap(host: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://${host}/</loc></url>
<url><loc>https://${host}/san-pham/</loc></url>
<url><loc>https://${host}/san-pham/logitech-g102-lightsync/</loc></url>
<url><loc>https://${host}/bai-viet/</loc></url>
<url><loc>https://${host}/bai-viet/top-5-chuot-gaming-gia-re/</loc></url>
<url><loc>https://${host}/danh-muc/chuot-gaming/</loc></url>
</urlset>`;
}

function robots(host: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: https://${host}/sitemap.xml\n`;
}

function page(opts: {
  canonical: string;
  ogUrl: string;
  jsonLdUrl: string;
  jsonLdImage: string;
}): string {
  return `<!doctype html><html><head>
<link rel="canonical" href="${opts.canonical}">
<meta property="og:url" content="${opts.ogUrl}">
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    url: opts.jsonLdUrl,
    image: opts.jsonLdImage,
    offers: { "@type": "Offer", url: opts.jsonLdUrl },
  })}</script>
</head><body></body></html>`;
}

const CLEAN_HOST = "muagear.com";

function cleanRoutes(host: string = CLEAN_HOST): Record<string, string> {
  return {
    "/sitemap.xml": sitemap(host),
    "/robots.txt": robots(host),
    "/san-pham/logitech-g102-lightsync/": page({
      canonical: `https://${host}/san-pham/logitech-g102-lightsync/`,
      ogUrl: `https://${host}/san-pham/logitech-g102-lightsync/`,
      jsonLdUrl: `https://${host}/san-pham/logitech-g102-lightsync/`,
      jsonLdImage: `https://${host}/static/images/products/logitech-g102.jpg`,
    }),
    "/bai-viet/top-5-chuot-gaming-gia-re/": page({
      canonical: `https://${host}/bai-viet/top-5-chuot-gaming-gia-re/`,
      ogUrl: `https://${host}/bai-viet/top-5-chuot-gaming-gia-re/`,
      jsonLdUrl: `https://${host}/bai-viet/top-5-chuot-gaming-gia-re/`,
      jsonLdImage: `https://${host}/static/images/blog/cover.jpg`,
    }),
    "/danh-muc/chuot-gaming/": page({
      canonical: `https://${host}/danh-muc/chuot-gaming/`,
      ogUrl: `https://${host}/danh-muc/chuot-gaming/`,
      jsonLdUrl: `https://${host}/danh-muc/chuot-gaming/`,
      jsonLdImage: `https://${host}/static/images/og-default.png`,
    }),
  };
}

describe("normalizeBase", () => {
  it("strips a trailing slash and keeps scheme + host", () => {
    expect(normalizeBase("https://muagear.com/")).toBe("https://muagear.com");
  });

  it("throws when --base is missing", () => {
    expect(() => normalizeBase(undefined)).toThrow(/--base/);
  });

  it("throws when --base is not a valid URL", () => {
    expect(() => normalizeBase("not-a-url")).toThrow(/--base/);
  });
});

describe("verifyCanonical", () => {
  it("(a) passes with no findings against an all-clean deployment", async () => {
    const fetchImpl = mockFetch(cleanRoutes());

    const result = await verifyCanonical("https://muagear.com", fetchImpl);

    expect(result.ok).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it("(b) flags a sitemap <loc> that still points at example.com", async () => {
    const routes = cleanRoutes();
    routes["/sitemap.xml"] = sitemap("muagear.com").replace(
      "https://muagear.com/san-pham/logitech-g102-lightsync/",
      "https://example.com/san-pham/logitech-g102-lightsync/",
    );
    const fetchImpl = mockFetch(routes);

    const result = await verifyCanonical("https://muagear.com", fetchImpl);

    expect(result.ok).toBe(false);
    expect(
      result.findings.some(
        (f) => f.artefact.includes("sitemap.xml") && f.message.includes("example.com"),
      ),
    ).toBe(true);
  });

  it("(c) flags a page whose canonical is on the wrong host", async () => {
    const routes = cleanRoutes();
    routes["/san-pham/logitech-g102-lightsync/"] = page({
      canonical: "https://example.com/san-pham/logitech-g102-lightsync/",
      ogUrl: "https://muagear.com/san-pham/logitech-g102-lightsync/",
      jsonLdUrl: "https://muagear.com/san-pham/logitech-g102-lightsync/",
      jsonLdImage: "https://muagear.com/static/images/products/logitech-g102.jpg",
    });
    const fetchImpl = mockFetch(routes);

    const result = await verifyCanonical("https://muagear.com", fetchImpl);

    expect(result.ok).toBe(false);
    expect(result.findings.some((f) => f.artefact.includes("canonical"))).toBe(true);
  });

  it("(d) flags a JSON-LD url/@id/image on the wrong host", async () => {
    const routes = cleanRoutes();
    routes["/bai-viet/top-5-chuot-gaming-gia-re/"] = page({
      canonical: "https://muagear.com/bai-viet/top-5-chuot-gaming-gia-re/",
      ogUrl: "https://muagear.com/bai-viet/top-5-chuot-gaming-gia-re/",
      jsonLdUrl: "https://muagear.com/bai-viet/top-5-chuot-gaming-gia-re/",
      jsonLdImage: "https://example.com/static/images/blog/cover.jpg",
    });
    const fetchImpl = mockFetch(routes);

    const result = await verifyCanonical("https://muagear.com", fetchImpl);

    expect(result.ok).toBe(false);
    expect(result.findings.some((f) => f.artefact.includes("JSON-LD"))).toBe(true);
  });

  it("(e) normalizes a trailing-slash base before fetching (no double slash)", async () => {
    const fetchImpl = mockFetch(cleanRoutes());

    const result = await verifyCanonical("https://muagear.com/", fetchImpl);

    expect(result.ok).toBe(true);
    const calledUrls = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.map((c) =>
      String(c[0]),
    );
    expect(calledUrls.some((u) => u.includes("//sitemap.xml"))).toBe(false);
    expect(calledUrls).toContain("https://muagear.com/sitemap.xml");
  });

  it("(f) missing --base is fatal before any fetch happens", () => {
    expect(() => normalizeBase(undefined)).toThrow();
  });
});
