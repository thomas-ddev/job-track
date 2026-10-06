import { PrismaClient } from "@/generated/prisma";

// En développement, Next.js recharge les modules à chaud à chaque changement
// de fichier. Sans cette précaution, chaque rechargement recréerait un nouveau
// PrismaClient et donc un nouveau pool de connexions MySQL, jusqu'à épuiser
// les connexions disponibles. On réutilise donc une instance unique stockée
// sur l'objet global, qui survit au rechargement des modules.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
