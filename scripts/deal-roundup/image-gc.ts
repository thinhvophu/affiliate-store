/**
 * Finds staged deal images no sidecar, post cover or MDX body references any
 * more — what each weekly overwrite orphans (F0016/US00162, D4).
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getAllDeals } from "@/lib/deals";

export interface FindUnreferencedOptions {
  imagesDir: string;
  dealsDir: string;
  postsDir: string;
}

const DEALS_IMAGE_REF = /\/static\/images\/deals\/[^\s"'`)\]}>]+/g;

export function findUnreferencedDealImages(opts: FindUnreferencedOptions): string[] {
  const { imagesDir, dealsDir, postsDir } = opts;
  if (!fs.existsSync(imagesDir)) return [];

  const referenced = new Set<string>();
  for (const deal of getAllDeals({ dealsDir })) referenced.add(path.basename(deal.image));

  if (fs.existsSync(postsDir)) {
    for (const file of fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"))) {
      const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
      const { data, content } = matter(raw);
      if (typeof data.coverImage === "string") referenced.add(path.basename(data.coverImage));
      for (const ref of content.match(DEALS_IMAGE_REF) ?? []) referenced.add(path.basename(ref));
    }
  }

  return fs
    .readdirSync(imagesDir)
    .filter((f) => !referenced.has(f))
    .map((f) => path.join(imagesDir, f));
}
