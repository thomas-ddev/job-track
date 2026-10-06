import { defineConfig, devices } from "@playwright/test";

// Un seul test E2E pour cette phase (voir e2e/kanban-flow.spec.ts) : le
// parcours critique connexion -> création -> déplacement Kanban. `webServer`
// démarre automatiquement `next dev` avant les tests (et réutilise un
// serveur déjà lancé en local, pratique en développement) plutôt que
// d'exiger de lancer l'application manuellement avant chaque run.
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: false,
  retries: 0,
  // "list" pour la sortie console locale, "html" (jamais ouvert
  // automatiquement) pour avoir un rapport exploitable en CI en cas d'échec
  // (voir .github/workflows/ci.yml, qui publie playwright-report/ en artefact).
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
