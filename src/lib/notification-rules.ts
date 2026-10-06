// Fonctions pures (aucun accès base de données) qui décident si une
// notification navigateur doit être proposée — voir
// src/components/notifications/browser-notification-manager.tsx pour la
// partie qui les déclenche réellement (Notification API, limitée au
// navigateur ouvert, pas de vraie Web Push).

export const FOLLOW_UP_NUDGE_THRESHOLD_DAYS = 7;
export const NEW_APPLICATION_NUDGE_THRESHOLD_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Pas de nudge pour un compte sans aucune candidature : la page Tableau de
// bord a déjà son propre message d'accueil pour ce cas, pas besoin d'une
// notification en plus dès la première visite.
export function shouldNudgeNewApplications(
  lastApplicationCreatedAt: Date | null,
  now: Date,
): boolean {
  if (!lastApplicationCreatedAt) return false;
  const daysSince = (now.getTime() - lastApplicationCreatedAt.getTime()) / MS_PER_DAY;
  return daysSince >= NEW_APPLICATION_NUDGE_THRESHOLD_DAYS;
}

export function shouldNudgeFollowUp(staleAppliedCount: number): boolean {
  return staleAppliedCount > 0;
}

export function buildNewApplicationsNudgeMessage(): string {
  return "Aucune nouvelle candidature cette semaine : un petit coup de boost ?";
}

export function buildFollowUpNudgeMessage(staleAppliedCount: number): string {
  return staleAppliedCount === 1
    ? "1 candidature envoyée attend une relance depuis plus d'une semaine."
    : `${staleAppliedCount} candidatures envoyées attendent une relance depuis plus d'une semaine.`;
}
