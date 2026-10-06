import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Pas de plugin React / environnement jsdom : les tests unitaires de cette
// phase ciblent uniquement la logique métier pure (src/lib), pas les
// composants. tsconfigPaths résout l'alias "@/*" défini dans tsconfig.json.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
