"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { generateApiToken, hashApiToken } from "@/lib/api-token";

// Le jeton en clair n'est retourné qu'ici, au moment de sa génération : seul
// son hash bcrypt est conservé en base (src/lib/api-token.ts), exactement
// comme un mot de passe. Regénérer invalide l'ancien jeton (un seul actif à
// la fois par utilisateur).
export async function generateApiTokenAction(): Promise<{ token: string }> {
  const { userId } = await verifySession();

  const token = generateApiToken(userId);
  const apiTokenHash = await hashApiToken(token);

  await db.user.update({ where: { id: userId }, data: { apiTokenHash } });
  revalidatePath("/settings");

  return { token };
}

export async function revokeApiTokenAction(): Promise<void> {
  const { userId } = await verifySession();

  await db.user.update({ where: { id: userId }, data: { apiTokenHash: null } });
  revalidatePath("/settings");
}
