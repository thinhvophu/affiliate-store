import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { supersedePriorRoundup } from "./supersede";

let root: string;
let postsDir: string;
let dealsDir: string;

// Mirrors the double-quoted, single-line frontmatter shape
// `scripts/deal-roundup/template.ts` generates — not gray-matter's own YAML
// dumper, which reformats every field (multi-line summary, block-list tags)
// and would make the fixtures unrepresentative of a real generated post.
function writePost(slug: string, data: Record<string, unknown>, content: string): string {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(data.title)}`,
    `summary: ${JSON.stringify(data.summary)}`,
    `publishedAt: ${JSON.stringify(data.publishedAt)}`,
    `category: ${JSON.stringify(data.category)}`,
    `tags: ${JSON.stringify(data.tags)}`,
    `coverImage: ${JSON.stringify(data.coverImage)}`,
    "---",
  ].join("\n");
  const filePath = path.join(postsDir, `${slug}.mdx`);
  fs.writeFileSync(filePath, `${frontmatter}\n${content}`);
  return filePath;
}

function writeSidecar(slug: string): void {
  fs.writeFileSync(
    path.join(dealsDir, `${slug}.json`),
    JSON.stringify([
      {
        id: `${slug}-1`,
        name: "Deal",
        priceVnd: 100000,
        originalPriceVnd: 200000,
        discountPercent: 50,
        rating: 4.5,
        soldCount: 100,
        image: `/static/images/deals/${slug}-1.jpg`,
        affiliateUrl: "https://s.shopee.vn/deal-aff",
        category: "chuot-gaming",
      },
    ]),
  );
}

function roundupFrontmatter(overrides: Record<string, unknown> = {}) {
  return {
    title: "Top 5 deal chuột gaming trên Shopee tuần này",
    summary:
      "Tổng hợp 5 deal chuột gaming đang giảm giá mạnh trên Shopee tuần này, kèm giá và đánh giá.",
    publishedAt: "2026-08-01",
    category: "chuot-gaming",
    tags: ["deal shopee", "chuột gaming", "khuyến mãi"],
    coverImage: "/static/images/deals/deal-chuot-gaming-2026-08-01-1.jpg",
    ...overrides,
  };
}

const roundupBody = [
  "",
  "{/* roundup-lead:start */}",
  "Tuần này chúng tôi chọn ra 5 deal chuột gaming đáng chú ý nhất trên Shopee.",
  "{/* roundup-lead:end */}",
  "",
  "## Top 5 deal chuột gaming tuần này",
  "",
  '### 1. Deal 1\n\n<DealCard id="deal-chuot-gaming-2026-08-01-1" />',
  "",
].join("\n");

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "supersede-"));
  postsDir = path.join(root, "content", "posts");
  dealsDir = path.join(root, "content", "deals");
  fs.mkdirSync(postsDir, { recursive: true });
  fs.mkdirSync(dealsDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("supersedePriorRoundup", () => {
  it("returns supersededSlug: null and writes nothing when there is no prior roundup (Scenario 1)", () => {
    const currentSlug = "deal-chuot-gaming-2026-08-08";
    writePost(currentSlug, roundupFrontmatter({ publishedAt: "2026-08-08" }), roundupBody);
    writeSidecar(currentSlug);

    const filesBefore = fs.readdirSync(postsDir);
    const result = supersedePriorRoundup("chuot-gaming", currentSlug, { postsDir });

    expect(result).toEqual({ supersededSlug: null, alreadyArchived: false });
    expect(fs.readdirSync(postsDir)).toEqual(filesBefore);
  });

  it("rewrites title, summary and lead to name the archive date; leaves everything else unchanged (Scenario 2)", () => {
    const priorSlug = "deal-chuot-gaming-2026-08-01";
    const currentSlug = "deal-chuot-gaming-2026-08-08";
    writePost(priorSlug, roundupFrontmatter({ publishedAt: "2026-08-01" }), roundupBody);
    writeSidecar(priorSlug);
    writePost(currentSlug, roundupFrontmatter({ publishedAt: "2026-08-08" }), roundupBody);
    writeSidecar(currentSlug);

    const result = supersedePriorRoundup("chuot-gaming", currentSlug, { postsDir });
    expect(result).toEqual({ supersededSlug: priorSlug, alreadyArchived: false });

    const rewritten = matter(fs.readFileSync(path.join(postsDir, `${priorSlug}.mdx`), "utf-8"));
    expect(rewritten.data.title).toBe("Top 5 deal chuột gaming trên Shopee (01/08/2026)");
    expect(rewritten.data.summary).toContain("(01/08/2026)");
    expect(rewritten.data.summary).not.toContain("tuần này");
    expect(rewritten.content).toContain("ghi nhận ngày 01/08/2026");
    expect(rewritten.content).toContain(`/bai-viet/${currentSlug}/`);

    // Untouched fields.
    expect(rewritten.data.publishedAt).toBe("2026-08-01");
    expect(rewritten.data.coverImage).toBe(
      "/static/images/deals/deal-chuot-gaming-2026-08-01-1.jpg",
    );
    expect(rewritten.data.tags).toEqual(["deal shopee", "chuột gaming", "khuyến mãi"]);
    expect(rewritten.content).toContain('<DealCard id="deal-chuot-gaming-2026-08-01-1" />');
    expect(rewritten.content).toContain("## Top 5 deal chuột gaming tuần này");
  });

  it("is idempotent — a same-day re-run reports alreadyArchived and leaves the file byte-identical", () => {
    const priorSlug = "deal-chuot-gaming-2026-08-01";
    const currentSlug = "deal-chuot-gaming-2026-08-08";
    writePost(priorSlug, roundupFrontmatter({ publishedAt: "2026-08-01" }), roundupBody);
    writeSidecar(priorSlug);
    writePost(currentSlug, roundupFrontmatter({ publishedAt: "2026-08-08" }), roundupBody);
    writeSidecar(currentSlug);

    supersedePriorRoundup("chuot-gaming", currentSlug, { postsDir });
    const afterFirst = fs.readFileSync(path.join(postsDir, `${priorSlug}.mdx`), "utf-8");

    const result = supersedePriorRoundup("chuot-gaming", currentSlug, { postsDir });
    const afterSecond = fs.readFileSync(path.join(postsDir, `${priorSlug}.mdx`), "utf-8");

    expect(result).toEqual({ supersededSlug: priorSlug, alreadyArchived: true });
    expect(afterSecond).toBe(afterFirst);
  });

  it("rewrites only the newest of two prior roundups in the category", () => {
    const older = "deal-chuot-gaming-2026-07-25";
    const newer = "deal-chuot-gaming-2026-08-01";
    const currentSlug = "deal-chuot-gaming-2026-08-08";
    writePost(older, roundupFrontmatter({ publishedAt: "2026-07-25" }), roundupBody);
    writeSidecar(older);
    writePost(newer, roundupFrontmatter({ publishedAt: "2026-08-01" }), roundupBody);
    writeSidecar(newer);
    writePost(currentSlug, roundupFrontmatter({ publishedAt: "2026-08-08" }), roundupBody);
    writeSidecar(currentSlug);

    const result = supersedePriorRoundup("chuot-gaming", currentSlug, { postsDir });
    expect(result.supersededSlug).toBe(newer);

    const olderRewritten = matter(fs.readFileSync(path.join(postsDir, `${older}.mdx`), "utf-8"));
    expect(olderRewritten.data.title).toContain("tuần này");
  });

  it("throws naming the file and marker when the lead markers are missing", () => {
    const priorSlug = "deal-chuot-gaming-2026-08-01";
    const currentSlug = "deal-chuot-gaming-2026-08-08";
    writePost(
      priorSlug,
      roundupFrontmatter({ publishedAt: "2026-08-01" }),
      "\nMột đoạn văn mở đầu không có marker.\n",
    );
    writeSidecar(priorSlug);
    writePost(currentSlug, roundupFrontmatter({ publishedAt: "2026-08-08" }), roundupBody);
    writeSidecar(currentSlug);

    expect(() => supersedePriorRoundup("chuot-gaming", currentSlug, { postsDir })).toThrow(
      /roundup-lead:start/,
    );
  });

  it("throws when the rewritten summary would fall outside 50-160 chars", () => {
    const priorSlug = "deal-chuot-gaming-2026-08-01";
    const currentSlug = "deal-chuot-gaming-2026-08-08";
    const longSummary = `Tổng hợp deal chuột gaming tuần này ${"x".repeat(140)}`;
    writePost(
      priorSlug,
      roundupFrontmatter({ publishedAt: "2026-08-01", summary: longSummary }),
      roundupBody,
    );
    writeSidecar(priorSlug);
    writePost(currentSlug, roundupFrontmatter({ publishedAt: "2026-08-08" }), roundupBody);
    writeSidecar(currentSlug);

    expect(() => supersedePriorRoundup("chuot-gaming", currentSlug, { postsDir })).toThrow(
      /outside the 50-160 bound/,
    );
  });

  it("leaves another category's roundup untouched", () => {
    const otherCategorySlug = "deal-tai-nghe-gaming-2026-08-01";
    const currentSlug = "deal-chuot-gaming-2026-08-08";
    writePost(
      otherCategorySlug,
      roundupFrontmatter({ category: "tai-nghe-gaming", publishedAt: "2026-08-01" }),
      roundupBody,
    );
    writeSidecar(otherCategorySlug);
    writePost(currentSlug, roundupFrontmatter({ publishedAt: "2026-08-08" }), roundupBody);
    writeSidecar(currentSlug);

    const result = supersedePriorRoundup("chuot-gaming", currentSlug, { postsDir });
    expect(result).toEqual({ supersededSlug: null, alreadyArchived: false });

    const untouched = matter(
      fs.readFileSync(path.join(postsDir, `${otherCategorySlug}.mdx`), "utf-8"),
    );
    expect(untouched.data.title).toContain("tuần này");
  });
});
