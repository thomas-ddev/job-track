import "server-only";

import { db } from "@/lib/db";

export async function hasApiToken(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { apiTokenHash: true },
  });
  return user?.apiTokenHash != null;
}
