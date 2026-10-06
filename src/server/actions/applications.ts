"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { applicationDatesSchema, applicationSchema } from "@/schemas/application";
import { ApplicationStatus, type Prisma } from "@/generated/prisma";

export type ApplicationFormState =
  | {
      errors?: {
        company?: string[];
        position?: string[];
        jobUrl?: string[];
        salary?: string[];
        contactEmail?: string[];
        status?: string[];
        createdAt?: string[];
        statusChangedAt?: string[];
      };
      message?: string;
    }
  | undefined;

// Déduplique les noms de technologies de façon insensible à la casse (la
// collation utf8mb4_unicode_ci de la base fait déjà ce travail pour la
// contrainte d'unicité, mais dédupliquer ici évite deux upserts concurrents
// sur un nom "équivalent" dans la même requête).
function dedupeTechnologyNames(names: string[]): string[] {
  const byLowerCase = new Map<string, string>();
  for (const name of names) {
    byLowerCase.set(name.toLowerCase(), name);
  }
  return Array.from(byLowerCase.values());
}

export async function upsertTechnologyIds(
  tx: Prisma.TransactionClient,
  names: string[],
): Promise<string[]> {
  const ids: string[] = [];
  // Upserts volontairement séquentiels (pas de Promise.all) : exécuter les
  // upserts du même lot en parallèle dans une transaction pourrait créer deux
  // fois une technologie dont les noms ne diffèrent que par la casse avant
  // que la contrainte d'unicité n'ait pu s'appliquer.
  for (const name of dedupeTechnologyNames(names)) {
    const technology = await tx.technology.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    ids.push(technology.id);
  }
  return ids;
}

