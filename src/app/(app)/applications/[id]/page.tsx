import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { getApplicationForUser } from "@/server/data/applications";
import { ApplicationForm } from "@/components/applications/application-form";
import { StatusTimeline } from "@/components/applications/status-timeline";
import { DeleteApplicationButton } from "@/components/applications/delete-application-button";

export const metadata: Metadata = {
  title: "Détail de la candidature — JobTrack",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await verifySession();

  // getApplicationForUser filtre par userId au niveau de la requête SQL
  // (WHERE id = ? AND userId = ?) : une candidature appartenant à un autre
  // utilisateur n'existe tout simplement pas du point de vue de cette
  // requête, et se traduit par un 404 — pas par une erreur d'autorisation
  // qui révélerait que l'identifiant est valide.
  const application = await getApplicationForUser(id, userId);
  if (!application) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">
          {application.position} — {application.company}
        </h1>
        <DeleteApplicationButton applicationId={application.id} />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-slate-200">Modifier</h2>
        <ApplicationForm
          mode="edit"
          application={{
            id: application.id,
            company: application.company,
            position: application.position,
            jobUrl: application.jobUrl,
            salary: application.salary,
            contactName: application.contactName,
            contactEmail: application.contactEmail,
            notes: application.notes,
            status: application.status,
            technologies: application.technologies.map((t) => t.technology.name),
          }}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-slate-200">Historique</h2>
        <StatusTimeline events={application.statusEvents} />
      </section>
    </div>
  );
}
