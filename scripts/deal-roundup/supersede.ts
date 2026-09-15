/**
 * In-place archival rewriter for the previous week's roundup — F0015 (US00153).
 *
 * Spec §6 forbids a new "post status" field or state machine; supersession
 * is a content rewrite. When `generate-deal-post.ts` writes a new roundup
 * for a category, this rewrites the *prior* roundup in that category (if
 * any) so its H1, meta description and lead paragraph all name their own
 * publish date instead of reading "tuần này" — the same-week framing that
 * would otherwise cannibalize the new post in search (`lib/roundups.ts`'s
 * `demoteArchivedRoundups()` handles the promotion-surface side of the same
 * problem; this handles the on-page content side, per Scenario 2).
 *
 * Rewrites exactly three things — frontmatter `title`, frontmatter
 * `summary`, and the `{/* roundup-lead:start *\/}…{/* roundup-lead:end *\/}`
 * paragraph — via targeted raw-string replacement, never a full
 * parse/re-serialize round trip through gray-matter's YAML dumper (which
 * reformats untouched fields, e.g. collapsing a double-quoted single-line
 * `tags` array into a multi-line block list). Everything else — body prose,
 * `<DealCard>` embeds, the sidecar, `publishedAt`, `coverImage`, `tags` — is
 * therefore untouched byte-for-byte, and the sidecar keeps rendering the
 * deals the archived post was published with (the price-change disclaimer
 * already covers that).
 *
 * A post counts as "a prior roundup in this category" iff a sidecar exists
 * for it (`content/deals/<slug>.json`) — the same derivation `lib/roundups.ts`
 * uses. It is re-checked here directly against disk (not via `lib/deals.ts`,
 * which validates every deal field and would make an unrelated bad sidecar
 * abort this rewrite) — this function only needs to know whether the file
 * exists.
 *
 * Idempotent: a title already ending `"(dd/mm/yyyy)"` is left untouched
 * (spec §5's same-day re-run). Missing lead markers are fatal, not silently
 * skipped — a human deleting them while writing prose would otherwise leave
 * the archived page's visible content still claiming "tuần này".
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getCategoryMeta } from "@/lib/categories";
import { formatArchiveDate } from "@/lib/format";

const DEFAULT_POSTS_DIR = path.join(process.cwd(), "content", "posts");

const MIN_SUMMARY_LENGTH = 50;
const MAX_SUMMARY_LENGTH = 160;
const ARCHIVED_TITLE_SUFFIX_RE = /\(\d{2}\/\d{2}\/\d{4}\)$/;
const TUAN_NAY_RE = /\btuần này\b/;
const LEAD_START = "{/* roundup-lead:start */}";
const LEAD_END = "{/* roundup-lead:end */}";

export interface SupersedeOptions {
  /** Override the posts directory — tests point this at a fixture dir. */
  postsDir?: string;
}

export interface SupersedeResult {
  /** null when the category had no prior roundup — a first run (Scenario 1). */
  supersededSlug: string | null;
  /** true when the prior post was already in archived framing (same-day re-run). */
  alreadyArchived: boolean;
}

interface PriorRoundup {
  slug: string;
  filePath: string;
  publishedAt: string;
}

function dealsDirFor(postsDir: string): string {
  return path.join(path.dirname(postsDir), "deals");
}

function hasSidecar(postsDir: string, slug: string): boolean {
  return fs.existsSync(path.join(dealsDirFor(postsDir), `${slug}.json`));
}

function findPriorRoundup(
  postsDir: string,
  category: string,
  excludeSlug: string,
): PriorRoundup | null {
  if (!fs.existsSync(postsDir)) return null;

  let latest: PriorRoundup | null = null;

  for (const file of fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"))) {
    const slug = path.basename(file, ".mdx");
    if (slug === excludeSlug) continue;

    const filePath = path.join(postsDir, file);
    const { data } = matter(fs.readFileSync(filePath, "utf-8"));
    if (data.category !== category) continue;
    if (!hasSidecar(postsDir, slug)) continue;

    const publishedAt = data.publishedAt as string;
    if (
      !latest ||
      publishedAt > latest.publishedAt ||
      (publishedAt === latest.publishedAt && slug > latest.slug)
    ) {
      latest = { slug, filePath, publishedAt };
    }
  }

  return latest;
}

