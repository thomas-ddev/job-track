"use client";

import { useState, useTransition } from "react";

import { generateApiTokenAction, revokeApiTokenAction } from "@/server/actions/api-token";

type ApiTokenSectionProps = {
  hasToken: boolean;
};

export function ApiTokenSection({ hasToken: initialHasToken }: ApiTokenSectionProps) {
  const [hasToken, setHasToken] = useState(initialHasToken);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const { token } = await generateApiTokenAction();
      setNewToken(token);
      setHasToken(true);
    });
  }

  function handleRevoke() {
    startTransition(async () => {
      await revokeApiTokenAction();
      setNewToken(null);
      setHasToken(false);
    });
  }

  return (
    <div className="flex max-w-xl flex-col gap-3 rounded-md border border-slate-700 bg-slate-800/50 p-4">
      <h2 className="text-lg font-semibold text-slate-50">Extension navigateur</h2>
      <p className="text-sm text-slate-400">
        Génère un jeton pour l&apos;extension Firefox JobTrack : elle permet d&apos;ajouter en un
        clic l&apos;offre affichée dans l&apos;onglet actif (LinkedIn, Jobgether, Free-Work,
        Collective, Freelance-Informatique...), même derrière une connexion requise.
      </p>

      {newToken && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-emerald-400">
            Copie ce jeton maintenant, il ne sera plus affiché ensuite. Colle-le dans les réglages
            de l&apos;extension.
          </p>
          <code className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs break-all text-slate-200">
            {newToken}
          </code>
        </div>
      )}

      {!newToken && hasToken && (
        <p className="text-sm text-slate-400">
          Un jeton est déjà configuré. Regénère-le si tu l&apos;as perdu (l&apos;ancien cessera de
          fonctionner).
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {hasToken ? "Regénérer le jeton" : "Générer un jeton"}
        </button>
        {hasToken && (
          <button
            type="button"
            onClick={handleRevoke}
            disabled={pending}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Révoquer
          </button>
        )}
      </div>
    </div>
  );
}
