import Link from "next/link";

// Remplace la page 404 générique de Next.js : utilisée aussi bien pour une
// route inexistante que pour notFound() appelé depuis une fiche candidature
// qui n'appartient pas à l'utilisateur courant (voir
// src/server/data/applications.ts) — dans les deux cas, pas d'indice qui
// distingue "la ressource n'existe pas" de "vous n'y avez pas accès".
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center">
      <h1 className="text-3xl font-semibold text-slate-50">Page introuvable</h1>
      <p className="max-w-md text-slate-400">
        Cette page n&apos;existe pas, ou la ressource demandée ne vous est pas accessible.
      </p>
      <Link
        href="/dashboard"
        className="rounded-md bg-sky-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        Retour au tableau de bord
      </Link>
    </main>
  );
}
