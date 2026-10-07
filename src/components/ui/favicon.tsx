"use client";

import { useState } from "react";

import { getFaviconUrl } from "@/lib/favicon";

type FaviconProps = {
  url: string | null | undefined;
  size?: number;
  className?: string;
};

// Composant client car le fallback (masquer l'icône si même le service de
// favicons échoue à en servir une, ex. hors-ligne) dépend de l'évènement
// onError, indisponible côté serveur. À monter avec `key={url}` par
// l'appelant si `url` peut changer, pour réinitialiser cet état d'échec.
export function Favicon({ url, size = 16, className }: FaviconProps) {
  const [failed, setFailed] = useState(false);
  const src = getFaviconUrl(url, size * 2);

  if (!src || failed) return null;

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
