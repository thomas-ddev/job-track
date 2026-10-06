import { ApplicationStatus } from "@/generated/prisma";

// Fonction pure (aucun accès base de données) : même logique que src/lib/stats.ts
// — testable unitairement (phase 7) sans simuler Prisma.

export const REMINDER_THRESHOLD_DAYS = 10;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type ApplicationForReminder = {
  id: string;
  status: ApplicationStatus;
  // Date du dernier événement d'historique marquant le passage au statut
  // "Envoyée" (toStatus = APPLIED). C'est ce qui définit "sans nouvelles
  // depuis X jours" : le compteur repart de zéro si la candidature quitte
  // puis revient au statut "Envoyée".
  lastAppliedAt: Date;
};

// Une candidature doit être relancée si elle est toujours au statut
// "Envoyée" et que ce statut date de plus de `thresholdDays` jours.
export function needsReminder(
  application: ApplicationForReminder,
  now: Date,
  thresholdDays: number = REMINDER_THRESHOLD_DAYS,
): boolean {
  if (application.status !== ApplicationStatus.APPLIED) return false;
  const daysSinceApplied = (now.getTime() - application.lastAppliedAt.getTime()) / MS_PER_DAY;
  return daysSinceApplied >= thresholdDays;
}

export function selectApplicationsNeedingReminder(
  applications: ApplicationForReminder[],
  now: Date,
  thresholdDays: number = REMINDER_THRESHOLD_DAYS,
): ApplicationForReminder[] {
  return applications.filter((application) => needsReminder(application, now, thresholdDays));
}

export function buildReminderMessage(company: string, position: string): string {
  return `Toujours sans nouvelles de ${company} pour le poste de ${position} — pensez à relancer.`;
}
