import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const frontendRoot = fileURLToPath(new URL(".", import.meta.url));
const backendPort = 18237;
const frontendPort = 15173;
const databaseEngine = process.env.DJANGO_DB_ENGINE ?? "sqlite";
const databaseEnv: Record<string, string> = databaseEngine === "sqlite"
  ? { SQLITE_DB_PATH: path.join(os.tmpdir(), `notara-playwright-e2e-${process.pid}.sqlite3`) }
  : {
      POSTGRES_DB: process.env.POSTGRES_DB ?? "notara_e2e",
      POSTGRES_USER: process.env.POSTGRES_USER ?? "notara",
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ?? "notara",
      POSTGRES_HOST: process.env.POSTGRES_HOST ?? "127.0.0.1",
      POSTGRES_PORT: process.env.POSTGRES_PORT ?? "5432",
    };

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL: `http://localhost:${frontendPort}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `python backend/manage.py migrate && python backend/manage.py runserver 0.0.0.0:${backendPort}`,
      cwd: repoRoot,
      url: `http://127.0.0.1:${backendPort}/api/v1/csrf/`,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        DJANGO_DB_ENGINE: databaseEngine,
        ...databaseEnv,
        DJANGO_CSRF_TRUSTED_ORIGINS: `http://localhost:${frontendPort},http://127.0.0.1:${frontendPort}`,
      },
    },
    {
      command: `npm run dev -- --host 0.0.0.0 --port ${frontendPort}`,
      cwd: frontendRoot,
      url: `http://127.0.0.1:${frontendPort}`,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        PORT: String(frontendPort),
        VITE_API_PROXY_TARGET: `http://127.0.0.1:${backendPort}`,
      },
    },
  ],
});
