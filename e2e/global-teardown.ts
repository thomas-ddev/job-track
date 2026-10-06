// Supprime le compte de test E2E et tout ce qu'il contient (cascade) : les
// tests ne doivent pas laisser de données derrière eux dans une base qui peut
// être la même que celle utilisée en développement local.
import { db } from "../src/lib/db";
import { E2E_USER_EMAIL } from "./global-setup";

export default async function globalTeardown() {
  await db.user.deleteMany({ where: { email: E2E_USER_EMAIL } });
  await db.$disconnect();
}
