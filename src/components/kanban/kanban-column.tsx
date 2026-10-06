"use client";

import { useDroppable } from "@dnd-kit/core";

import { STATUS_LABELS } from "@/lib/application-status";
import type { ApplicationStatus } from "@/generated/prisma";
import type { KanbanApplication } from "./types";
import { KanbanCard } from "./kanban-card";

type KanbanColumnProps = {
  status: ApplicationStatus;
  applications: KanbanApplication[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  disabled: boolean;
};

export function KanbanColumn({
  status,
  applications,
  onStatusChange,
  disabled,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] w-72 flex-shrink-0 flex-col gap-3 rounded-lg border p-3 transition-colors ${
        isOver ? "border-sky-500 bg-sky-950/30" : "border-slate-800 bg-slate-900/40"
      }`}
    >
      <h2 className="flex items-center justify-between text-sm font-semibold text-slate-200">
        {STATUS_LABELS[status]}
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
          {applications.length}
        </span>
      </h2>

      <div className="flex flex-col gap-2">
        {applications.map((application) => (
          <KanbanCard
            key={application.id}
            application={application}
            onStatusChange={onStatusChange}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
