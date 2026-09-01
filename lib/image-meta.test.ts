import { describe, it, expect, beforeAll, afterAll, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  MIN_COVER_IMAGE_SHORT_SIDE_PX,
  readImageSize,
  assertMinShortSide,
} from "./image-meta";

const FIXTURE_DIR = path.join(process.cwd(), "public", "_test-image-meta");

function pngBuffer(width: number, height: number): Buffer {
  const buf = Buffer.alloc(24);
  buf.write("\x89PNG\r\n\x1a\n", 0, "binary");
  buf.write("IHDR", 12, "ascii");
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

beforeAll(() => {
  fs.mkdirSync(FIXTURE_DIR, { recursive: true });
  fs.writeFileSync(path.join(FIXTURE_DIR, "large.png"), pngBuffer(800, 800));
  fs.writeFileSync(path.join(FIXTURE_DIR, "tiny.png"), pngBuffer(1, 1));
  fs.writeFileSync(path.join(FIXTURE_DIR, "fake.jpg"), Buffer.from("this is not an image", "utf-8"));
});

afterAll(() => {
  fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MIN_COVER_IMAGE_SHORT_SIDE_PX", () => {
  it("is 600", () => {
    expect(MIN_COVER_IMAGE_SHORT_SIDE_PX).toBe(600);
  });
});

describe("readImageSize", () => {
  it("returns the dimensions of a valid PNG", () => {
    expect(readImageSize("/_test-image-meta/large.png")).toEqual({ width: 800, height: 800 });
  });

  it("returns null for a non-root-relative path", () => {
    expect(readImageSize("_test-image-meta/large.png")).toBeNull();
  });

  it("returns null for a missing path", () => {
    expect(readImageSize("/_test-image-meta/does-not-exist.png")).toBeNull();
  });

  it("returns null for an unreadable file", () => {
    expect(readImageSize("/_test-image-meta/fake.jpg")).toBeNull();
  });

  it("memoises so a second call does not re-read the file", () => {
    const spy = vi.spyOn(fs, "readFileSync");
    readImageSize("/_test-image-meta/tiny.png");
    const callsAfterFirst = spy.mock.calls.length;
    readImageSize("/_test-image-meta/tiny.png");
    expect(spy.mock.calls.length).toBe(callsAfterFirst);
  });
});

describe("assertMinShortSide", () => {
  it("does not throw for an image at or above the floor", () => {
    expect(() => assertMinShortSide("/_test-image-meta/large.png", "test-slug")).not.toThrow();
  });

  it("throws naming the slug, path and dimensions for an undersized image", () => {
    expect(() => assertMinShortSide("/_test-image-meta/tiny.png", "test-slug")).toThrow(
      /test-slug.*tiny\.png.*is 1x1, below the 600px minimum on its shorter side/,
    );
  });

  it("throws 'not a readable image' for a file that isn't a valid image", () => {
    expect(() => assertMinShortSide("/_test-image-meta/fake.jpg", "test-slug")).toThrow(
      /test-slug.*is not a readable image/,
    );
  });

  it("throws 'does not exist under public/' for a missing path", () => {
    expect(() => assertMinShortSide("/_test-image-meta/nope.png", "test-slug")).toThrow(
      /test-slug.*does not exist under public\//,
    );
  });
});
