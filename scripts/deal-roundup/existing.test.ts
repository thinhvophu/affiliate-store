import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readExistingPublishedAt } from "./existing";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "existing-"));
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("readExistingPublishedAt", () => {
  it("returns the existing publishedAt", () => {
    const p = path.join(dir, "deal-chuot-gaming.mdx");
    fs.writeFileSync(p, '---\ntitle: "x"\npublishedAt: "2026-10-12"\n---\nbody\n');
    expect(readExistingPublishedAt(p)).toBe("2026-10-12");
  });

  it("returns undefined for a missing file", () => {
    expect(readExistingPublishedAt(path.join(dir, "nope.mdx"))).toBeUndefined();
  });

  it("throws naming the path when publishedAt is missing", () => {
    const p = path.join(dir, "bad.mdx");
    fs.writeFileSync(p, '---\ntitle: "x"\n---\nbody\n');
    expect(() => readExistingPublishedAt(p)).toThrow(/bad\.mdx/);
  });
});
