import "server-only";

import { db } from "@/lib/db";
import {
  computeAverageResponseDelayDays,
  computeResponseRate,
  computeStatusBreakdown,
  computeWeeklyApplicationCounts,
} from "@/lib/stats";
import { FOLLOW_UP_NUDGE_THRESHOLD_DAYS } from "@/lib/notification-rules";
import { ApplicationStatus } from "@/generated/prisma";

const WEEKS_IN_DASHBOARD = 8;

export async function getDashboardStats(userId: string) {
  const [applications, statusEvents] = await Promise.all([
    db.application.findMany({
      where: { userId },
      select: { status: true, createdAt: true, autoRejected: true },
    }),
    db.statusEvent.findMany({
      where: { application: { userId } },
      select: { applicationId: true, toStatus: true, createdAt: true },
    }),
  ]);

  return {
    weekly: computeWeeklyApplicationCounts(
      applications.map((a) => a.createdAt),
      WEEKS_IN_DASHBOARD,
      new Date(),
    ),
    // Un refus automatique (30 jours sans réponse, voir
    // autoRejectStaleApplications) n'est pas une vraie réponse de
    // l'entreprise : on l'exclut du calcul pour ne pas gonfler le taux.
    responseRate: computeResponseRate(
      applications.filter((a) => !a.autoRejected).map((a) => a.status),
    ),
    averageResponseDelayDays: computeAverageResponseDelayDays(statusEvents),
    statusBreakdown: computeStatusBreakdown(applications.map((a) => a.status)),
    totalApplications: applications.length,
  };
}

export type NotificationSignals = {
  lastApplicationCreatedAt: Date | null;
  staleAppliedCount: number;
};

// Alimente browser-notification-manager.tsx (voir src/lib/notification-rules.ts
// pour les règles pures qui décident, à partir de ces chiffres, si une
// notification doit effectivement être proposée).
export async function getNotificationSignals(userId: string): Promise<NotificationSignals> {
  const cutoff = new Date(Date.now() - FOLLOW_UP_NUDGE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

  const [lastApplication, staleAppliedCount] = await Promise.all([
    db.application.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    db.application.count({
      where: { userId, status: ApplicationStatus.APPLIED, statusChangedAt: { lt: cutoff } },
    }),
  ]);

  return {
    lastApplicationCreatedAt: lastApplication?.createdAt ?? null,
    staleAppliedCount,
  };
}
