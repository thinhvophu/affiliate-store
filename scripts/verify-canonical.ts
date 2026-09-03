/**
 * Deployment canonical-URL verifier — F0013 (US00135, decisions D3–D7).
 *
 * Fetches a deployed site's `/sitemap.xml` + `/robots.txt`, dynamically
 * samples one product, one post and one category URL from the sitemap (D5 —
 * hardcoded slugs would rot as soon as a product is renamed), and asserts no
 * absolute URL in any fetched artefact — sitemap `<loc>`, page
 * `<link rel="canonical">`, `og:url`, or any `url`/`@id`/`image` string
 * inside a `application/ld+json` block — falls outside the given `--base`,
 * and that the literal substring "example.com" appears nowhere (catches a
 * markup-shape variant a regex might miss, per D3/R3).
 *
 * Run via `npm run verify:canonical -- --base=https://<domain>`.
 */

export interface Finding {
  artefact: string;
  message: string;
}

export interface VerifyResult {
  ok: boolean;
  findings: Finding[];
  checked: string[];
}

const PLACEHOLDER_HOST_RE = /example\.com/i;

export function normalizeBase(raw: string | undefined): string {
  if (!raw) {
    throw new Error('Missing required flag: "--base=<url>".');
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Invalid --base URL: "${raw}"`);
  }
  if (!/^https?:$/.test(url.protocol)) {
    throw new Error(`--base must use http or https, got: "${raw}"`);
  }
  return url.origin;
}

function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function extractCanonical(html: string): string | undefined {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
}

function extractOgUrl(html: string): string | undefined {
  return html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1];
}

function extractJsonLdBlocks(html: string): string[] {
  return [
    ...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ].map((m) => m[1]);
}

function collectUrlLikeFields(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const v of value) collectUrlLikeFields(v, found);
  } else if (value && typeof value === "object") {
    for (const [key, val] of Object.entries(value)) {
      if ((key === "url" || key === "@id" || key === "image") && typeof val === "string") {
        found.push(val);
      } else {
        collectUrlLikeFields(val, found);
      }
    }
  }
  return found;
}

interface SampledPage {
  loc: string;
  path: string;
}

function pickSample(locs: string[], segment: string): SampledPage | undefined {
  const re = new RegExp(`/${segment}/[^/]+/?$`);
  const loc = locs.find((l) => re.test(l));
  if (!loc) return undefined;
  try {
    return { loc, path: new URL(loc).pathname };
  } catch {
    return { loc, path: loc };
  }
}

const SAMPLE_SEGMENTS: ReadonlyArray<readonly [label: string, segment: string]> = [
  ["product", "san-pham"],
  ["post", "bai-viet"],
  ["category", "danh-muc"],
];

export async function verifyCanonical(
  rawBase: string,
  fetchImpl: typeof fetch = fetch,
): Promise<VerifyResult> {
  const base = normalizeBase(rawBase);
  const findings: Finding[] = [];
  const checked: string[] = [];

  async function fetchText(pathname: string): Promise<string> {
    const res = await fetchImpl(`${base}${pathname}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${base}${pathname}: HTTP ${res.status}`);
    }
    return res.text();
  }

  function checkNoPlaceholder(artefact: string, body: string): void {
    checked.push(artefact);
    if (PLACEHOLDER_HOST_RE.test(body)) {
      findings.push({ artefact, message: 'contains the literal substring "example.com"' });
    }
  }

  function checkAbsoluteUrl(artefact: string, url: string): void {
    checked.push(artefact);
    if (/^https?:\/\//.test(url) && !url.startsWith(base)) {
      findings.push({ artefact, message: `"${url}" does not start with base "${base}"` });
    }
  }

  const sitemapXml = await fetchText("/sitemap.xml");
  checkNoPlaceholder("sitemap.xml", sitemapXml);
  const locs = extractLocs(sitemapXml);

  const robotsTxt = await fetchText("/robots.txt");
  checkNoPlaceholder("robots.txt", robotsTxt);

  for (const [label, segment] of SAMPLE_SEGMENTS) {
    const sample = pickSample(locs, segment);
    if (!sample) {
      const artefact = `sitemap.xml (${label} sample)`;
      checked.push(artefact);
      findings.push({ artefact, message: `no ${label} URL found in sitemap.xml to sample` });
      continue;
    }

    checkAbsoluteUrl(`sitemap.xml <loc> (${label})`, sample.loc);

    const html = await fetchText(sample.path);
    checkNoPlaceholder(`${label} page (${sample.path})`, html);

    const canonical = extractCanonical(html);
    if (canonical) {
      checkAbsoluteUrl(`${label} canonical`, canonical);
    } else {
      checked.push(`${label} canonical`);
      findings.push({
        artefact: `${label} canonical`,
        message: '<link rel="canonical"> not found in page',
      });
    }

    const ogUrl = extractOgUrl(html);
    if (ogUrl) {
      checkAbsoluteUrl(`${label} og:url`, ogUrl);
    } else {
      checked.push(`${label} og:url`);
      findings.push({
        artefact: `${label} og:url`,
        message: '<meta property="og:url"> not found in page',
      });
    }

    const jsonLdBlocks = extractJsonLdBlocks(html);
    if (jsonLdBlocks.length === 0) {
      checked.push(`${label} JSON-LD`);
      findings.push({
        artefact: `${label} JSON-LD`,
        message: "no application/ld+json block found",
      });
    }
    for (const block of jsonLdBlocks) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(block);
      } catch {
        checked.push(`${label} JSON-LD`);
        findings.push({ artefact: `${label} JSON-LD`, message: "block is not valid JSON" });
        continue;
      }
      for (const url of collectUrlLikeFields(parsed)) {
        checkAbsoluteUrl(`${label} JSON-LD url/@id/image`, url);
      }
    }
  }

  return { ok: findings.length === 0, findings, checked };
}

function printReport(base: string, result: VerifyResult): void {
  console.log(`Verifying canonical URLs against ${base}\n`);
  const failedArtefacts = new Set(result.findings.map((f) => f.artefact));
  for (const artefact of new Set(result.checked)) {
    console.log(`${failedArtefacts.has(artefact) ? "FAIL" : "PASS"}  ${artefact}`);
  }
  if (result.findings.length > 0) {
    console.log("\nFailures:");
    for (const f of result.findings) {
      console.log(`  - ${f.artefact}: ${f.message}`);
    }
  } else {
    console.log("\nAll checks passed — no placeholder or off-host URLs found.");
  }
}

function parseArgs(argv: string[]): string | undefined {
  for (const token of argv) {
    if (token.startsWith("--base=")) return token.slice("--base=".length);
  }
  return undefined;
}

async function main(): Promise<void> {
  const base = normalizeBase(parseArgs(process.argv.slice(2)));
  const result = await verifyCanonical(base);
  printReport(base, result);
  if (!result.ok) process.exitCode = 1;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  });
}
