"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";

import { STATUS_LABELS, STATUS_ORDER } from "@/lib/application-status";
import type { ApplicationStatus } from "@/generated/prisma";
import type { KanbanApplication } from "./types";

type KanbanCardProps = {
  application: KanbanApplication;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  disabled: boolean;
};

export function KanbanCard({ application, onStatusChange, disabled }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: { status: application.status },
    disabled,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: isDragging ? 10 : undefined }
    : undefined;

  const selectId = `status-select-${application.id}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-2 rounded-md border border-slate-700 bg-slate-900 p-3 shadow-sm ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      {/* Zone de préhension dédiée au glisser-déposer : le lien et le select
          ci-dessous restent cliquables/focusables normalement, puisque les
          listeners de dnd-kit ne sont attachés qu'à cette poignée. */}
      <div
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        aria-label={`Déplacer ${application.position} chez ${application.company} (glisser-déposer ou utiliser le menu statut ci-dessous)`}
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <Link
          href={`/applications/${application.id}`}
          className="font-medium text-slate-50 hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {application.position}
        </Link>
        <p className="text-sm text-slate-400">{application.company}</p>
      </div>

      {application.technologies.length > 0 && (
        <p className="text-xs text-slate-500">{application.technologies.join(", ")}</p>
      )}

      {/* Alternative explicite au glisser-déposer : change le statut au
          clavier ou avec un lecteur d'écran, sans dépendre de dnd-kit. */}
      <label htmlFor={selectId} className="sr-only">
        Changer le statut de {application.position} chez {application.company}
      </label>
      <select
        id={selectId}
        value={application.status}
        disabled={disabled}
        onChange={(event) =>
          onStatusChange(application.id, event.target.value as ApplicationStatus)
        }
        className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        {STATUS_ORDER.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
