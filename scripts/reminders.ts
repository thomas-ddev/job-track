// Script de relance (phase 6) — à lancer avec `npm run reminders`.
//
// Détecte les candidatures au statut "Envoyée" sans nouvelles depuis plus de
// REMINDER_THRESHOLD_DAYS jours et crée une notification in-app pour
// l'utilisateur concerné. Pensé pour être exécuté périodiquement (cron,
// tâche planifiée) en dehors du cycle de requêtes Next.js — d'où un script
// Node autonome plutôt qu'une route ou un Server Action.
//
// `--env-file=.env` (voir le script npm "reminders") charge DATABASE_URL :
// contrairement à Next.js, un script Node lancé directement ne lit pas .env
// automatiquement.

import { ApplicationStatus } from "@/generated/prisma";
import { db } from "@/lib/db";
import {
  buildReminderMessage,
  selectApplicationsNeedingReminder,
  type ApplicationForReminder,
} from "@/lib/reminders";

async function main() {
  const now = new Date();

  const sentApplications = await db.application.findMany({
    where: { status: ApplicationStatus.APPLIED },
    select: { id: true, userId: true, company: true, position: true, status: true },
  });

  if (sentApplications.length === 0) {
    console.log('Aucune candidature au statut "Envoyée" — rien à faire.');
    return;
  }

  // Le compteur de "sans nouvelles depuis X jours" repart de zéro à chaque
  // (ré)entrée dans le statut "Envoyée" : on a besoin, pour chaque
  // candidature, de la date du dernier événement d'historique qui y a mené.
  const appliedEvents = await db.statusEvent.findMany({
    where: {
      applicationId: { in: sentApplications.map((application) => application.id) },
      toStatus: ApplicationStatus.APPLIED,
    },
    orderBy: { createdAt: "desc" },
    select: { applicationId: true, createdAt: true },
  });

  const lastAppliedAtByApplicationId = new Map<string, Date>();
  for (const event of appliedEvents) {
    // `appliedEvents` est trié du plus récent au plus ancien : la première
    // occurrence rencontrée pour un applicationId donné est donc la plus
    // récente, les suivantes sont ignorées.
    if (!lastAppliedAtByApplicationId.has(event.applicationId)) {
      lastAppliedAtByApplicationId.set(event.applicationId, event.createdAt);
    }
  }

  const candidates: ApplicationForReminder[] = sentApplications
    .map((application) => {
      const lastAppliedAt = lastAppliedAtByApplicationId.get(application.id);
      return lastAppliedAt
        ? { id: application.id, status: application.status, lastAppliedAt }
        : null;
    })
    .filter((candidate): candidate is ApplicationForReminder => candidate !== null);

  const toRemind = selectApplicationsNeedingReminder(candidates, now);
  const applicationById = new Map(
    sentApplications.map((application) => [application.id, application]),
  );

  let created = 0;
  for (const candidate of toRemind) {
    const application = applicationById.get(candidate.id);
    if (!application) continue;

    // Évite les doublons : si une notification existe déjà pour cette
    // candidature depuis son dernier passage au statut "Envoyée", on ne la
    // recrée pas à chaque exécution du script (ex. cron quotidien).
    const alreadyNotified = await db.notification.findFirst({
      where: {
        applicationId: application.id,
        createdAt: { gte: candidate.lastAppliedAt },
      },
      select: { id: true },
    });
    if (alreadyNotified) continue;

    await db.notification.create({
      data: {
        userId: application.userId,
        applicationId: application.id,
        message: buildReminderMessage(application.company, application.position),
      },
    });
    created += 1;
  }

  console.log(
    `${candidates.length} candidature(s) "Envoyée" examinée(s), ${toRemind.length} au-delà du délai de relance, ${created} notification(s) créée(s).`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Échec du script de relance :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
