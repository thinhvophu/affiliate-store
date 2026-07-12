/**
 * CLI argument parser — F0012 (US00121).
 *
 * Hand-rolled minimal `--key=value` / `--flag` parser (decision D10). The
 * flag surface is tiny and fixed; a dependency (yargs/commander) is
 * overkill for a dev tool and adds supply-chain surface.
 */

export interface IngestArgs {
  category: string;
  source: string;
  dryRun: boolean;
  /** Source-specific `--key=value` flags passed through untouched (e.g. `--path`). */
  rest: Record<string, string>;
}

export function parseIngestArgs(argv: string[]): IngestArgs {
  let category: string | undefined;
  let source: string | undefined;
  let dryRun = false;
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

  return { category, source, dryRun, rest };
}
