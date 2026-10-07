import Link from "next/link";

import { getOptionalSession } from "@/lib/dal";
import { SiteFooter } from "@/components/layout/site-footer";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { Logo } from "@/components/layout/logo";

const FEATURES = [
  {
    title: "Kanban glisser-déposer",
    description: "Faites avancer vos candidatures entre 5 colonnes, à la souris ou au clavier.",
  },
  {
    title: "Historique automatique",
    description: "Chaque changement de statut est daté et consultable en timeline sur la fiche.",
  },
  {
    title: "Statistiques de recherche",
    description: "Taux de réponse, délai moyen avant retour, répartition par statut, par semaine.",
  },
  {
    title: "Rappels de relance",
    description: "Une notification apparaît dès qu'une candidature envoyée reste sans nouvelles.",
  },
];

export default async function Home() {
  const session = await getOptionalSession();

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-slate-950">
      <AnimatedBackground />
      <main className="flex flex-1 flex-col items-center gap-16 px-4 py-20 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12" />
            <h1 className="text-4xl font-semibold text-slate-50 sm:text-5xl">JobTrack</h1>
          </div>
          <p className="max-w-lg text-slate-400">
            Suivez vos candidatures, votre pipeline Kanban et vos statistiques de recherche
            d&apos;emploi en un seul endroit.
          </p>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="rounded-md bg-sky-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            {session ? "Accéder au tableau de bord" : "Se connecter"}
          </Link>
        </div>

        <div className="grid w-full max-w-4xl gap-4 text-left sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 p-4"
            >
              <h2 className="font-medium text-slate-100">{feature.title}</h2>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
