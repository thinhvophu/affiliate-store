import { getProductBySlug } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

/**
 * US00063 — MDX adapter for inline <ProductCard slug="…" /> in .mdx posts.
 *
 * Name-collision resolution (D2): the author-facing JSX tag "ProductCard" maps
 * to THIS component in mdx-components.tsx. The prop-based ProductCard (US00042)
 * takes `{ product: Product }` and is never directly exposed to MDX authors.
 * The map key is a string, so the two identifiers never collide in imports.
 *
 * Unknown slug (D4): throws a slug-named Error so next build fails loudly.
 * Never renders a blank card or defers to a runtime 404.
 */
export function MdxProductCard({ slug }: { slug: string }) {
  const product = getProductBySlug(slug);
  if (!product) {
    throw new Error(
      `[mdx ProductCard] <ProductCard slug="${slug}" />: no product JSON matches this slug.`
    );
  }
  return <ProductCard product={product} />;
}
