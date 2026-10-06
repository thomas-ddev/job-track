import type { Metadata } from "next";

import { verifySession } from "@/lib/dal";
import { listApplications } from "@/server/data/applications";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export const metadata: Metadata = {
  title: "Kanban — JobTrack",
};

export default async function KanbanPage() {
  const { userId } = await verifySession();
  const applications = await listApplications(userId);

  const kanbanApplications = applications.map((application) => ({
    id: application.id,
    company: application.company,
    position: application.position,
    status: application.status,
    technologies: application.technologies.map((t) => t.technology.name),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-50">Kanban</h1>
      {kanbanApplications.length === 0 ? (
        <p className="text-slate-400">Aucune candidature à afficher dans le Kanban.</p>
      ) : (
        <KanbanBoard initialApplications={kanbanApplications} />
      )}
    </div>
  );
}
