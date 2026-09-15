import { getDealById } from "@/lib/deals";
import { DealCard } from "@/components/DealCard";

/**
 * US00152 — MDX adapter for inline <DealCard id="…" /> in .mdx posts.
 *
 * Exact structural parallel to MdxProductCard: the author-facing JSX tag
 * "DealCard" maps to THIS component in mdx-components.tsx. The prop-based
 * DealCard takes `{ deal: Deal }` and is never directly exposed to MDX
 * authors — the map key is a string, so the two identifiers never collide.
 *
 * Unknown id: throws an id-named Error so next build fails loudly, never
 * rendering a blank card or deferring to a runtime 404.
 */
export function MdxDealCard({ id }: { id: string }) {
  const deal = getDealById(id);
  if (!deal) {
    throw new Error(
      `[mdx DealCard] <DealCard id="${id}" />: no deal matches this id in content/deals/.`,
    );
  }
  return <DealCard deal={deal} />;
}
