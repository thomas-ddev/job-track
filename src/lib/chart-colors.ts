import { ApplicationStatus } from "@/generated/prisma";

// Palette catégorielle validée par le script de la skill dataviz pour un
// usage sur fond sombre (slate-950, #020617) : ordre fixe des teintes
// (bleu, vert, magenta, jaune, aqua), séparation CVD et contraste vérifiés
// — voir docs/CONCEPTION.md pour le détail de la validation. Ne pas
// réordonner ces couleurs : l'ordre fait partie de ce qui a été validé.
export const STATUS_CHART_COLORS: Record<ApplicationStatus, string> = {
  TO_APPLY: "#3987e5",
  APPLIED: "#008300",
  INTERVIEW: "#d55181",
  OFFER: "#c98500",
  REJECTED: "#199e70",
};

export const CHART_SURFACE = "#0f172a";
export const CHART_GRIDLINE = "#1e293b";
export const CHART_MUTED_TEXT = "#94a3b8";
export const CHART_PRIMARY_TEXT = "#f8fafc";
export const CHART_SINGLE_SERIES_COLOR = "#3987e5";
