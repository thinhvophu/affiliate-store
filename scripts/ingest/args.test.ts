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
});
