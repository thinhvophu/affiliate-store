import type { Product } from "@/types";
import { absoluteUrl, buildCanonicalPath } from "@/lib/seo";

export const PRODUCT_AVAILABILITY_IN_STOCK = "https://schema.org/InStock";

export function buildProductSchema(product: Product): Record<string, unknown> {
  const url = absoluteUrl(buildCanonicalPath(["san-pham", product.slug]));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: absoluteUrl(product.images[0]),
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    url,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "VND",
      availability: PRODUCT_AVAILABILITY_IN_STOCK,
      url,
    },
  };
}
