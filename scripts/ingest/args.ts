/**
 * CLI argument parser — F0012 (US00121).
 *
 * Hand-rolled minimal `--key=value` / `--flag` parser (decision D10). The
 * flag surface is tiny and fixed; a dependency (yargs/commander) is
 * overkill for a dev tool and adds supply-chain surface.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface IngestArgs {
  category: string;
  source: string;
  dryRun: boolean;
  /** `--source=scrape` (US00124): search keyword to filter deals by. */
  query?: string;
  /** `--source=scrape` (US00124): cap on accepted candidates. */
  count?: number;
  /** `--source=scrape` (US00124): which `data/deals/<date>.json` to read; defaults to today. */
  date?: string;
  /** Source-specific `--key=value` flags passed through untouched (e.g. `--path`). */
  rest: Record<string, string>;
}

export function parseIngestArgs(argv: string[]): IngestArgs {
  let category: string | undefined;
  let source: string | undefined;
  let dryRun = false;
  let query: string | undefined;
  let count: number | undefined;
  let date: string | undefined;
  const rest: Record<string, string> = {};

  for (const token of argv) {
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected positional argument: "${token}".`);
    }

    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }

    const eq = token.indexOf("=");
    if (eq === -1) {
      throw new Error(`Unknown flag: "${token}" (expected "--key=value" or "--dry-run").`);
    }

    const key = token.slice(2, eq);
    const value = token.slice(eq + 1);

    if (key === "category") {
      category = value;
    } else if (key === "source") {
      source = value;
    } else if (key === "query") {
      query = value;
    } else if (key === "count") {
      const n = Number(value);
      if (!Number.isInteger(n) || n <= 0) {
        throw new Error(`Invalid value for "--count": "${value}" (expected a positive integer).`);
      }
      count = n;
    } else if (key === "date") {
      if (!DATE_RE.test(value)) {
        throw new Error(`Invalid value for "--date": "${value}" (expected "YYYY-MM-DD").`);
      }
      date = value;
    } else {
      rest[key] = value;
    }
  }

  if (!category) {
    throw new Error('Missing required flag: "--category=<slug>".');
  }
  if (!source) {
    throw new Error('Missing required flag: "--source=<name>".');
  }

  return { category, source, dryRun, query, count, date, rest };
}
