/**
 * Product-slug rename CLI — F0013 (US00131, decision D6).
 *
 * Renaming a scraped product's slug touches five places: the fixture
 * filename, its `slug` field, its `images[]` paths, the staged image files
 * on disk, and every `coverImage` / `<ProductCard slug>` reference in
 * `content/posts/*.mdx`. Twelve-plus renames × five touch-points each is
 * exactly where a manual pass silently misses one — this CLI does all five
 * atomically so a single rename can never leave a dangling reference.
 *
 * Plans the full set of moves/rewrites and validates `--from`/`--to` before
 * touching disk, so a bad rename fails with no partial work.
 *
 * Run via `npm run rename:product -- --from=<old-slug> --to=<new-slug>`.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Product } from "@/types";

const MAX_SLUG_LENGTH = 60;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const DEFAULT_PRODUCTS_DIR = path.join(process.cwd(), "content", "products");
const DEFAULT_IMAGES_DIR = path.join(process.cwd(), "public", "static", "images", "products");
const DEFAULT_POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface RenameOptions {
  from: string;
  to: string;
  productsDir?: string;
  imagesDir?: string;
  postsDir?: string;
  /** Defaults to `git mv` (preserves history); tests inject `fs.renameSync`. */
  mv?: (from: string, to: string) => void;
}

interface RenamePlan {
  fixtureFrom: string;
  fixtureTo: string;
  product: Product;
  imageMoves: { from: string; to: string }[];
  newImages: string[];
  postUpdates: { file: string; content: string }[];
}

function gitMv(from: string, to: string): void {
  execFileSync("git", ["mv", from, to]);
}

function planRename(options: RenameOptions): RenamePlan {
  const { from, to } = options;
  const productsDir = options.productsDir ?? DEFAULT_PRODUCTS_DIR;
  const imagesDir = options.imagesDir ?? DEFAULT_IMAGES_DIR;
  const postsDir = options.postsDir ?? DEFAULT_POSTS_DIR;

  if (to.length > MAX_SLUG_LENGTH) {
    throw new Error(`[rename-product] --to "${to}" exceeds ${MAX_SLUG_LENGTH} chars.`);
  }
  if (!SLUG_REGEX.test(to)) {
    throw new Error(`[rename-product] --to "${to}" is not kebab-case ASCII (invalid slug).`);
  }

  const fixtureFrom = path.join(productsDir, `${from}.json`);
  const fixtureTo = path.join(productsDir, `${to}.json`);

  if (!fs.existsSync(fixtureFrom)) {
    throw new Error(`[rename-product] --from "${from}" does not exist (no ${fixtureFrom}).`);
  }
  if (fs.existsSync(fixtureTo)) {
    throw new Error(`[rename-product] --to "${to}" already exists (${fixtureTo} is taken).`);
  }

  const product = JSON.parse(fs.readFileSync(fixtureFrom, "utf-8")) as Product;

  const imageMoves: { from: string; to: string }[] = [];
  const newImages: string[] = [];
  const IMAGE_RE = new RegExp(`^/static/images/products/${escapeRegExp(from)}(-\\d+)?\\.([a-zA-Z0-9]+)$`);

  for (const imagePath of product.images) {
    const match = IMAGE_RE.exec(imagePath);
    if (!match) {
      throw new Error(
        `[rename-product] product "${from}" has an image path that does not match the expected ` +
          `"/static/images/products/${from}-N.ext" shape: "${imagePath}". Refusing partial rename.`,
      );
    }
    const [, suffix = "", ext] = match;
    const fileName = `${from}${suffix}.${ext}`;
    const newFileName = `${to}${suffix}.${ext}`;
    const fileFrom = path.join(imagesDir, fileName);
    if (!fs.existsSync(fileFrom)) {
      throw new Error(`[rename-product] staged image missing on disk: ${fileFrom}`);
    }
    imageMoves.push({ from: fileFrom, to: path.join(imagesDir, newFileName) });
    newImages.push(`/static/images/products/${newFileName}`);
  }

  const postUpdates: { file: string; content: string }[] = [];
  if (fs.existsSync(postsDir)) {
    for (const fileName of fs.readdirSync(postsDir)) {
      if (!fileName.endsWith(".mdx")) continue;
      const filePath = path.join(postsDir, fileName);
      const original = fs.readFileSync(filePath, "utf-8");
      let rewritten = original.replaceAll(
        new RegExp(`<ProductCard slug="${escapeRegExp(from)}"`, "g"),
        `<ProductCard slug="${to}"`,
      );
      for (const move of imageMoves) {
        const oldPublicPath = `/static/images/products/${path.basename(move.from)}`;
        const newPublicPath = `/static/images/products/${path.basename(move.to)}`;
        rewritten = rewritten.split(oldPublicPath).join(newPublicPath);
      }
      if (rewritten !== original) {
        postUpdates.push({ file: filePath, content: rewritten });
      }
    }
  }

  return {
    fixtureFrom,
    fixtureTo,
    product: { ...product, slug: to, images: newImages },
    imageMoves,
    newImages,
    postUpdates,
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyRename(plan: RenamePlan, mv: (from: string, to: string) => void): void {
  mv(plan.fixtureFrom, plan.fixtureTo);
  fs.writeFileSync(plan.fixtureTo, `${JSON.stringify(plan.product, null, 2)}\n`, "utf-8");

  for (const move of plan.imageMoves) {
    mv(move.from, move.to);
  }

  for (const update of plan.postUpdates) {
    fs.writeFileSync(update.file, update.content, "utf-8");
  }
}

/**
 * Renames a product's slug and every dependent reference. Validates and
 * builds the full plan before mutating anything (no partial work on a
 * validation failure), then applies fixture rename → image moves → post
 * rewrites.
 */
export function renameProduct(options: RenameOptions): RenamePlan {
  const plan = planRename(options);
  applyRename(plan, options.mv ?? gitMv);
  return plan;
}

function printSummary(from: string, to: string, plan: RenamePlan): void {
  console.log(`[rename-product] ${from} -> ${to}`);
  console.log(`  fixture: ${path.basename(plan.fixtureFrom)} -> ${path.basename(plan.fixtureTo)}`);
  for (const move of plan.imageMoves) {
    console.log(`  image:   ${path.basename(move.from)} -> ${path.basename(move.to)}`);
  }
  if (plan.postUpdates.length === 0) {
    console.log("  posts:   (no references found)");
  } else {
    for (const update of plan.postUpdates) {
      console.log(`  post:    ${path.relative(process.cwd(), update.file)} updated`);
    }
  }
}

function parseArgs(argv: string[]): { from: string; to: string } {
  let from: string | undefined;
  let to: string | undefined;

  for (const token of argv) {
    const eq = token.indexOf("=");
    if (!token.startsWith("--") || eq === -1) {
      throw new Error(`Unknown argument: "${token}" (expected "--from=<slug>" / "--to=<slug>").`);
    }
    const key = token.slice(2, eq);
    const value = token.slice(eq + 1);
    if (key === "from") from = value;
    else if (key === "to") to = value;
    else throw new Error(`Unknown flag: "--${key}".`);
  }

  if (!from) throw new Error('Missing required flag: "--from=<slug>".');
  if (!to) throw new Error('Missing required flag: "--to=<slug>".');

  return { from, to };
}

function main(): void {
  const { from, to } = parseArgs(process.argv.slice(2));
  const plan = renameProduct({ from, to });
  printSummary(from, to, plan);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  try {
    main();
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
