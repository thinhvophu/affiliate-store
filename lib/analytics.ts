import { env } from "@/lib/env";

/** GA4 measurement IDs are `G-` followed by an alphanumeric property token. */
const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,}$/;

/**
 * The one place that decides whether GA4 is active.
 *
 * SERVER-ONLY. `lib/env.ts` reads `process.env[name]` with a dynamic key, which
 * Next.js does NOT inline into the client bundle (see the env-var guide,
 * "dynamic lookups will not be inlined"). Call this from a Server Component and
 * pass the result down as a prop — never import it into a "use client" module.
 *
 * Returns undefined when analytics must not load: no ID configured, or any
 * non-production NODE_ENV (US00143 Scenario 3 — local browsing must never
 * pollute production data).
 *
 * Throws when an ID is set but malformed: that is a deployment misconfiguration
 * worth failing the build over, and it also closes the injection vector for the
 * value interpolated into the inline <Script> below.
 */
export function resolveGaMeasurementId(): string | undefined {
  const id = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return undefined;
  if (!GA_MEASUREMENT_ID_PATTERN.test(id)) {
    throw new Error(
      `NEXT_PUBLIC_GA_MEASUREMENT_ID must look like "G-XXXXXXXXXX". Received: "${id}"`,
    );
  }
  if (process.env.NODE_ENV !== "production") return undefined;
  return id;
}
