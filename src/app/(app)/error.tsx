"use client";

// error.tsx doit être un composant client (Next.js l'hydrate indépendamment
// du reste de l'arbre pour pouvoir afficher une erreur même si le rendu
// serveur a échoué). Attrape toute erreur non gérée dans le groupe (app) —
// requête Prisma qui échoue, etc. — pour éviter un écran blanc.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold text-slate-50">Une erreur est survenue</h1>
      <p className="max-w-md text-slate-400">
        Quelque chose s&apos;est mal passé lors du chargement de cette page. Vous pouvez réessayer,
        ou revenir plus tard si le problème persiste.
      </p>
      {error.digest && <p className="text-xs text-slate-600">Référence : {error.digest}</p>}
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        Réessayer
      </button>
    </div>
  );
}
