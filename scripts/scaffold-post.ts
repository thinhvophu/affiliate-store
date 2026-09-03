/**
 * Blog-post MDX scaffold CLI — F0012 (US00126).
 *
 * Writes a buildable `content/posts/<slug>.mdx` stub (frontmatter +
 * `<ProductCard>` embeds) for a content-gap category, so an operator doesn't
 * hand-copy the frontmatter shape from an existing post each time. Article
 * prose is left for a human — see docs/specs/F0012.md § US00126 Scenario 1.
 *
 * `--products` is optional: when omitted, 1–2 products are auto-picked from
 * `--category` (featured first) via `selectProductsForCategory` — see
 * scripts/scaffold/select-products.ts.
 *
 * Run via `npm run scaffold:post -- --category=<slug> [--products=<a,b>]
 * [--title=<title>] [--slug=<slug>]`.
 */

import fs from "node:fs";
import path from "node:path";
import { assertCategoryRegistered } from "@/lib/categories";
import { getAllProducts, getProductBySlug } from "@/lib/products";
import type { Product } from "@/types";
import { slugifyProductName } from "./ingest/slug";
import { selectProductsForCategory } from "./scaffold/select-products";
import { renderPostStub } from "./scaffold/template";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface ScaffoldArgs {
  category: string;
  productSlugs?: string[];
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
  if (productSlugs) {
    if (productSlugs.length === 0) {
      throw new Error('"--products" must not be empty (omit the flag to auto-pick instead).');
    }
    if (productSlugs.length > 2) {
      throw new Error(`"--products" accepts at most 2 product slugs, got ${productSlugs.length}.`);
    }
  }

  return { category, productSlugs, title, slug };
}

function main(): void {
  const args = parseScaffoldArgs(process.argv.slice(2));

  assertCategoryRegistered(args.category, "<scaffold>");

  let products: Product[];
  if (args.productSlugs) {
    products = args.productSlugs.map((productSlug) => {
      const product = getProductBySlug(productSlug);
      if (!product) {
        throw new Error(
          `scaffold: unknown product slug "${productSlug}" — ingest it first (npm run ingest:products).`,
        );
      }
      return product;
    });
  } else {
    products = selectProductsForCategory(getAllProducts(), args.category);
    if (products.length === 0) {
      throw new Error(
        `scaffold: no products found in category "${args.category}" to auto-pick from — ` +
          `ingest some first, or pass --products=<slug-a,slug-b> explicitly.`,
      );
    }
    console.log(`[scaffold] auto-picked products: ${products.map((p) => p.slug).join(", ")}`);
  }

  const postSlug =
    args.slug ?? slugifyProductName(args.title ?? `${args.category}-${products[0].slug}`);
  if (postSlug === "" || !SLUG_REGEX.test(postSlug)) {
    throw new Error(
      `scaffold: invalid post slug "${postSlug}" — must be lowercase kebab-case ASCII ` +
        `(e.g. "man-hinh-gaming-top-5"). Pass a valid --slug explicitly.`,
    );
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
