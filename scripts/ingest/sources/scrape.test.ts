import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { IngestArgs } from "../args";
import { loadScrapeCandidates } from "./scrape";

const FIXTURE = path.join(__dirname, "..", "__fixtures__", "deals-sample.json");

function args(overrides: Partial<IngestArgs> = {}): IngestArgs {
  return {
    category: "chuot-gaming",
    source: "scrape",
    dryRun: false,
    date: "2026-07-22",
    rest: {},
    ...overrides,
  };
}

let dealsDir: string;

beforeEach(() => {
  dealsDir = fs.mkdtempSync(path.join(os.tmpdir(), "ingest-scrape-"));
  fs.copyFileSync(FIXTURE, path.join(dealsDir, "2026-07-22.json"));
});

afterEach(() => {
  fs.rmSync(dealsDir, { recursive: true, force: true });
});

describe("loadScrapeCandidates", () => {
  it("throws when --query is missing", async () => {
    await expect(loadScrapeCandidates(args({ query: undefined }), { dealsDir })).rejects.toThrow(
      /--query/,
    );
  });

  it("throws naming the expected path when the deals file is missing", async () => {
    await expect(
      loadScrapeCandidates(args({ query: "chuột gaming", date: "2026-01-01" }), { dealsDir }),
    ).rejects.toThrow(/2026-01-01\.json/);
  });

  it("throws a clear message on a malformed deals file", async () => {
    fs.writeFileSync(path.join(dealsDir, "2026-02-02.json"), JSON.stringify({ date: "2026-02-02" }));
    await expect(
      loadScrapeCandidates(args({ query: "chuột gaming", date: "2026-02-02" }), { dealsDir }),
    ).rejects.toThrow(/"results" must be an array/);
  });

  it("filters by --query and maps every matched deal to a Candidate", async () => {
    const candidates = await loadScrapeCandidates(args({ query: "chuột gaming" }), { dealsDir });

    expect(candidates).toHaveLength(3);
    expect(candidates.map((c) => c.sourceRef)).toEqual(["scrape#1", "scrape#2", "scrape#3"]);
    expect(candidates.every((c) => c.category === "chuot-gaming")).toBe(true);
  });

  it("maps brand/specs directly from the deal record (present → populated, absent → empty)", async () => {
    const [first, , third] = await loadScrapeCandidates(args({ query: "chuột gaming" }), { dealsDir });

    expect(first.brand).toBe("Logitech");
    expect(first.specs).toEqual({ DPI: "200-8000", "Kết nối": "Có dây" });
    expect(third.brand).toBe("");
    expect(third.specs).toEqual({});
  });

  it("passes the raw affiliateUrl through untouched, including a disallowed host", async () => {
    const [, second] = await loadScrapeCandidates(args({ query: "chuột gaming" }), { dealsDir });
    expect(second.affiliateUrl).toBe("https://malicious-host.example.com/aff-2");
  });

  it("caps at --count", async () => {
    const candidates = await loadScrapeCandidates(args({ query: "chuột gaming", count: 2 }), {
      dealsDir,
    });
    expect(candidates).toHaveLength(2);
  });

  it("is not an error when fewer deals exist than --count (shortfall)", async () => {
    const candidates = await loadScrapeCandidates(args({ query: "bàn phím cơ", count: 5 }), {
      dealsDir,
    });
    expect(candidates).toHaveLength(1);
  });

  it("collects imageUrl plus any imageGallery entries, deduped", async () => {
    const [first] = await loadScrapeCandidates(args({ query: "chuột gaming" }), { dealsDir });
    expect(first.imageUrls).toEqual(["https://down-vn.img.susercontent.com/file/demo-1"]);
  });
});
