import { ApplicationStatus } from "@/generated/prisma";

// Ordre d'affichage des colonnes du Kanban (phase 4) et des options de
// formulaire (phase 3) : centralisé ici pour qu'il n'y ait qu'un seul
// endroit à modifier si une colonne est ajoutée ou réordonnée.
export const STATUS_ORDER: ApplicationStatus[] = [
  ApplicationStatus.TO_APPLY,
  ApplicationStatus.APPLIED,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  TO_APPLY: "À postuler",
  APPLIED: "Envoyée",
  INTERVIEW: "Entretien",
  OFFER: "Offre",
  REJECTED: "Refusée",
};

export const STATUS_BADGE_CLASSES: Record<ApplicationStatus, string> = {
  TO_APPLY: "bg-slate-700 text-slate-100",
  APPLIED: "bg-sky-700 text-sky-100",
  INTERVIEW: "bg-amber-700 text-amber-100",
  OFFER: "bg-emerald-700 text-emerald-100",
  REJECTED: "bg-red-800 text-red-100",
};
