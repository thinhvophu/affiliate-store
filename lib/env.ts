function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Environment variable ${name} is required but was not set.\n` +
        `Add it to .env.local or your hosting provider's environment settings.`,
    );
  }
  return value;
}

function requireUrl(name: string): string {
  const value = requireEnvVar(name);
  try {
    new URL(value);
  } catch {
    throw new Error(
      `Environment variable ${name} must be a valid URL.\nReceived: "${value}"`,
    );
  }
  return value;
}

function optionalEnvVar(name: string): string | undefined {
  const value = process.env[name];
  return value || undefined;
}

export const env = {
  NEXT_PUBLIC_SITE_URL: requireUrl("NEXT_PUBLIC_SITE_URL"),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optionalEnvVar("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
} as const;

export type Env = typeof env;
