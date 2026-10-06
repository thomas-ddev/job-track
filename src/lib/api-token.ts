import "server-only";
import { randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";

// Le jeton encode l'id utilisateur en clair (préfixe avant le premier ".")
// pour permettre un lookup direct en base (findUnique par id) plutôt que de
// comparer le hash bcrypt contre tous les utilisateurs existants à chaque
// requête de l'extension.
export function generateApiToken(userId: string): string {
  return `${userId}.${randomBytes(24).toString("hex")}`;
}

export function extractUserIdFromToken(token: string): string | null {
  const separatorIndex = token.indexOf(".");
  if (separatorIndex <= 0) return null;
  return token.slice(0, separatorIndex);
}

export async function hashApiToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function verifyApiToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}