/**
 * Replaces exactly one `<field>: "<oldValue>"` frontmatter line with the new
 * value, via a plain substring match — no YAML re-serialization, so every
 * other line in the file is byte-identical before and after.
 */
function rewriteFrontmatterLine(
  content: string,
  field: string,
  oldValue: string,
  newValue: string,
  filePath: string,
): string {
  const oldLine = `${field}: ${JSON.stringify(oldValue)}`;
  const idx = content.indexOf(oldLine);
  if (idx === -1) {
    throw new Error(
      `[supersede] ${filePath}: expected frontmatter line ${JSON.stringify(oldLine)} not found — ` +
        `cannot rewrite "${field}". Every roundup stub is generated with a double-quoted, ` +
        `single-line "${field}: "…"" frontmatter field; hand-editing away from that shape breaks ` +
        `supersession.`,
    );
  }
  const newLine = `${field}: ${JSON.stringify(newValue)}`;
  return content.slice(0, idx) + newLine + content.slice(idx + oldLine.length);
}

function rewriteLead(content: string, replacementBody: string, filePath: string): string {
  const startIdx = content.indexOf(LEAD_START);
  const endIdx = content.indexOf(LEAD_END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(
      `[supersede] ${filePath}: missing "${LEAD_START}" / "${LEAD_END}" markers — cannot ` +
        `rewrite the lead paragraph for archival. A human editing the prose must not remove ` +
        `these markers.`,
    );
  }

  const before = content.slice(0, startIdx);
  const after = content.slice(endIdx + LEAD_END.length);
  return `${before}${LEAD_START}\n${replacementBody}\n${LEAD_END}${after}`;
}

/**
 * Rewrites the previous roundup in `category` (if any) to archived framing,
 * because `currentPostSlug` is now the current one for that category.
 */
export function supersedePriorRoundup(
  category: string,
  currentPostSlug: string,
  opts: SupersedeOptions = {},
): SupersedeResult {
  const postsDir = opts.postsDir ?? DEFAULT_POSTS_DIR;

  const prior = findPriorRoundup(postsDir, category, currentPostSlug);
  if (!prior) {
    return { supersededSlug: null, alreadyArchived: false };
  }

  const raw = fs.readFileSync(prior.filePath, "utf-8");
  const parsed = matter(raw);
  const title = parsed.data.title as string;

  if (ARCHIVED_TITLE_SUFFIX_RE.test(title)) {
    return { supersededSlug: prior.slug, alreadyArchived: true };
  }

  const archiveDate = formatArchiveDate(prior.publishedAt);
  const dateSuffix = `(${archiveDate})`;

  const newTitle = title.replace(TUAN_NAY_RE, dateSuffix);
  const summary = parsed.data.summary as string;
  const newSummary = summary.replace(TUAN_NAY_RE, dateSuffix);

  if (newSummary.length < MIN_SUMMARY_LENGTH || newSummary.length > MAX_SUMMARY_LENGTH) {
    throw new Error(
      `[supersede] ${prior.filePath}: rewritten summary is ${newSummary.length} chars, outside ` +
        `the ${MIN_SUMMARY_LENGTH}-${MAX_SUMMARY_LENGTH} bound lib/posts.test.ts enforces.`,
    );
  }

  const categoryName = getCategoryMeta(category)?.name ?? category;
  const leadBody =
    `Bài viết này tổng hợp các deal ${categoryName.toLowerCase()} trên Shopee, ghi nhận ngày ` +
    `${archiveDate}. Giá và mức giảm có thể đã thay đổi — xem bản cập nhật mới nhất tại ` +
    `[đây](/bai-viet/${currentPostSlug}/).`;

  let updated = rewriteFrontmatterLine(raw, "title", title, newTitle, prior.filePath);
  updated = rewriteFrontmatterLine(updated, "summary", summary, newSummary, prior.filePath);
  updated = rewriteLead(updated, leadBody, prior.filePath);

  fs.writeFileSync(prior.filePath, updated, "utf-8");

  return { supersededSlug: prior.slug, alreadyArchived: false };
}
