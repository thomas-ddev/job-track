import "server-only";

import { db } from "@/lib/db";

// Toujours scopées par userId : une notification ne doit jamais fuiter vers
// un autre utilisateur que celui auquel elle est destinée (même règle que
// pour les candidatures, voir src/server/data/applications.ts).

export function getUnreadNotificationsForUser(userId: string) {
  return db.notification.findMany({
    where: { userId, read: false },
    orderBy: { createdAt: "desc" },
    include: { application: { select: { id: true, company: true, position: true } } },
  });
}

export function countUnreadNotificationsForUser(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, read: false } });
}
