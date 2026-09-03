import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { IngestArgs } from "../args";
import { loadFileCandidates } from "./file";

const FIXTURE = path.join(__dirname, "..", "__fixtures__", "curated-sample.json");

function args(overrides: Partial<IngestArgs> = {}): IngestArgs {
  return {
    category: "man-hinh-gaming",
    source: "file",
    dryRun: false,
    rest: {},
    ...overrides,
  };
}

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "ingest-file-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("loadFileCandidates", () => {
  it("throws when --path is missing", async () => {
    await expect(loadFileCandidates(args())).rejects.toThrow(/--path/);
  });

  it("throws naming the path when the file does not exist", async () => {
    const missing = path.join(dir, "nope.json");
    await expect(loadFileCandidates(args({ rest: { path: missing } }))).rejects.toThrow(
      new RegExp(missing.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  });

  it("throws when the file is not valid JSON", async () => {
    const file = path.join(dir, "bad.json");
    fs.writeFileSync(file, "{not json");
    await expect(loadFileCandidates(args({ rest: { path: file } }))).rejects.toThrow(
      /not valid JSON/,
    );
  });

  it("throws when the top-level value is not an array", async () => {
    const file = path.join(dir, "not-array.json");
    fs.writeFileSync(file, JSON.stringify({ name: "x", url: "y" }));
    await expect(loadFileCandidates(args({ rest: { path: file } }))).rejects.toThrow(
      /must contain a JSON array/,
    );
  });

  it("throws naming every entry missing name or url, before ingesting anything", async () => {
    const file = path.join(dir, "malformed.json");
    fs.writeFileSync(
      file,
      JSON.stringify([
        { name: "OK entry", url: "https://shope.ee/ok" },
        { name: "Missing URL" },
        { url: "https://shope.ee/missing-name" },
      ]),
    );
    await expect(loadFileCandidates(args({ rest: { path: file } }))).rejects.toThrow(
      /entry 1: missing required field "url"[\s\S]*entry 2: missing required field "name"/,
    );
  });

  it("maps a well-formed happy-path file to Candidates matching the full pipeline shape", async () => {
    const candidates = await loadFileCandidates(args({ rest: { path: FIXTURE } }));

    expect(candidates).toHaveLength(2);
    expect(candidates.map((c) => c.sourceRef)).toEqual([`file:${FIXTURE}#0`, `file:${FIXTURE}#1`]);
    expect(candidates[0]).toMatchObject({
      name: 'Màn hình Gaming Dell G2724D 27" 165Hz',
      brand: "Dell",
      price: 6490000,
      affiliateUrl: "https://shope.ee/AbCdEf123",
      category: "man-hinh-gaming",
    });
    expect(candidates[0].specs).toEqual({
      "Kích thước": "27 inch",
      "Độ phân giải": "2560x1440",
      "Tần số quét": "165Hz",
      "Tấm nền": "IPS",
    });
    expect(candidates[0].imageUrls).toEqual(["https://cf.shopee.vn/file/abc123"]);
  });

  it("does not rewrite the raw url — passes it straight through as affiliateUrl", async () => {
    const file = path.join(dir, "raw-url.json");
    fs.writeFileSync(
      file,
      JSON.stringify([{ name: "Test", url: "https://malicious-host.example.com/aff-1" }]),
    );
    const [candidate] = await loadFileCandidates(args({ rest: { path: file } }));
    expect(candidate.affiliateUrl).toBe("https://malicious-host.example.com/aff-1");
  });

  it("is well-formed but content-incomplete (no price) — not fatal, empty fields flow through for per-candidate rejection", async () => {
    const file = path.join(dir, "incomplete.json");
    fs.writeFileSync(file, JSON.stringify([{ name: "No Price", url: "https://shope.ee/np" }]));
    const [candidate] = await loadFileCandidates(args({ rest: { path: file } }));
    expect(candidate.name).toBe("No Price");
    expect(candidate.price).toBeNaN();
    expect(candidate.brand).toBe("");
    expect(candidate.specs).toEqual({});
    expect(candidate.imageUrls).toEqual([]);
  });

  it("reads notes without mapping them onto the Candidate", async () => {
    const file = path.join(dir, "notes.json");
    fs.writeFileSync(
      file,
      JSON.stringify([{ name: "Test", url: "https://shope.ee/n1", notes: "internal note" }]),
    );
    const [candidate] = await loadFileCandidates(args({ rest: { path: file } }));
    expect(candidate).not.toHaveProperty("notes");
  });
});
