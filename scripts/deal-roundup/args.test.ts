import { describe, expect, it } from "vitest";
import { parseDealRoundupArgs } from "./args";

describe("parseDealRoundupArgs", () => {
  it("throws when --category is missing", () => {
    expect(() => parseDealRoundupArgs(["--query=chuột gaming"])).toThrow(/--category/);
  });

  it("throws when --query is missing", () => {
    expect(() => parseDealRoundupArgs(["--category=chuot-gaming"])).toThrow(/--query/);
  });

  it("defaults --top to 5", () => {
    const args = parseDealRoundupArgs(["--category=chuot-gaming", "--query=chuột gaming"]);
    expect(args.top).toBe(5);
  });

  it("rejects --top=0", () => {
    expect(() =>
      parseDealRoundupArgs(["--category=chuot-gaming", "--query=chuột gaming", "--top=0"]),
    ).toThrow(/--top/);
  });

  it("rejects a non-numeric --top", () => {
    expect(() =>
      parseDealRoundupArgs(["--category=chuot-gaming", "--query=chuột gaming", "--top=abc"]),
    ).toThrow(/--top/);
  });

  it("rejects --top=99 (above the tool's own top_n ceiling)", () => {
    expect(() =>
      parseDealRoundupArgs(["--category=chuot-gaming", "--query=chuột gaming", "--top=99"]),
    ).toThrow(/--top/);
  });

  it("rejects an unknown flag", () => {
    expect(() =>
      parseDealRoundupArgs(["--category=chuot-gaming", "--query=chuột gaming", "--unknown=value"]),
    ).toThrow(/--unknown/);
  });

  it("passes --date through", () => {
    const args = parseDealRoundupArgs([
      "--category=chuot-gaming",
      "--query=chuột gaming",
      "--date=2026-09-01",
    ]);
    expect(args.date).toBe("2026-09-01");
  });

  it("rejects a malformed --date", () => {
    expect(() =>
      parseDealRoundupArgs([
        "--category=chuot-gaming",
        "--query=chuột gaming",
        "--date=09-01-2026",
      ]),
    ).toThrow(/--date/);
  });

  it("parses --dry-run as a flag", () => {
    const args = parseDealRoundupArgs([
      "--category=chuot-gaming",
      "--query=chuột gaming",
      "--dry-run",
    ]);
    expect(args.dryRun).toBe(true);
  });
});