export async function createApplicationAction(
  _prevState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const { userId } = await verifySession();

  const validated = applicationSchema.safeParse({
    company: formData.get("company"),
    position: formData.get("position"),
    jobUrl: formData.get("jobUrl"),
    salary: formData.get("salary"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    notes: formData.get("notes"),
    status: formData.get("status"),
    technologies: formData.get("technologies"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const data = validated.data;

  const application = await db.$transaction(async (tx) => {
    const technologyIds = await upsertTechnologyIds(tx, data.technologies);

    const created = await tx.application.create({
      data: {
        userId,
        company: data.company,
        position: data.position,
        jobUrl: data.jobUrl,
        salary: data.salary,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        notes: data.notes,
        status: data.status,
        technologies: {
          create: technologyIds.map((technologyId) => ({ technologyId })),
        },
      },
    });

    // Premier événement de l'historique : fromStatus reste null, il n'y a
    // pas de statut "précédent" à la création.
    await tx.statusEvent.create({
      data: { applicationId: created.id, fromStatus: null, toStatus: created.status },
    });

    return created;
  });

  revalidatePath("/applications");
  redirect(`/applications/${application.id}?created=1`);
}

export async function updateApplicationAction(
  _prevState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const { userId } = await verifySession();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    notFound();
  }

  // Vérification de propriété : on ne fait confiance ni à l'ID transmis ni à
  // une éventuelle route déjà filtrée côté UI, on revérifie ici que la
  // candidature appartient bien à l'utilisateur authentifié avant toute
  // écriture.
  const existing = await db.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    notFound();
  }

  const validated = applicationSchema.safeParse({
    company: formData.get("company"),
    position: formData.get("position"),
    jobUrl: formData.get("jobUrl"),
    salary: formData.get("salary"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    notes: formData.get("notes"),
    status: formData.get("status"),
    technologies: formData.get("technologies"),
  });

  // Dates de candidature/relance : validées séparément (voir
  // src/schemas/application.ts) puisque createApplicationAction, qui
  // partage applicationSchema, ne les reçoit jamais.
  const validatedDates = applicationDatesSchema.safeParse({
    createdAt: formData.get("createdAt"),
    statusChangedAt: formData.get("statusChangedAt"),
  });

  if (!validated.success || !validatedDates.success) {
    return {
      errors: {
        ...(validated.success ? {} : validated.error.flatten().fieldErrors),
        ...(validatedDates.success ? {} : validatedDates.error.flatten().fieldErrors),
      },
    };
  }

  const data = validated.data;
  const statusChanged = data.status !== existing.status;

  await db.$transaction(async (tx) => {
    const technologyIds = await upsertTechnologyIds(tx, data.technologies);

    await tx.application.update({
      where: { id },
      data: {
        company: data.company,
        position: data.position,
        jobUrl: data.jobUrl,
        salary: data.salary,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        notes: data.notes,
        status: data.status,
        createdAt: validatedDates.data.createdAt,
        // Champ désormais directement éditable (contrairement au Kanban, qui
        // n'a pas de sélecteur de date et continue de le faire automatiquement
        // — voir changeApplicationStatusAction) : on prend la valeur soumise
        // telle quelle, sans bump automatique implicite qui l'écraserait.
        statusChangedAt: validatedDates.data.statusChangedAt,
        technologies: {
          deleteMany: {},
          create: technologyIds.map((technologyId) => ({ technologyId })),
        },
      },
    });

    if (statusChanged) {
      await tx.statusEvent.create({
        data: { applicationId: id, fromStatus: existing.status, toStatus: data.status },
      });
    }
  });

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  redirect(`/applications/${id}?saved=1`);
}

// Utilisée par le Kanban (phase 4) comme par un futur changement de statut
// rapide depuis la fiche détaillée : ne touche qu'au statut, pas aux autres
// champs, et journalise systématiquement l'événement.
export async function changeApplicationStatusAction(
  applicationId: string,
  nextStatus: ApplicationStatus,
): Promise<{ error?: string }> {
  const { userId } = await verifySession();

  const existing = await db.application.findUnique({ where: { id: applicationId } });
  if (!existing || existing.userId !== userId) {
    return { error: "Candidature introuvable." };
  }

  if (existing.status === nextStatus) {
    return {};
  }

  await db.$transaction([
    db.application.update({
      where: { id: applicationId },
      data: { status: nextStatus, statusChangedAt: new Date() },
    }),
    db.statusEvent.create({
      data: { applicationId, fromStatus: existing.status, toStatus: nextStatus },
    }),
  ]);

  revalidatePath("/applications");
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/dashboard");

  return {};
}

export async function deleteApplicationAction(formData: FormData): Promise<void> {
  const { userId } = await verifySession();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    notFound();
  }

  const existing = await db.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    notFound();
  }

  await db.application.delete({ where: { id } });

  revalidatePath("/applications");
  redirect("/applications");
}

const AUTO_REJECT_THRESHOLD_DAYS = 30;

// Balayage "paresseux" (pas de cron) : une candidature "Envoyée" sans le
// moindre changement de statut depuis plus de 30 jours est considérée comme
// n'ayant pas eu de suite et passe automatiquement à "Refusée". Appelée
// depuis le layout du groupe (app) (voir src/app/(app)/layout.tsx), donc
// évaluée à chaque navigation plutôt que sur une tâche planifiée — dans
// l'esprit du reste du projet, qui évite l'infra supplémentaire quand une
// vérification au chargement suffit. `autoRejected: true` permet de
// distinguer ce passage automatique d'un vrai refus pour ne pas gonfler le
// taux de réponse (voir src/server/data/stats.ts).
export async function autoRejectStaleApplications(userId: string): Promise<void> {
  const cutoff = new Date(Date.now() - AUTO_REJECT_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

  const stale = await db.application.findMany({
    where: { userId, status: ApplicationStatus.APPLIED, statusChangedAt: { lt: cutoff } },
    select: { id: true },
  });
  if (stale.length === 0) return;

  const ids = stale.map((application) => application.id);
  const now = new Date();

  await db.$transaction([
    db.application.updateMany({
      where: { id: { in: ids } },
      data: { status: ApplicationStatus.REJECTED, statusChangedAt: now, autoRejected: true },
    }),
    db.statusEvent.createMany({
      data: ids.map((applicationId) => ({
        applicationId,
        fromStatus: ApplicationStatus.APPLIED,
        toStatus: ApplicationStatus.REJECTED,
        createdAt: now,
      })),
    }),
  ]);
}
