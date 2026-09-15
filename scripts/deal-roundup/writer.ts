/**
 * Deal-sidecar writer — F0015 (US00152).
 *
 * Serializes a roundup's `Deal[]` to `content/deals/<post-slug>.json`,
 * pretty-printed, matching the `Deal` interface (types/deal.ts) exactly so
 * the output satisfies `lib/deals.ts`'s build-time validation.
 *
 * Refuses to write a remote (`http`/`https`) image URL — the same
 * defense-in-depth backstop `scripts/ingest/writer.ts` carries for product
 * fixtures, protecting against a caller that skipped image staging.
 *
 * `generate:deal-post` overwrites by design (D6) — unlike
 * `scripts/ingest/writer.ts`, this file does not refuse an existing sidecar.
 */

import fs from "node:fs";
import path from "node:path";
import type { Deal } from "@/types";

const DEFAULT_DEALS_DIR = path.join(process.cwd(), "content", "deals");

export interface WriteDealSidecarOptions {
  /** Override the deals directory — tests point this at a fixture dir. */
  dealsDir?: string;
}

export function writeDealSidecar(
  postSlug: string,
  deals: Deal[],
  opts: WriteDealSidecarOptions = {},
): string {
  const remoteImage = deals.find((d) => /^https?:\/\//.test(d.image));
  if (remoteImage !== undefined) {
    throw new Error(
      `[deal-roundup] refusing to write sidecar "${postSlug}" with a remote image URL ` +
        `(staging must run first): ${remoteImage.image}`,
    );
  }

  const dealsDir = opts.dealsDir ?? DEFAULT_DEALS_DIR;
  fs.mkdirSync(dealsDir, { recursive: true });
  const filePath = path.join(dealsDir, `${postSlug}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(deals, null, 2)}\n`, "utf-8");
  return filePath;
}
