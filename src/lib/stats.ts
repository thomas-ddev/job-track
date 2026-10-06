import { ApplicationStatus } from "@/generated/prisma";
import { STATUS_ORDER } from "@/lib/application-status";

// Toutes les fonctions de ce module sont pures (aucun accès base de données,
// aucune dépendance à Next.js) : elles prennent des tableaux de valeurs
// simples en entrée et retournent une valeur calculée. C'est délibéré —
// la logique de calcul des statistiques est testée unitairement (phase 7)
// indépendamment de Prisma, qui n'a besoin d'être simulé nulle part.

const RESPONDED_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
];

export type WeekBucket = {
  weekStart: Date;
  count: number;
};

// Ramène une date au lundi de sa semaine, à minuit local. La semaine
// commence le lundi (convention ISO 8601, usuelle en France) plutôt que le
// dimanche.
export function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfWeek = result.getDay(); // 0 = dimanche, 1 = lundi, ...
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  result.setDate(result.getDate() - diffToMonday);
  return result;
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// Regroupe des dates de création en seaux hebdomadaires, sur les `weeksCount`
// dernières semaines se terminant par la semaine de `referenceDate`. Les
// semaines sans aucune candidature apparaissent avec un compte de 0 — un
// graphique ne doit pas sauter de semaine silencieusement.
export function computeWeeklyApplicationCounts(
  createdAts: Date[],
  weeksCount: number,
  referenceDate: Date,
): WeekBucket[] {
  const currentWeekStart = startOfWeek(referenceDate);
  const firstWeekStart = new Date(currentWeekStart.getTime() - (weeksCount - 1) * MS_PER_WEEK);

  const buckets: WeekBucket[] = Array.from({ length: weeksCount }, (_, index) => ({
    weekStart: new Date(firstWeekStart.getTime() + index * MS_PER_WEEK),
    count: 0,
  }));

  for (const createdAt of createdAts) {
    const bucketStart = startOfWeek(createdAt);
    const weekIndex = Math.round((bucketStart.getTime() - firstWeekStart.getTime()) / MS_PER_WEEK);
    const bucket = weekIndex >= 0 && weekIndex < weeksCount ? buckets[weekIndex] : undefined;
    if (bucket) {
      bucket.count += 1;
    }
  }

  return buckets;
}

// Taux de réponse = part des candidatures effectivement envoyées
// (c'est-à-dire pas encore au statut "À postuler") qui ont obtenu une
// réaction de l'entreprise (entretien, offre ou refus). "À postuler" est
// exclu du dénominateur : on ne peut pas encore attendre de réponse pour une
// candidature qui n'a pas été envoyée.
// Retourne `null` plutôt que 0 quand aucune candidature n'a été envoyée —
// un taux de 0 % et une absence de données n'ont pas la même signification.
export function computeResponseRate(statuses: ApplicationStatus[]): number | null {
  const sent = statuses.filter((status) => status !== ApplicationStatus.TO_APPLY);
  if (sent.length === 0) return null;

  const responded = sent.filter((status) => RESPONDED_STATUSES.includes(status));
  return (responded.length / sent.length) * 100;
}

export type StatusEventLite = {
  applicationId: string;
  toStatus: ApplicationStatus;
  createdAt: Date;
};

// Délai moyen avant réponse, en jours. Pour chaque candidature, on cherche
// l'événement qui marque son envoi (toStatus = APPLIED) puis le premier
// événement suivant qui marque une réaction (entretien, offre ou refus) ;
// le délai est l'écart entre les deux. La moyenne ne porte que sur les
// candidatures qui ont effectivement une réponse — une candidature encore
// "Envoyée" sans suite n'a pas de délai à mesurer, elle est en attente.
export function computeAverageResponseDelayDays(events: StatusEventLite[]): number | null {
  const byApplication = new Map<string, StatusEventLite[]>();
  for (const event of events) {
    const list = byApplication.get(event.applicationId) ?? [];
    list.push(event);
    byApplication.set(event.applicationId, list);
  }

  const delaysInDays: number[] = [];

  for (const applicationEvents of byApplication.values()) {
    const sorted = [...applicationEvents].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    const appliedEvent = sorted.find((event) => event.toStatus === ApplicationStatus.APPLIED);
    if (!appliedEvent) continue;

    const responseEvent = sorted.find(
      (event) =>
        event.createdAt.getTime() > appliedEvent.createdAt.getTime() &&
        RESPONDED_STATUSES.includes(event.toStatus),
    );
    if (!responseEvent) continue;

    const delayMs = responseEvent.createdAt.getTime() - appliedEvent.createdAt.getTime();
    delaysInDays.push(delayMs / (24 * 60 * 60 * 1000));
  }

  if (delaysInDays.length === 0) return null;
  return delaysInDays.reduce((sum, delay) => sum + delay, 0) / delaysInDays.length;
}

// Répartition du nombre de candidatures par statut. Initialise tous les
// statuts à 0 (via STATUS_ORDER) pour qu'un statut sans aucune candidature
// apparaisse bien dans le résultat plutôt que d'être absent de l'objet.
export function computeStatusBreakdown(
  statuses: ApplicationStatus[],
): Record<ApplicationStatus, number> {
  const breakdown = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0])) as Record<
    ApplicationStatus,
    number
  >;
  for (const status of statuses) {
    breakdown[status] += 1;
  }
  return breakdown;
}
