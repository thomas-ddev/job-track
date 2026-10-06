"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const VISIBLE_DURATION_MS = 3000;

type SuccessBannerProps = {
  // Nom du paramètre de requête qui déclenche la bannière (ex. "saved",
  // "created") — mis par la Server Action concernée en redirigeant vers
  // `?<queryParam>=1` après un enregistrement réussi. Le symétrique de
  // SubmitButton (voir ce fichier) : là où SubmitButton empêche un double
  // envoi, ceci confirme visuellement qu'un envoi a bien abouti, pour la
  // même raison — un clic sur "Enregistrer" sans retour clair pousse à
  // cliquer une seconde fois.
  queryParam: string;
  message: string;
};

export function SuccessBanner({ queryParam, message }: SuccessBannerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Calculé à l'initialisation (pas dans un effet) : évite un setState
  // synchrone en effet, et la bannière doit de toute façon n'apparaître
  // qu'au tout premier rendu suivant la redirection de la Server Action.
  const [visible, setVisible] = useState(() => searchParams.get(queryParam) === "1");

  useEffect(() => {
    if (!visible) return;

    // Retire le paramètre de l'URL (sans navigation complète) pour qu'un
    // rafraîchissement de page ne réaffiche pas la confirmation.
    const next = new URLSearchParams(searchParams);
    next.delete(queryParam);
    router.replace(next.size > 0 ? `${pathname}?${next.toString()}` : pathname, {
      scroll: false,
    });

    const timeout = setTimeout(() => setVisible(false), VISIBLE_DURATION_MS);
    return () => clearTimeout(timeout);
    // Volontairement limité à `visible` : cet effet ne doit se déclencher
    // qu'une fois, à l'apparition de la bannière, pas à chaque changement de
    // searchParams (que router.replace() provoque lui-même juste après).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="flex w-fit items-center gap-2 rounded-md border border-emerald-700 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="size-4 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  );
}
