// Créé un compte dédié aux tests E2E, directement en base (plutôt que via le
// formulaire d'inscription) : le test lui-même couvre déjà le parcours
// "connexion -> création -> Kanban", pas besoin de repasser par l'inscription
// à chaque exécution, et ça isole le test E2E d'une éventuelle régression du
// formulaire d'inscription qui le ferait échouer pour la mauvaise raison.
import bcrypt from "bcryptjs";

import { db } from "../src/lib/db";

export const E2E_USER_EMAIL = "e2e-test@jobtrack.dev";
export const E2E_USER_PASSWORD = "e2e-test-password";

export default async function globalSetup() {
  await db.user.deleteMany({ where: { email: E2E_USER_EMAIL } });
  const passwordHash = await bcrypt.hash(E2E_USER_PASSWORD, 12);
  await db.user.create({
    data: { email: E2E_USER_EMAIL, passwordHash, name: "E2E Test" },
  });
  await db.$disconnect();
}
