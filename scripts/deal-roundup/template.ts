/**
 * Deal-roundup MDX stub renderer — F0015 (US00152), decision D8.
 *
 * Pure string builder, no filesystem access (same contract as
 * `scripts/scaffold/template.ts`) — `scripts/generate-deal-post.ts` owns I/O.
 *
 * A generator cannot produce 800 words of genuine Vietnamese copy, so only
 * the frontmatter (title/summary/tags/coverImage) and the deal-card embeds
 * are real, deterministic content; the body prose is left as TODO markers
 * for a human to fill in before `npm run build` — exactly the
 * `scaffold:post` → `/write-post` pattern.
 *
 * Deterministic from (count, categoryName, date) — no randomness, no
 * timestamps beyond the caller-supplied `publishedAt`.
 */

export interface DealPostStubDeal {
  /** `<post-slug>-<n>` — the id `<DealCard id>` embeds and `lib/deals.ts` resolves. */
  id: string;
  name: string;
}

export interface DealPostStubInput {
  /** Registered category slug (e.g. "chuot-gaming"). */
  category: string;
  /** Vietnamese display name from `getCategoryMeta()` — never `--query`. */
  categoryName: string;
  publishedAt: string;
  coverImage: string;
  /** In rank order — one `<DealCard id>` embed per deal, in this order. */
  deals: DealPostStubDeal[];
}

export function renderDealPostStub(input: DealPostStubInput): string {
  const { category, categoryName, publishedAt, coverImage, deals } = input;
  const categoryLower = categoryName.toLowerCase();
  const count = deals.length;

  const title = `Top ${count} deal ${categoryLower} trên Shopee tuần này`;
  const summary =
    `Tổng hợp ${count} deal ${categoryLower} đang giảm giá mạnh trên Shopee tuần này, ` +
    `kèm giá, mức giảm và đánh giá thực tế.`;

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `summary: ${JSON.stringify(summary)}`,
    `publishedAt: ${JSON.stringify(publishedAt)}`,
    `category: ${JSON.stringify(category)}`,
    `tags: ${JSON.stringify(["deal shopee", categoryLower, "khuyến mãi"])}`,
    `coverImage: ${JSON.stringify(coverImage)}`,
    "---",
  ].join("\n");

  const lead =
    `{/* roundup-lead:start */}\n` +
    `Tuần này chúng tôi chọn ra ${count} deal ${categoryLower} đáng chú ý nhất trên Shopee, ` +
    `dựa trên mức giảm giá, điểm đánh giá và lượt bán thực tế.\n` +
    `{/* roundup-lead:end */}`;

  const dealSections = deals
    .map(
      (deal, i) =>
        `### ${i + 1}. ${deal.name}\n\n` +
        `<DealCard id="${deal.id}" />\n\n` +
        `{/* TODO: viết nhận xét ngắn cho deal này */}`,
    )
    .join("\n\n");

  const body = [
    "",
    lead,
    "",
    `## Top ${count} deal ${categoryLower} tuần này`,
    "",
    dealSections,
    "",
    "## Lưu ý khi săn deal trên Shopee",
    "",
    "{/* TODO: viết phần lưu ý mua hàng */}",
    "",
  ].join("\n");

  return `${frontmatter}\n${body}`;
}
