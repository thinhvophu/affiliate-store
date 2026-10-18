import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["app", "components", "lib", "scripts/deal-roundup"];

const TS_HREF_RE =
  /(?:href|path|BASE_PATH|basePath|destination)\s*[=:]\s*\{?\s*(["'`])(\/[^"'`\s]*\/)\1/g;
const MDX_LINK_RE = /\]\((\/[^)\s]*\/)\)/g;
const MDX_HREF_RE = /href=(["'])(\/[^"'\s]*\/)\1/g;

interface ScanFile {
  file: string;
  source: string;
}

export function findTrailingSlashHrefs(files: ScanFile[]): string[] {
  const findings: string[] = [];
  for (const { file, source } of files) {
    const regexes = file.endsWith(".mdx") ? [MDX_LINK_RE, MDX_HREF_RE] : [TS_HREF_RE];
    source.split("\n").forEach((line, i) => {
      for (const re of regexes) {
        for (const m of line.matchAll(new RegExp(re.source, "g"))) {
          const literal = m[2] ?? m[1];
          findings.push(
            `${file}:${i + 1} — internal href "${literal}" ends with "/" (canonical form has no trailing slash)`,
          );
        }
      }
    });
  }
  return findings;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "node_modules" || name === "__fixtures__") continue;
      walk(full, out);
    } else if (/\.(ts|tsx|mdx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe("internal URL style (US00161)", () => {
  it("flags a trailing-slash href in TS/TSX", () => {
    const findings = findTrailingSlashHrefs([
      { file: "components/X.tsx", source: 'const a = 1;\n<Link href="/bai-viet/">x</Link>' },
      { file: "components/Y.tsx", source: "const BASE_PATH = `/san-pham/${s}/`;" },
      { file: "components/Z.tsx", source: '<Link href="/">ok</Link>' },
    ]);
    expect(findings).toHaveLength(2);
    expect(findings[0]).toContain("components/X.tsx:2");
  });

  it("flags a trailing-slash link in MDX", () => {
    const findings = findTrailingSlashHrefs([
      { file: "content/posts/a.mdx", source: "xem [đây](/bai-viet/abc/) nhé\n[ok](/bai-viet/abc)" },
    ]);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain("content/posts/a.mdx:1");
  });

  it("finds no trailing-slash internal hrefs in the live repo", () => {
    const files: ScanFile[] = [
      ...SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d))),
      ...walk(path.join(ROOT, "content/posts")),
    ].map((full) => ({
      file: path.relative(ROOT, full),
      source: readFileSync(full, "utf8"),
    }));
    expect(findTrailingSlashHrefs(files)).toEqual([]);
  });
});
