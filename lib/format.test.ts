import { describe, it, expect } from "vitest";
import { readingTimeVi } from "./format";

describe("readingTimeVi", () => {
  it("floors to 1 phút đọc for an empty body", () => {
    expect(readingTimeVi("")).toBe("1 phút đọc");
    expect(readingTimeVi("   ")).toBe("1 phút đọc");
  });

  it("floors to 1 phút đọc for a very short body", () => {
    expect(readingTimeVi("Xin chào thế giới")).toBe("1 phút đọc");
  });

  it("returns correct estimate for ~400 words (≈2 min)", () => {
    const words = Array.from({ length: 400 }, (_, i) => `word${i}`).join(" ");
    expect(readingTimeVi(words)).toBe("2 phút đọc");
  });

  it("returns correct estimate for ~600 words (≈3 min)", () => {
    const words = Array.from({ length: 600 }, (_, i) => `word${i}`).join(" ");
    expect(readingTimeVi(words)).toBe("3 phút đọc");
  });

  it("excludes fenced code blocks from word count", () => {
    const codeBlock = "```\n" + Array.from({ length: 500 }, () => "code").join(" ") + "\n```";
    const prose = "Đây là bài viết ngắn";
    const content = `${prose}\n${codeBlock}`;
    expect(readingTimeVi(content)).toBe("1 phút đọc");
  });

  it("excludes inline JSX/HTML tags from word count", () => {
    const tags = Array.from({ length: 300 }, () => '<ProductCard slug="some-product" />').join(
      "\n",
    );
    const prose = "Ngắn";
    const content = `${prose}\n${tags}`;
    expect(readingTimeVi(content)).toBe("1 phút đọc");
  });

  it("excludes markdown image syntax from word count", () => {
    const images = Array.from(
      { length: 300 },
      () => "![alt text with many words here](/path/to/image.jpg)",
    ).join("\n");
    const prose = "Ngắn thôi";
    const content = `${prose}\n${images}`;
    expect(readingTimeVi(content)).toBe("1 phút đọc");
  });

  it("is deterministic — same input always produces same output", () => {
    const content = Array.from({ length: 200 }, (_, i) => `từ${i}`).join(" ");
    const r1 = readingTimeVi(content);
    const r2 = readingTimeVi(content);
    expect(r1).toBe(r2);
  });

  it("returns a string matching '<n> phút đọc' pattern", () => {
    const content = Array.from({ length: 300 }, () => "word").join(" ");
    expect(readingTimeVi(content)).toMatch(/^\d+ phút đọc$/);
  });
});
