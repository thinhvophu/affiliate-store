import { describe, expect, it } from "vitest";
import { parseIngestArgs } from "./args";

describe("parseIngestArgs", () => {
  it("throws when --category is missing", () => {
    expect(() => parseIngestArgs(["--source=file"])).toThrow(/--category/);
  });

  it("throws when --source is missing", () => {
    expect(() => parseIngestArgs(["--category=chuot-gaming"])).toThrow(/--source/);
  });

  it("parses --dry-run as boolean true", () => {
    const args = parseIngestArgs(["--category=chuot-gaming", "--source=file", "--dry-run"]);
    expect(args.dryRun).toBe(true);
  });

  it("defaults dryRun to false when --dry-run is absent", () => {
    const args = parseIngestArgs(["--category=chuot-gaming", "--source=file"]);
    expect(args.dryRun).toBe(false);
  });

  it("passes through source-specific flags into rest", () => {
    const args = parseIngestArgs(["--category=chuot-gaming", "--source=file", "--path=x"]);
    expect(args.rest).toEqual({ path: "x" });
  });

  it("throws naming an unknown bare flag", () => {
    expect(() => parseIngestArgs(["--category=chuot-gaming", "--source=file", "--frobnicate"])).toThrow(
      /--frobnicate/,
    );
  });

  it("throws on a positional argument", () => {
    expect(() =>
      parseIngestArgs(["--category=chuot-gaming", "--source=file", "positional"]),
    ).toThrow(/positional/);
  });

  it("parses --query as a string", () => {
    const args = parseIngestArgs([
      "--category=chuot-gaming",
      "--source=scrape",
      "--query=chuột gaming",
    ]);
    expect(args.query).toBe("chuột gaming");
  });

  it("parses --count as a positive integer", () => {
    const args = parseIngestArgs(["--category=chuot-gaming", "--source=scrape", "--count=8"]);
    expect(args.count).toBe(8);
  });

  it("throws on a non-integer --count", () => {
    expect(() =>
      parseIngestArgs(["--category=chuot-gaming", "--source=scrape", "--count=abc"]),
    ).toThrow(/--count/);
  });

  it("throws on a zero or negative --count", () => {
    expect(() =>
      parseIngestArgs(["--category=chuot-gaming", "--source=scrape", "--count=0"]),
    ).toThrow(/--count/);
  });

  it("parses a valid --date", () => {
    const args = parseIngestArgs(["--category=chuot-gaming", "--source=scrape", "--date=2026-07-22"]);
    expect(args.date).toBe("2026-07-22");
  });

  it("throws on a malformed --date", () => {
    expect(() =>
      parseIngestArgs(["--category=chuot-gaming", "--source=scrape", "--date=22-07-2026"]),
    ).toThrow(/--date/);
  });
});
