import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateLink } from "@/components/AffiliateLink";
import {
  AFFILIATE_DATA_ATTRIBUTES,
  AFFILIATE_LINK_SELECTOR,
  readAffiliateClickPayload,
} from "@/lib/analytics";

async function resolveWith(env: { NEXT_PUBLIC_GA_MEASUREMENT_ID?: string; NODE_ENV?: string }) {
  if (env.NEXT_PUBLIC_GA_MEASUREMENT_ID !== undefined) {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  }
  if (env.NODE_ENV !== undefined) {
    vi.stubEnv("NODE_ENV", env.NODE_ENV);
  }
  vi.resetModules();
  const { resolveGaMeasurementId } = await import("@/lib/analytics");
  return resolveGaMeasurementId();
}

describe("resolveGaMeasurementId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns undefined when the ID is unset, even in production", async () => {
    const result = await resolveWith({ NODE_ENV: "production" });
    expect(result).toBeUndefined();
  });

  it("returns undefined when the ID is an empty string, even in production", async () => {
    const result = await resolveWith({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
      NODE_ENV: "production",
    });
    expect(result).toBeUndefined();
  });

  it("returns the ID when set and NODE_ENV is production", async () => {
    const result = await resolveWith({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC1234567",
      NODE_ENV: "production",
    });
    expect(result).toBe("G-ABC1234567");
  });

  it("returns undefined in development even when the ID is set", async () => {
    const result = await resolveWith({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC1234567",
      NODE_ENV: "development",
    });
    expect(result).toBeUndefined();
  });

  it("returns undefined in test even when the ID is set", async () => {
    const result = await resolveWith({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC1234567",
      NODE_ENV: "test",
    });
    expect(result).toBeUndefined();
  });

  it("throws when the ID is malformed, regardless of NODE_ENV", async () => {
    await expect(
      resolveWith({
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "not-a-ga-id",
        NODE_ENV: "production",
      }),
    ).rejects.toThrow(/NEXT_PUBLIC_GA_MEASUREMENT_ID/);
  });

  it("throws on an injection attempt disguised as a measurement ID", async () => {
    await expect(
      resolveWith({
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC'});alert(1);//",
        NODE_ENV: "production",
      }),
    ).rejects.toThrow(/NEXT_PUBLIC_GA_MEASUREMENT_ID/);
  });
});

function elementWithAttributes(attributes: Record<string, string>) {
  return {
    getAttribute: (name: string) =>
      Object.prototype.hasOwnProperty.call(attributes, name) ? attributes[name] : null,
  };
}

describe("readAffiliateClickPayload", () => {
  it("reads all three attributes into a snake_case GA4 payload", () => {
    const el = elementWithAttributes({
      "data-product-name": "Chuột Logitech G102",
      "data-product-category": "chuot-gaming",
      "data-destination-url": "https://shope.ee/abc",
    });
    expect(readAffiliateClickPayload(el)).toEqual({
      product_name: "Chuột Logitech G102",
      product_category: "chuot-gaming",
      destination_url: "https://shope.ee/abc",
    });
  });

  it("returns null for a null element (click outside any affiliate link)", () => {
    expect(readAffiliateClickPayload(null)).toBeNull();
  });

  it("returns null when the element carries none of the contract attributes", () => {
    const el = elementWithAttributes({});
    expect(readAffiliateClickPayload(el)).toBeNull();
  });

  it("defaults a missing attribute to an empty string, never undefined", () => {
    const el = elementWithAttributes({
      "data-product-name": "Chuột Logitech G102",
      "data-destination-url": "https://shope.ee/abc",
    });
    const payload = readAffiliateClickPayload(el);
    expect(payload).toEqual({
      product_name: "Chuột Logitech G102",
      product_category: "",
      destination_url: "https://shope.ee/abc",
    });
    expect(payload).not.toHaveProperty("product_category", undefined);
  });

  it("round-trips Vietnamese diacritics verbatim", () => {
    const el = elementWithAttributes({
      "data-product-name": "Bàn phím cơ Akko 5075B Plus",
      "data-product-category": "ban-phim-co",
      "data-destination-url": "https://shope.ee/xyz",
    });
    expect(readAffiliateClickPayload(el)?.product_name).toBe("Bàn phím cơ Akko 5075B Plus");
  });
});

describe("F0003 ↔ F0007 data-* contract", () => {
  it("<AffiliateLink> emits exactly the attributes the click listener reads", () => {
    const html = renderToStaticMarkup(
      <AffiliateLink
        href="https://shope.ee/x"
        productName="Chuột Logitech G102"
        productCategory="chuot-gaming"
      >
        Mua ngay
      </AffiliateLink>,
    );

    expect(html).toContain(AFFILIATE_LINK_SELECTOR.slice(1, -1));
    for (const attr of Object.values(AFFILIATE_DATA_ATTRIBUTES)) {
      expect(html).toContain(`${attr}=`);
    }

    const payload = readAffiliateClickPayload(elementWithAttributesFromHtml(html));
    expect(payload).toEqual({
      product_name: "Chuột Logitech G102",
      product_category: "chuot-gaming",
      destination_url: "https://shope.ee/x",
    });
  });
});

/** Minimal HTML attribute reader — avoids a jsdom dependency for one contract test. */
function elementWithAttributesFromHtml(html: string) {
  const attrs: Record<string, string> = {};
  for (const match of html.matchAll(/([a-z-]+)="([^"]*)"/g)) {
    attrs[match[1]] = match[2].replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  }
  return elementWithAttributes(attrs);
}
