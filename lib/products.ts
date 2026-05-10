import fs from "node:fs";
import path from "node:path";
import type { Product } from "@/types";

const PRODUCTS_DIR = path.join(process.cwd(), "content", "products");

function validateProduct(data: unknown, filePath: string): Product {
  if (typeof data !== "object" || data === null) {
    throw new Error(`[content] ${filePath}: file does not contain a valid JSON object.`);
  }

  const obj = data as Record<string, unknown>;
  const requiredStrings: (keyof Product)[] = [
    "slug",
    "name",
    "category",
    "brand",
    "affiliateUrl",
    "description",
  ];
  for (const field of requiredStrings) {
    if (typeof obj[field] !== "string" || (obj[field] as string).trim() === "") {
      throw new Error(
        `[content] ${filePath}: missing or invalid required string field "${field}".`,
      );
    }
  }

  if (typeof obj.price !== "number" || obj.price < 0) {
    throw new Error(`[content] ${filePath}: "price" must be a non-negative number.`);
  }

  if (!Array.isArray(obj.images)) {
    throw new Error(`[content] ${filePath}: "images" must be an array of strings.`);
  }

  if (typeof obj.specs !== "object" || obj.specs === null || Array.isArray(obj.specs)) {
    throw new Error(
      `[content] ${filePath}: "specs" must be a plain object (Record<string, string>).`,
    );
  }

  if (typeof obj.publishedAt !== "string") {
    throw new Error(`[content] ${filePath}: missing or invalid "publishedAt" date string.`);
  }

  if (typeof obj.featured !== "boolean") {
    throw new Error(`[content] ${filePath}: "featured" must be a boolean.`);
  }

  return data as Product;
}

export function getAllProducts(): Product[] {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    return [];
  }

  const products: Product[] = [];
  const slugMap = new Map<string, string>();

  for (const file of files) {
    const filePath = path.join(PRODUCTS_DIR, file);
    let raw: string;
    try {
      raw = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      throw new Error(`[content] ${filePath}: unable to read file. ${err}`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(`[content] ${filePath}: invalid JSON. ${err}`);
    }

    const product = validateProduct(parsed, filePath);

    const existing = slugMap.get(product.slug);
    if (existing) {
      throw new Error(
        `[content] Duplicate product slug "${product.slug}" found in:\n` +
          `  - ${existing}\n` +
          `  - ${filePath}\n` +
          `Slugs must be unique because they are used as URL keys.`,
      );
    }
    slugMap.set(product.slug, filePath);

    products.push(product);
  }

  products.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return products;
}

export function getProductBySlug(slug: string): Product | null {
  const products = getAllProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
