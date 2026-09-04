import { afterEach, describe, expect, it, vi } from "vitest";

async function resolveWith(env: { NEXT_PUBLIC_GA_MEASUREMENT_ID?: string; NODE_ENV?: string }) {
  if (env.NEXT_PUBLIC_GA_MEASUREMENT_ID !== undefined) {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  }
  if (env.NODE_ENV !== undefined) {
    vi.stubEnv("NODE_ENV", env.NODE_ENV);
  }
  vi.resetModules();
  const { resolveGaMeasurementId } = await import("@/lib/analytics");
  return resolveGaMeasurementId();
}

describe("resolveGaMeasurementId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns undefined when the ID is unset, even in production", async () => {
    const result = await resolveWith({ NODE_ENV: "production" });
    expect(result).toBeUndefined();
  });

  it("returns undefined when the ID is an empty string, even in production", async () => {
    const result = await resolveWith({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
      NODE_ENV: "production",
    });
    expect(result).toBeUndefined();
  });

  it("returns the ID when set and NODE_ENV is production", async () => {
    const result = await resolveWith({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC1234567",
      NODE_ENV: "production",
    });
    expect(result).toBe("G-ABC1234567");
  });

  it("returns undefined in development even when the ID is set", async () => {
    const result = await resolveWith({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC1234567",
      NODE_ENV: "development",
    });
    expect(result).toBeUndefined();
  });

  it("returns undefined in test even when the ID is set", async () => {
    const result = await resolveWith({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC1234567",
      NODE_ENV: "test",
    });
    expect(result).toBeUndefined();
  });

  it("throws when the ID is malformed, regardless of NODE_ENV", async () => {
    await expect(
      resolveWith({
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "not-a-ga-id",
        NODE_ENV: "production",
      }),
    ).rejects.toThrow(/NEXT_PUBLIC_GA_MEASUREMENT_ID/);
  });

  it("throws on an injection attempt disguised as a measurement ID", async () => {
    await expect(
      resolveWith({
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC'});alert(1);//",
        NODE_ENV: "production",
      }),
    ).rejects.toThrow(/NEXT_PUBLIC_GA_MEASUREMENT_ID/);
  });
});
