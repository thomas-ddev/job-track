import type { Metadata } from "next";
import Link from "next/link";

import { verifySession } from "@/lib/dal";
import {
  listApplications,
  listUserTechnologyNames,
  PERIOD_OPTIONS,
  type PeriodOption,
} from "@/server/data/applications";
import { StatusBadge } from "@/components/applications/status-badge";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/application-status";
import { ApplicationStatus } from "@/generated/prisma";

export const metadata: Metadata = {
  title: "Candidatures — JobTrack",
};

const PERIOD_LABELS: Record<PeriodOption, string> = {
  "7": "7 derniers jours",
  "30": "30 derniers jours",
  "90": "90 derniers jours",
  all: "Toutes les périodes",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    technology?: string;
    period?: string;
  }>;
};

function isApplicationStatus(value: string): value is ApplicationStatus {
  return (STATUS_ORDER as string[]).includes(value);
}

function isPeriodOption(value: string): value is PeriodOption {
  return (PERIOD_OPTIONS as readonly string[]).includes(value);
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { userId } = await verifySession();

  const search = params.q?.trim() || undefined;
  const status = params.status && isApplicationStatus(params.status) ? params.status : undefined;
  const technology = params.technology || undefined;
  const period = params.period && isPeriodOption(params.period) ? params.period : "all";

  const [applications, technologyNames] = await Promise.all([
    listApplications(userId, { search, status, technology, period }),
    listUserTechnologyNames(userId),
  ]);

  const hasActiveFilters = Boolean(search || status || technology || period !== "all");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Candidatures</h1>
        <Link
          href="/applications/new"
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          Nouvelle candidature
        </Link>
      </div>

      {/* Formulaire GET classique : fonctionne sans JavaScript, les filtres
          vivent dans l'URL (partageables, navigables avec le bouton
          "retour"), cohérent avec le reste de l'application. */}
      <form
        method="GET"
        className="flex flex-wrap items-end gap-3 rounded-md border border-slate-800 bg-slate-900/40 p-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="text-xs font-medium text-slate-400">
            Recherche
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={params.q}
            placeholder="Entreprise ou poste"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-xs font-medium text-slate-400">
            Statut
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <option value="">Tous</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="technology" className="text-xs font-medium text-slate-400">
            Technologie
          </label>
          <select
            id="technology"
            name="technology"
            defaultValue={technology ?? ""}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <option value="">Toutes</option>
            {technologyNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="period" className="text-xs font-medium text-slate-400">
            Période
          </label>
          <select
            id="period"
            name="period"
            defaultValue={period}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {PERIOD_LABELS[p]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md bg-slate-700 px-4 py-1.5 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          Filtrer
        </button>

        {hasActiveFilters && (
          <Link
            href="/applications"
            className="text-sm text-slate-400 underline hover:text-slate-200"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      {applications.length === 0 ? (
        <p className="text-slate-400">
          {hasActiveFilters ? (
            "Aucune candidature ne correspond à ces filtres."
          ) : (
            <>
              Aucune candidature enregistrée pour l&apos;instant.{" "}
              <Link href="/applications/new" className="text-sky-400 hover:underline">
                Ajoutez votre première candidature
              </Link>
              .
            </>
          )}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-800 rounded-md border border-slate-800">
          {applications.map((application) => (
            <li key={application.id}>
              <Link
                href={`/applications/${application.id}`}
                className="flex flex-col items-start gap-2 px-4 py-4 transition-colors hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-slate-50">
                    {application.position} — {application.company}
                  </span>
                  {application.technologies.length > 0 && (
                    <span className="text-sm text-slate-400">
                      {application.technologies.map((t) => t.technology.name).join(", ")}
                    </span>
                  )}
                </div>
                <StatusBadge status={application.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
