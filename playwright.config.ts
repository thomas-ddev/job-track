import { defineConfig, devices } from "@playwright/test";

// `webServer` démarre automatiquement l'application avant les tests (et
// réutilise un serveur déjà lancé en local, pratique en développement)
// plutôt que d'exiger de lancer l'application manuellement avant chaque run.
//
// En CI, on build puis on sert le build de production plutôt que `next dev` :
// le serveur de développement de Next.js (Turbopack, recompilation à la
// volée au fil des requêtes du test) s'est révélé sujet à des plantages
// internes ("turbo-tasks: an internal panic occurred") qui tuent le process
// en cours de test — un problème d'outillage de développement, pas de
// l'application, qui disparaît avec un serveur de production figé. En local,
// `next dev` reste plus pratique (pas de build à attendre à chaque run).
const useProductionServer = Boolean(process.env.CI);

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
    command: useProductionServer ? "npm run build && npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !useProductionServer,
    timeout: useProductionServer ? 180_000 : 60_000,
  },
});
