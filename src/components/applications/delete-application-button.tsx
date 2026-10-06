"use client";

import { deleteApplicationAction } from "@/server/actions/applications";

export function DeleteApplicationButton({ applicationId }: { applicationId: string }) {
  return (
    <form
      action={deleteApplicationAction}
      onSubmit={(event) => {
        // Suppression définitive : une confirmation native suffit ici, pas
        // besoin d'une modale dédiée pour ce niveau de risque (une seule
        // candidature, pas une suppression en masse).
        if (!window.confirm("Supprimer définitivement cette candidature ?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={applicationId} />
      <button
        type="submit"
        className="rounded-md border border-red-800 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
      >
        Supprimer
      </button>
    </form>
  );
}
