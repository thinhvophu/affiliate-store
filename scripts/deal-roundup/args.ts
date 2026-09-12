/**
 * CLI argument parser — F0015 (US00146).
 *
 * Hand-rolled `--key=value` / `--flag` parser, same shape as
 * `scripts/ingest/args.ts` — no `commander`/`yargs` dependency.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_TOP = 5;
const MIN_TOP = 1;
const MAX_TOP = 10;

export interface DealRoundupArgs {
  category: string;
  query: string;
  top: number;
  date?: string;
  dryRun: boolean;
}

export function parseDealRoundupArgs(argv: string[]): DealRoundupArgs {
  let category: string | undefined;
  let query: string | undefined;
  let top: number | undefined;
  let date: string | undefined;
  let dryRun = false;

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
    } else if (key === "query") {
      query = value;
    } else if (key === "top") {
      const n = Number(value);
      if (!Number.isInteger(n) || n < MIN_TOP || n > MAX_TOP) {
        throw new Error(
          `Invalid value for "--top": "${value}" (expected an integer between ${MIN_TOP} and ${MAX_TOP}).`,
        );
      }
      top = n;
    } else if (key === "date") {
      if (!DATE_RE.test(value)) {
        throw new Error(`Invalid value for "--date": "${value}" (expected "YYYY-MM-DD").`);
      }
      date = value;
    } else {
      throw new Error(`Unknown flag: "--${key}".`);
    }
  }

  if (!category) {
    throw new Error('Missing required flag: "--category=<slug>".');
  }
  if (!query) {
    throw new Error('Missing required flag: "--query=<term>".');
  }

  return { category, query, top: top ?? DEFAULT_TOP, date, dryRun };
}
