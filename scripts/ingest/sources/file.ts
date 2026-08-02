/**
 * File source adapter — F0012 (US00125). Decisions D1–D8.
 *
 * Reads a curated JSON array of hand-picked entries at `--path` (D1) — a
 * human operator's own product picks, as opposed to the automated
 * `--source=scrape` adapter. Only `name` + `url` are hard-required (D2); a
 * structural problem (unreadable file, not a JSON array, or any entry
 * missing `name`/`url`) is fatal and named for *every* offending entry
 * before anything is ingested (D5) — a two-pass approach: pass 1 checks
 * every entry's structure, pass 2 normalizes into `Candidate`. A
 * well-formed entry missing optional content (e.g. no `price`) is *not*
 * fatal here — it flows through to `validateCandidate` (US00121) and comes
 * back as a per-candidate rejection with a named reason, identical to the
 * scrape path (D6). `url` is passed straight through to `affiliateUrl`
 * untouched (D3) — this file must never parse/trim/rewrite it. `notes` is
 * read but never mapped onto the `Candidate` (D7) — it's not a `Product`
 * field.
 */

import fs from "node:fs";
import type { IngestArgs } from "../args";
import type { Candidate } from "../candidate";

interface FileEntry {
  name?: unknown;
  url?: unknown;
  brand?: unknown;
  price?: unknown;
  description?: unknown;
  specs?: unknown;
  images?: unknown;
  notes?: unknown;
}

function fail(message: string): never {
  throw new Error(`file source: ${message}`);
}

function readFileOrFatal(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    fail(`cannot read file ${filePath}.`);
  }
}

function parseJsonArrayOrFatal(raw: string, filePath: string): FileEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    fail(`${filePath} is not valid JSON (${e instanceof Error ? e.message : String(e)}).`);
  }
  if (!Array.isArray(parsed)) {
    fail(`${filePath} must contain a JSON array at the top level.`);
  }
  return parsed as FileEntry[];
}

/** Structural checks only — content-incomplete-but-well-formed entries are a `validateCandidate` rejection, not a fatal error (D5). */
function structuralProblems(entry: FileEntry, index: number): string[] {
  if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
    return [`entry ${index}: must be an object`];
  }
  const problems: string[] = [];
  if (typeof entry.name !== "string" || entry.name.trim() === "") {
    problems.push(`entry ${index}: missing required field "name"`);
  }
  if (typeof entry.url !== "string" || entry.url.trim() === "") {
    problems.push(`entry ${index}: missing required field "url"`);
  }
  return problems;
}

function isSpecsRecord(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapEntryToCandidate(
  entry: FileEntry,
  category: string,
  filePath: string,
  index: number,
): Candidate {
  return {
    name: entry.name as string,
    brand: typeof entry.brand === "string" ? entry.brand : "",
    price: typeof entry.price === "number" ? entry.price : Number.NaN,
    affiliateUrl: entry.url as string,
    description: typeof entry.description === "string" ? entry.description : "",
    specs: isSpecsRecord(entry.specs) ? entry.specs : {},
    imageUrls: Array.isArray(entry.images)
      ? entry.images.filter((u): u is string => typeof u === "string")
      : [],
    category,
    sourceRef: `file:${filePath}#${index}`,
  };
}

export async function loadFileCandidates(args: IngestArgs): Promise<Candidate[]> {
  const filePath = args.rest.path;
  if (!filePath) {
    throw new Error('file source: missing required flag "--path=<file>".');
  }

  const raw = readFileOrFatal(filePath);
  const entries = parseJsonArrayOrFatal(raw, filePath);

  const structuralErrors = entries.flatMap((entry, i) => structuralProblems(entry, i));
  if (structuralErrors.length > 0) {
    fail(`malformed entries in ${filePath}:\n${structuralErrors.join("\n")}`);
  }

  return Promise.resolve(
    entries.map((entry, i) => mapEntryToCandidate(entry, args.category, filePath, i)),
  );
}
