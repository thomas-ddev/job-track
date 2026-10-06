import type { Metadata } from "next";
import Link from "next/link";

import { verifySession } from "@/lib/dal";
import {
  listApplications,
  listUserTechnologyNames,
  PERIOD_OPTIONS,
  SORT_COLUMNS,
  SORT_DIRECTIONS,
  defaultSortDirection,
  type PeriodOption,
  type SortColumn,
  type SortDirection,
} from "@/server/data/applications";
import { StatusBadge } from "@/components/applications/status-badge";
import { ExternalLinkIcon } from "@/components/ui/external-link-icon";
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

const COLUMN_LABELS: Record<SortColumn, string> = {
  name: "Poste / Entreprise",
  createdAt: "Candidature",
  statusChangedAt: "Relance",
  status: "Statut",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    technology?: string;
    period?: string;
    sort?: string;
    dir?: string;
  }>;
};

function isApplicationStatus(value: string): value is ApplicationStatus {
  return (STATUS_ORDER as string[]).includes(value);
}

function isPeriodOption(value: string): value is PeriodOption {
  return (PERIOD_OPTIONS as readonly string[]).includes(value);
}

function isSortColumn(value: string): value is SortColumn {
  return (SORT_COLUMNS as readonly string[]).includes(value);
}

function isSortDirection(value: string): value is SortDirection {
  return (SORT_DIRECTIONS as readonly string[]).includes(value);
}

type ActiveFilters = {
  search?: string;
  status?: ApplicationStatus;
  technology?: string;
  period: PeriodOption;
};

// Construit le lien d'un en-tête de colonne triable : un clic sur la colonne
// déjà active inverse la direction, un clic sur une autre colonne applique sa
// direction par défaut. Les filtres actifs (recherche, statut, techno,
// période) sont préservés dans l'URL.
function buildSortHref(
  column: SortColumn,
  current: { column: SortColumn; direction: SortDirection },
  filters: ActiveFilters,
): string {
  const nextDirection: SortDirection =
    column === current.column
      ? current.direction === "asc"
        ? "desc"
        : "asc"
      : defaultSortDirection(column);

  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set("q", filters.search);
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.technology) queryParams.set("technology", filters.technology);
  if (filters.period !== "all") queryParams.set("period", filters.period);
  queryParams.set("sort", column);
  queryParams.set("dir", nextDirection);

  return `/applications?${queryParams.toString()}`;
}

type ColumnHeaderProps = {
  column: SortColumn;
  current: { column: SortColumn; direction: SortDirection };
  filters: ActiveFilters;
  className?: string;
};

function ColumnHeader({ column, current, filters, className }: ColumnHeaderProps) {
  const isActive = column === current.column;
  return (
    <th scope="col" className={`px-4 py-2 text-left text-xs font-medium ${className ?? ""}`}>
      <Link
        href={buildSortHref(column, current, filters)}
        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200"
      >
        {COLUMN_LABELS[column]}
        {isActive && (
          <span aria-hidden="true" className="text-sky-400">
            {current.direction === "asc" ? "▲" : "▼"}
          </span>
        )}
      </Link>
    </th>
  );
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { userId } = await verifySession();

  const search = params.q?.trim() || undefined;
  const status = params.status && isApplicationStatus(params.status) ? params.status : undefined;
  const technology = params.technology || undefined;
  const period = params.period && isPeriodOption(params.period) ? params.period : "all";
  const sortColumn =
    params.sort && isSortColumn(params.sort) ? params.sort : ("statusChangedAt" as SortColumn);
  const sortDirection =
    params.dir && isSortDirection(params.dir) ? params.dir : defaultSortDirection(sortColumn);

  const [applications, technologyNames] = await Promise.all([
    listApplications(userId, { search, status, technology, period, sortColumn, sortDirection }),
    listUserTechnologyNames(userId),
  ]);

  const hasActiveFilters = Boolean(search || status || technology || period !== "all");
  const currentSort = { column: sortColumn, direction: sortDirection };
  const activeFilters: ActiveFilters = { search, status, technology, period };

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
          "retour"), cohérent avec le reste de l'application. Le tri, lui,
          vit dans les en-têtes de colonnes cliquables du tableau ci-dessous
          (voir ColumnHeader) — ces deux champs cachés se contentent de le
          préserver quand on soumet un filtre. */}
      <form
        method="GET"
        className="flex flex-wrap items-end gap-3 rounded-md border border-slate-800 bg-slate-900/40 p-4"
      >
        <input type="hidden" name="sort" value={sortColumn} />
        <input type="hidden" name="dir" value={sortDirection} />

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
        <div className="overflow-x-auto rounded-md border border-slate-800">
          <table className="w-full border-collapse text-sm">
            <thead className="border-b border-slate-800">
              <tr>
                <ColumnHeader column="name" current={currentSort} filters={activeFilters} />
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-400">
                  Technologies
                </th>
                <ColumnHeader column="createdAt" current={currentSort} filters={activeFilters} />
                <ColumnHeader
                  column="statusChangedAt"
                  current={currentSort}
                  filters={activeFilters}
                />
                <ColumnHeader
                  column="status"
                  current={currentSort}
                  filters={activeFilters}
                  className="text-right"
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {applications.map((application) => (
                <tr key={application.id} className="transition-colors hover:bg-slate-900">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/applications/${application.id}`}
                        className="font-medium text-slate-50 hover:underline"
                      >
                        {application.position} — {application.company}
                      </Link>
                      <a
                        href={`/applications/${application.id}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        title="Ouvrir cette candidature dans un nouvel onglet"
                        className="text-slate-500 hover:text-sky-400"
                      >
                        <span className="sr-only">
                          Ouvrir cette candidature dans un nouvel onglet
                        </span>
                        <ExternalLinkIcon className="size-3.5" />
                      </a>
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-400">
                    {application.technologies.map((t) => t.technology.name).join(", ")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                    {dateFormatter.format(application.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                    {dateFormatter.format(application.statusChangedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1.5">
                      {application.autoRejected && (
                        <span
                          className="text-xs text-slate-500"
                          title="Marquée refusée automatiquement après 30 jours sans changement de statut."
                        >
                          (auto)
                        </span>
                      )}
                      <StatusBadge status={application.status} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
