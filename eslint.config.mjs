import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  {
    rules: {
      // Le cahier des charges interdit `any` explicite : on le fait respecter par le lint,
      // pas seulement par une convention d'équipe.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Code généré par Prisma : jamais écrit à la main, jamais linté.
    "src/generated/**",
    // Extension navigateur autonome (WebExtensions API globale `browser`),
    // hors du projet Next.js : pas les mêmes règles.
    "extension/**",
  ]),
]);

export default eslintConfig;
