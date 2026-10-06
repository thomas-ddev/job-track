import "server-only";

import { db } from "@/lib/db";
import { ApplicationStatus, type Prisma } from "@/generated/prisma";

// Toutes les fonctions de lecture ci-dessous prennent userId en paramètre
// explicite plutôt que de l'extraire elles-mêmes de la session : c'est à
// l'appelant (page, Server Action) d'avoir déjà appelé verifySession(). Cela
// évite qu'une fonction de requête oublie silencieusement de filtrer par
// utilisateur si elle est un jour appelée depuis un contexte sans session.

export const PERIOD_OPTIONS = ["7", "30", "90", "all"] as const;
export type PeriodOption = (typeof PERIOD_OPTIONS)[number];

// Colonnes cliquables du tableau de /applications (en-têtes triables, voir
// cette page). "name" trie sur entreprise puis poste.
export const SORT_COLUMNS = ["name", "createdAt", "statusChangedAt", "status"] as const;
export type SortColumn = (typeof SORT_COLUMNS)[number];

export const SORT_DIRECTIONS = ["asc", "desc"] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

// Direction appliquée par défaut au premier clic sur une colonne (avant
// qu'elle ne devienne la colonne triée, où un second clic inverse la
// direction) : les dates les plus récentes d'abord, le nom et le statut
// dans l'ordre alphabétique/Kanban.
export function defaultSortDirection(column: SortColumn): SortDirection {
  return column === "createdAt" || column === "statusChangedAt" ? "desc" : "asc";
}

export type ApplicationFilters = {
  search?: string;
  status?: ApplicationStatus;
  technology?: string;
  period?: PeriodOption;
  sortColumn?: SortColumn;
  sortDirection?: SortDirection;
};

// Le statut MySQL (enum) se trie déjà naturellement dans l'ordre Kanban (sa
// déclaration dans schema.prisma suit STATUS_ORDER), donc trier par "status"
// correspond directement à "À postuler" → "Refusée" (ou l'inverse en desc).
function sortToOrderBy(
  column: SortColumn,
  direction: SortDirection,
): Prisma.ApplicationOrderByWithRelationInput[] {
  switch (column) {
    case "name":
      return [{ company: direction }, { position: direction }];
    case "createdAt":
      return [{ createdAt: direction }];
    case "status":
      return [{ status: direction }];
    case "statusChangedAt":
    default:
      return [{ statusChangedAt: direction }];
  }
}

function periodToCutoffDate(period: PeriodOption | undefined): Date | undefined {
  if (!period || period === "all") return undefined;
  const days = Number(period);
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function listApplications(userId: string, filters: ApplicationFilters = {}) {
  const cutoff = periodToCutoffDate(filters.period);

  const where: Prisma.ApplicationWhereInput = {
    userId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(cutoff ? { createdAt: { gte: cutoff } } : {}),
    ...(filters.search
      ? {
          OR: [
            { company: { contains: filters.search } },
            { position: { contains: filters.search } },
          ],
        }
      : {}),
    ...(filters.technology
      ? { technologies: { some: { technology: { name: filters.technology } } } }
      : {}),
  };

  const sortColumn = filters.sortColumn ?? "statusChangedAt";
  const sortDirection = filters.sortDirection ?? defaultSortDirection(sortColumn);

  return db.application.findMany({
    where,
    include: { technologies: { include: { technology: true } } },
    orderBy: sortToOrderBy(sortColumn, sortDirection),
  });
}

// Alimente le <select> de filtre par technologie : uniquement les
// technologies effectivement utilisées par l'utilisateur courant, pas la
// table Technology entière (qui est partagée entre tous les utilisateurs).
export async function listUserTechnologyNames(userId: string): Promise<string[]> {
  const technologies = await db.technology.findMany({
    where: { applications: { some: { application: { userId } } } },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return technologies.map((t) => t.name);
}

export function getApplicationForUser(id: string, userId: string) {
  return db.application.findFirst({
    where: { id, userId },
    include: {
      technologies: { include: { technology: true } },
      statusEvents: { orderBy: { createdAt: "asc" } },
    },
  });
}
