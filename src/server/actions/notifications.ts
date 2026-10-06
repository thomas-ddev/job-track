"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";

// Marque une notification comme lue. Revérifie la propriété avant toute
// écriture, comme chaque mutation de l'application (voir
// src/server/actions/applications.ts) : l'id transmis par le client n'est
// jamais traité comme fiable.
export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const { userId } = await verifySession();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;

  const existing = await db.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return;

  await db.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const { userId } = await verifySession();

  await db.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  revalidatePath("/", "layout");
}
