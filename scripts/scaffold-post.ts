/**
 * Blog-post MDX scaffold CLI — F0012 (US00126).
 *
 * Writes a buildable `content/posts/<slug>.mdx` stub (frontmatter +
 * `<ProductCard>` embeds) for a content-gap category, so an operator doesn't
 * hand-copy the frontmatter shape from an existing post each time. Article
 * prose is left for a human — see docs/specs/F0012.md § US00126 Scenario 1.
 *
 * Run via `npm run scaffold:post -- --category=<slug> --products=<a,b>
 * [--title=<title>] [--slug=<slug>]`.
 */

import fs from "node:fs";
import path from "node:path";
import { assertCategoryRegistered } from "@/lib/categories";
import { getProductBySlug } from "@/lib/products";
import { slugifyProductName } from "./ingest/slug";
import { renderPostStub } from "./scaffold/template";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

interface ScaffoldArgs {
  category: string;
  productSlugs: string[];
  title?: string;
  slug?: string;
}

function parseScaffoldArgs(argv: string[]): ScaffoldArgs {
  let category: string | undefined;
  let productSlugs: string[] | undefined;
  let title: string | undefined;
  let slug: string | undefined;

  for (const token of argv) {
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected positional argument: "${token}".`);
    }

    const eq = token.indexOf("=");
    if (eq === -1) {
      throw new Error(`Unknown flag: "${token}" (expected "--key=value").`);
    }

    const key = token.slice(2, eq);
    const value = token.slice(eq + 1);

    if (key === "category") {
      category = value;
    } else if (key === "products") {
      productSlugs = value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    } else if (key === "title") {
      title = value;
    } else if (key === "slug") {
      slug = value;
    } else {
      throw new Error(`Unknown flag: "--${key}".`);
    }
  }

  if (!category) {
    throw new Error('Missing required flag: "--category=<slug>".');
  }
  if (!productSlugs || productSlugs.length === 0) {
    throw new Error('Missing required flag: "--products=<slug-a,slug-b>".');
  }
  if (productSlugs.length > 2) {
    throw new Error(
      `"--products" accepts at most 2 product slugs, got ${productSlugs.length}.`,
    );
  }

  return { category, productSlugs, title, slug };
}

function main(): void {
  const args = parseScaffoldArgs(process.argv.slice(2));

  assertCategoryRegistered(args.category, "<scaffold>");

  const products = args.productSlugs.map((productSlug) => {
    const product = getProductBySlug(productSlug);
    if (!product) {
      throw new Error(
        `scaffold: unknown product slug "${productSlug}" — ingest it first (npm run ingest:products).`,
      );
    }
    return product;
  });

  const postSlug =
    args.slug ?? slugifyProductName(args.title ?? `${args.category}-${products[0].slug}`);
  if (postSlug === "") {
    throw new Error("scaffold: computed post slug is empty — pass an explicit --slug.");
  }

  const dest = path.join(POSTS_DIR, `${postSlug}.mdx`);
  if (fs.existsSync(dest)) {
    throw new Error(`scaffold: ${dest} already exists — refusing to overwrite.`);
  }

  const coverImage = products[0].images[0];

  const stub = renderPostStub({
    title: "TODO: viết tiêu đề bài viết",
    summary: "TODO: viết tóm tắt bài viết",
    category: args.category,
    publishedAt: new Date().toISOString().slice(0, 10),
    coverImage,
    productSlugs: products.map((p) => p.slug),
  });

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(dest, stub);

  console.log(`[scaffold] wrote ${dest}`);
}

try {
  main();
} catch (err) {
  console.error(`[scaffold] ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}
