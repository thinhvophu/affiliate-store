import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

/** Spec floor: a cover image must be at least this many px on its shorter side. */
export const MIN_COVER_IMAGE_SHORT_SIDE_PX = 600;

const PUBLIC_DIR = path.join(process.cwd(), "public");

interface ImageDimensions {
  width: number;
  height: number;
}

type SizeResult =
  ({ ok: true } & ImageDimensions) | { ok: false; reason: "missing" | "unreadable" };

const cache = new Map<string, SizeResult>();

function resolve(publicRelativePath: string): SizeResult {
  const cached = cache.get(publicRelativePath);
  if (cached) return cached;

  const result = compute(publicRelativePath);
  cache.set(publicRelativePath, result);
  return result;
}

function compute(publicRelativePath: string): SizeResult {
  if (!publicRelativePath.startsWith("/")) {
    return { ok: false, reason: "missing" };
  }

  const fullPath = path.join(PUBLIC_DIR, publicRelativePath);

  let buffer: Buffer;
  try {
    buffer = fs.readFileSync(fullPath);
  } catch {
    return { ok: false, reason: "missing" };
  }

  try {
    const { width, height } = imageSize(buffer);
    if (!width || !height) return { ok: false, reason: "unreadable" };
    return { ok: true, width, height };
  } catch {
    return { ok: false, reason: "unreadable" };
  }
}

/**
 * Resolve a public/-relative image path to its pixel dimensions.
 * Returns null for a non-root-relative path, a missing file, or a file
 * that isn't a readable image (never throws).
 */
export function readImageSize(publicRelativePath: string): ImageDimensions | null {
  const result = resolve(publicRelativePath);
  return result.ok ? { width: result.width, height: result.height } : null;
}

/**
 * Throws when `publicRelativePath` doesn't resolve to a real image, or
 * resolves to one below `min` px on its shorter side. Named for `slug` so
 * `next build` failures point at the offending content, not just the path.
 */
export function assertMinShortSide(
  publicRelativePath: string,
  slug: string,
  min: number = MIN_COVER_IMAGE_SHORT_SIDE_PX,
): void {
  const result = resolve(publicRelativePath);

  if (!result.ok) {
    const reason =
      result.reason === "missing" ? "does not exist under public/" : "is not a readable image";
    throw new Error(`[content] ${slug}: coverImage "${publicRelativePath}" ${reason}.`);
  }

  const shortSide = Math.min(result.width, result.height);
  if (shortSide < min) {
    throw new Error(
      `[content] ${slug}: coverImage "${publicRelativePath}" is ${result.width}x${result.height}, ` +
        `below the ${min}px minimum on its shorter side.`,
    );
  }
}
