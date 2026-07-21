/**
 * Image staging — F0012 (US00123). Decisions D1–D10.
 *
 * Downloads a candidate's remote `imageUrls` to
 * `public/static/images/products/<slug>-<n>.<ext>` and returns the local
 * `/static/images/products/...` paths that replace them in the fixture.
 * Staging is atomic per candidate: any failure (404, timeout, bad content
 * type) rejects the whole candidate — no partial fixture is ever written —
 * and any in-flight `.part` temp file is removed. An already-staged file
 * (from a previous partial run) is skipped without re-fetching, so a
 * retried run completes (D4).
 *
 * Deliberately does **not** touch `next.config.ts`'s `images.remotePatterns`
 * — local staging is the whole point (spec §6).
 */

import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import type { Candidate, Rejection } from "./candidate";

const OK_EXT = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
const CONTENT_TYPE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const DEFAULT_DEST_DIR = path.join(process.cwd(), "public", "static", "images", "products");
const DEFAULT_TIMEOUT_MS = 15_000;

export interface StageImagesOptions {
  /** Override the write directory — tests point this at a temp dir. */
  destDir?: string;
  /** Override `fetch` — tests mock this. */
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

function extFromUrl(url: string): string | undefined {
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return undefined;
  }
  const match = /\.([a-zA-Z0-9]+)$/.exec(pathname);
  const ext = match?.[1]?.toLowerCase();
  return ext !== undefined && OK_EXT.has(ext) ? ext : undefined;
}

function extFromContentType(contentType: string | null): string | undefined {
  if (contentType === null) {
    return undefined;
  }
  const type = contentType.split(";")[0]?.trim().toLowerCase();
  return type !== undefined ? CONTENT_TYPE_EXT[type] : undefined;
}

/**
 * URL-derived extension wins (D2); the Content-Type header is the fallback
 * when the URL has none, and also the gate that rejects a mislabeled
 * response (e.g. a Shopee CDN 404 served as `text/html` 200 under a `.jpg`
 * URL — D10) even when the URL extension looked fine.
 */
function resolveExt(url: string, contentType: string | null): string | undefined {
  const urlExt = extFromUrl(url);
  const ctExt = extFromContentType(contentType);
  if (contentType !== null && ctExt === undefined) {
    return undefined;
  }
  return urlExt ?? ctExt;
}

function publicPath(slug: string, n: number, ext: string): string {
  return `/static/images/products/${slug}-${n}.${ext}`;
}

export async function stageImages(
  candidate: Candidate,
  slug: string,
  opts: StageImagesOptions = {},
): Promise<{ images: string[] } | Rejection> {
  const destDir = opts.destDir ?? DEFAULT_DEST_DIR;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const finalPaths: string[] = [];
  const temps: string[] = [];

  try {
    fs.mkdirSync(destDir, { recursive: true });

    for (let i = 0; i < candidate.imageUrls.length; i++) {
      const url = candidate.imageUrls[i];
      const n = i + 1;
      const urlExt = extFromUrl(url);

      if (urlExt !== undefined) {
        const knownAbs = path.join(destDir, `${slug}-${n}.${urlExt}`);
        if (fs.existsSync(knownAbs)) {
          finalPaths.push(publicPath(slug, n, urlExt)); // D4 — already staged, skip
          continue;
        }
      }

      const tmp = path.join(destDir, `${slug}-${n}.part`);
      temps.push(tmp);

      const res = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} fetching image ${n} (${url})`);
      }
      const ext = resolveExt(url, res.headers.get("content-type"));
      if (ext === undefined) {
        throw new Error(`unsupported content type fetching image ${n} (${url})`);
      }
      if (res.body === null) {
        throw new Error(`empty response body fetching image ${n} (${url})`);
      }

      await pipeline(
        Readable.fromWeb(res.body as unknown as NodeWebReadableStream<Uint8Array>),
        fs.createWriteStream(tmp),
      );
      const abs = path.join(destDir, `${slug}-${n}.${ext}`);
      fs.renameSync(tmp, abs);
      temps.pop();
      finalPaths.push(publicPath(slug, n, ext));
    }

    return { images: finalPaths };
  } catch (err) {
    for (const tmp of temps) {
      if (fs.existsSync(tmp)) {
        fs.unlinkSync(tmp);
      }
    }
    return {
      ref: candidate.sourceRef,
      name: candidate.name || candidate.sourceRef,
      reason: `image staging failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
