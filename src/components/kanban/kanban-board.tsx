"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { changeApplicationStatusAction } from "@/server/actions/applications";
import { STATUS_ORDER } from "@/lib/application-status";
import { ApplicationStatus } from "@/generated/prisma";
import { KanbanColumn } from "./kanban-column";
import type { KanbanApplication } from "./types";

type Columns = Record<ApplicationStatus, KanbanApplication[]>;

function groupByStatus(applications: KanbanApplication[]): Columns {
  const groups: Columns = {
    TO_APPLY: [],
    APPLIED: [],
    INTERVIEW: [],
    OFFER: [],
    REJECTED: [],
  };
  for (const application of applications) {
    groups[application.status].push(application);
  }
  return groups;
}

// Rendu du HTML serveur, écoute d'aucun store externe : getSnapshot renvoie
// toujours `true` côté client, getServerSnapshot `false` côté serveur.
// `useSyncExternalStore` force React à utiliser la valeur serveur pour le
// premier rendu client (pas de divergence d'hydratation), puis à re-rendre
// juste après avec la vraie valeur — exactement le signal "composant
// réellement monté côté client" dont a besoin le test E2E (voir
// e2e/kanban-flow.spec.ts), sans l'anti-pattern `setState` dans un effet.
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// Déplace une candidature de `from` vers `to` dans une copie de l'état des
// colonnes. Fonction pure, utilisée à la fois pour le déplacement optimiste
// et pour l'annulation en cas d'échec de la Server Action.
function relocate(
  columns: Columns,
  id: string,
  from: ApplicationStatus,
  to: ApplicationStatus,
): Columns {
  const sourceIndex = columns[from].findIndex((application) => application.id === id);
  if (sourceIndex === -1) return columns;

  const application = columns[from][sourceIndex];
  return {
    ...columns,
    [from]: columns[from].filter((item) => item.id !== id),
    [to]: [{ ...application, status: to }, ...columns[to]],
  };
}

export function KanbanBoard({ initialApplications }: { initialApplications: KanbanApplication[] }) {
  const [columns, setColumns] = useState(() => groupByStatus(initialApplications));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isHydrated = useIsHydrated();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  function moveCard(id: string, nextStatus: ApplicationStatus) {
    const currentStatus = STATUS_ORDER.find((status) =>
      columns[status].some((application) => application.id === id),
    );
    if (!currentStatus || currentStatus === nextStatus) return;

    setError(null);
    // Mise à jour optimiste : l'UI reflète le déplacement immédiatement, puis
    // la Server Action persiste le changement (et journalise l'historique,
    // voir phase 3). En cas d'échec — candidature supprimée entre-temps,
    // perte de session — on revient à la position d'origine plutôt que de
    // laisser l'UI mentir sur l'état réel en base.
    setColumns((current) => relocate(current, id, currentStatus, nextStatus));

    startTransition(async () => {
      const result = await changeApplicationStatusAction(id, nextStatus);
      if (result.error) {
        setError(result.error);
        setColumns((current) => relocate(current, id, nextStatus, currentStatus));
      }
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    moveCard(active.id as string, over.id as ApplicationStatus);
  }

  return (
    <div className="flex flex-col gap-4" data-hydrated={isHydrated}>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={columns[status]}
              onStatusChange={moveCard}
              disabled={isPending}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
