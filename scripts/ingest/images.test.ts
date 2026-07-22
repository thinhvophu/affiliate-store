import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Candidate } from "./candidate";
import { stageImages } from "./images";

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    name: "Chuột Gaming Test",
    brand: "TestBrand",
    price: 199000,
    affiliateUrl: "https://shope.ee/test-product",
    description: "Mô tả sản phẩm test.",
    specs: { DPI: "800-3200" },
    imageUrls: ["https://cdn.example.com/img-1.jpg"],
    category: "chuot-gaming",
    sourceRef: "test#1",
    ...overrides,
  };
}

let destDir: string;

beforeEach(() => {
  destDir = fs.mkdtempSync(path.join(os.tmpdir(), "ingest-images-"));
});

afterEach(() => {
  fs.rmSync(destDir, { recursive: true, force: true });
});

describe("stageImages", () => {
  it("downloads images and returns local paths", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        new Response("fake-image-bytes", { status: 200, headers: { "content-type": "image/jpeg" } }),
      );

    const result = await stageImages(candidate(), "chuot-gaming-test", { destDir, fetchImpl });

    expect(result).toEqual({ images: ["/static/images/products/chuot-gaming-test-1.jpg"] });
    expect(fs.readFileSync(path.join(destDir, "chuot-gaming-test-1.jpg"), "utf-8")).toBe(
      "fake-image-bytes",
    );
  });

  it("downloads multiple images in source order, named -1 / -2", async () => {
    const fetchImpl = vi
      .fn()
      .mockImplementation(
        async () => new Response("bytes", { status: 200, headers: { "content-type": "image/png" } }),
      );

    const result = await stageImages(
      candidate({ imageUrls: ["https://cdn.example.com/a.png", "https://cdn.example.com/b.png"] }),
      "chuot-gaming-test",
      { destDir, fetchImpl },
    );

    expect(result).toEqual({
      images: [
        "/static/images/products/chuot-gaming-test-1.png",
        "/static/images/products/chuot-gaming-test-2.png",
      ],
    });
  });

  it("rejects the candidate on a 404, leaving no orphan temp file", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));

    const result = await stageImages(candidate(), "chuot-gaming-test", { destDir, fetchImpl });

    expect(result).not.toHaveProperty("images");
    expect((result as { reason: string }).reason).toContain("404");
    expect(fs.readdirSync(destDir)).toEqual([]);
  });

  it("rejects the candidate on a timeout", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValue(new DOMException("The operation was aborted.", "TimeoutError"));

    const result = await stageImages(candidate(), "chuot-gaming-test", { destDir, fetchImpl });

    expect(result).not.toHaveProperty("images");
    expect((result as { reason: string }).reason).toMatch(/abort/i);
    expect(fs.readdirSync(destDir)).toEqual([]);
  });

  it("skips an already-staged image without calling fetch (idempotent retry)", async () => {
    fs.writeFileSync(path.join(destDir, "chuot-gaming-test-1.jpg"), "already-there");
    const fetchImpl = vi.fn();

    const result = await stageImages(candidate(), "chuot-gaming-test", { destDir, fetchImpl });

    expect(result).toEqual({ images: ["/static/images/products/chuot-gaming-test-1.jpg"] });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(fs.readFileSync(path.join(destDir, "chuot-gaming-test-1.jpg"), "utf-8")).toBe(
      "already-there",
    );
  });

  it("rejects when the response content-type is not an image (e.g. an HTML error page)", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        new Response("<html>404</html>", { status: 200, headers: { "content-type": "text/html" } }),
      );

    const result = await stageImages(candidate(), "chuot-gaming-test", { destDir, fetchImpl });

    expect(result).not.toHaveProperty("images");
    expect((result as { reason: string }).reason).toContain("content type");
    expect(fs.readdirSync(destDir)).toEqual([]);
  });
});
