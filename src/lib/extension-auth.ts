import "server-only";

import { db } from "@/lib/db";
import { extractUserIdFromToken, verifyApiToken } from "@/lib/api-token";

// Authentifie une requête de l'extension navigateur via son en-tête
// `Authorization: Bearer <jeton>` (pas de cookie de session : l'extension
// tourne hors du contexte du navigateur connecté à l'app, voir
// src/app/api/extension/extract/route.ts).
export async function authenticateApiToken(request: Request): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const userId = extractUserIdFromToken(token);
  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { apiTokenHash: true },
  });
  if (!user?.apiTokenHash) {
    return null;
  }

  const valid = await verifyApiToken(token, user.apiTokenHash);
  return valid ? { userId } : null;
}
