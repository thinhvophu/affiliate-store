import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    env: {
      NEXT_PUBLIC_SITE_URL: "https://example.com",
    },
  },
});
