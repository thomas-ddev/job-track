import "server-only";

import { db } from "@/lib/db";
import {
  computeAverageResponseDelayDays,
  computeResponseRate,
  computeStatusBreakdown,
  computeWeeklyApplicationCounts,
} from "@/lib/stats";

const WEEKS_IN_DASHBOARD = 8;

export async function getDashboardStats(userId: string) {
  const [applications, statusEvents] = await Promise.all([
    db.application.findMany({
      where: { userId },
      select: { status: true, createdAt: true },
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
    responseRate: computeResponseRate(applications.map((a) => a.status)),
    averageResponseDelayDays: computeAverageResponseDelayDays(statusEvents),
    statusBreakdown: computeStatusBreakdown(applications.map((a) => a.status)),
    totalApplications: applications.length,
  };
}
