import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.e2e.ts",
  use: {
    baseURL: "http://127.0.0.1:4322",
    viewport: { width: 1440, height: 1000 },
    channel: process.env.PLAYWRIGHT_CHANNEL,
  },
  webServer: {
    command: "pnpm exec astro preview --host 127.0.0.1 --port 4322",
    url: "http://127.0.0.1:4322",
    timeout: 30000,
  },
});
