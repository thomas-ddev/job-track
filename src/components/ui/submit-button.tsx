"use client";

import { useEffect, useRef } from "react";

type SubmitButtonProps = {
  pending: boolean;
  children: React.ReactNode;
};

export function SubmitButton({ pending, children }: SubmitButtonProps) {
  // Garde-fou contre le double envoi : entre un double-clic rapide et la
  // mise à jour de `disabled` par le re-render React (déclenché par
  // `pending`), il y a une fenêtre où le bouton accepte encore les clics —
  // suffisante, en pratique, pour déclencher deux soumissions (deux
  // candidatures créées en double, par exemple). Cette ref est mutée de
  // façon synchrone dans le gestionnaire de clic, donc fiable dès le
  // deuxième clic même si React n'a pas encore re-rendu.
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!pending) {
      hasSubmittedRef.current = false;
    }
  }, [pending]);

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      onClick={(event) => {
        if (hasSubmittedRef.current) {
          event.preventDefault();
          return;
        }
        hasSubmittedRef.current = true;
      }}
      className="rounded-md bg-sky-600 px-4 py-2 font-medium text-white transition-colors hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Patientez…" : children}
    </button>
  );
}
