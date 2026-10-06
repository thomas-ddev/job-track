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

export const SORT_OPTIONS = ["statusChangedAt", "createdAt", "name", "status"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export type ApplicationFilters = {
  search?: string;
  status?: ApplicationStatus;
  technology?: string;
  period?: PeriodOption;
  sort?: SortOption;
};

// Le statut MySQL (enum) se trie déjà naturellement dans l'ordre Kanban (sa
// déclaration dans schema.prisma suit STATUS_ORDER), donc `status: "asc"`
// correspond directement à "À postuler" → "Refusée".
function sortToOrderBy(sort: SortOption | undefined): Prisma.ApplicationOrderByWithRelationInput[] {
  switch (sort) {
    case "name":
      return [{ company: "asc" }, { position: "asc" }];
    case "createdAt":
      return [{ createdAt: "desc" }];
    case "status":
      return [{ status: "asc" }];
    case "statusChangedAt":
    default:
      return [{ statusChangedAt: "desc" }];
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

  return db.application.findMany({
    where,
    include: { technologies: { include: { technology: true } } },
    orderBy: sortToOrderBy(filters.sort),
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
