import type { Metadata } from "next";

import { verifySession } from "@/lib/dal";
import { getDashboardStats } from "@/server/data/stats";
import { StatTile } from "@/components/dashboard/stat-tile";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { StatusBreakdownChart } from "@/components/dashboard/status-breakdown-chart";

export const metadata: Metadata = {
  title: "Tableau de bord — JobTrack",
};

const percentFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const dayFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export default async function DashboardPage() {
  const { userId } = await verifySession();
  const stats = await getDashboardStats(userId);

  if (stats.totalApplications === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-50">Tableau de bord</h1>
        <p className="text-slate-400">Aucune candidature enregistrée pour l&apos;instant.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-slate-50">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Candidatures enregistrées" value={String(stats.totalApplications)} />
        <StatTile
          label="Taux de réponse"
          value={
            stats.responseRate === null ? "—" : `${percentFormatter.format(stats.responseRate)} %`
          }
          helperText={
            stats.responseRate === null
              ? "Aucune candidature envoyée pour l'instant"
              : "Entretien, offre ou refus, parmi les candidatures envoyées"
          }
        />
        <StatTile
          label="Délai moyen avant réponse"
          value={
            stats.averageResponseDelayDays === null
              ? "—"
              : `${dayFormatter.format(stats.averageResponseDelayDays)} j`
          }
          helperText={
            stats.averageResponseDelayDays === null
              ? "Pas encore de réponse enregistrée"
              : "Entre l'envoi et la première réaction"
          }
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-slate-200">Candidatures par semaine</h2>
        <WeeklyChart
          data={stats.weekly.map((w) => ({ weekStart: w.weekStart.toISOString(), count: w.count }))}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-slate-200">Répartition par statut</h2>
        <StatusBreakdownChart breakdown={stats.statusBreakdown} />
      </section>
    </div>
  );
}
