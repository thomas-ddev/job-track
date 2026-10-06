// Affiché par Next.js pendant le chargement des données de n'importe quelle
// page du groupe (app) (dashboard, candidatures, Kanban...) : un squelette
// générique plutôt qu'un écran blanc le temps que la requête Prisma
// réponde. `role="status"` + texte en sr-only : un lecteur d'écran annonce
// le chargement sans qu'un texte visible encombre l'interface.
export default function AppLoading() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Chargement…</span>
      <div className="h-8 w-48 animate-pulse rounded-md bg-slate-800" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 animate-pulse rounded-lg bg-slate-900/60" />
        <div className="h-24 animate-pulse rounded-lg bg-slate-900/60" />
        <div className="h-24 animate-pulse rounded-lg bg-slate-900/60" />
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-slate-900/60" />
    </div>
  );
}
