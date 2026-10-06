// Marque JobTrack : trois barres ascendantes (rappel du Kanban/graphiques du
// tableau de bord) surmontées d'un badge coché (l'objectif — décrocher le
// poste). Dessinée à la main en SVG, pas de dépendance d'icônes pour une
// seule marque utilisée à deux endroits (nav, page d'accueil) — voir aussi
// src/app/icon.svg, la même marque servie comme favicon.
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Logo JobTrack"
    >
      <rect width="40" height="40" rx="10" fill="#0f172a" />
      <rect x="7" y="23" width="6" height="10" rx="2" fill="#38bdf8" />
      <rect x="17" y="15" width="6" height="18" rx="2" fill="#0ea5e9" />
      <rect x="27" y="9" width="6" height="24" rx="2" fill="#0284c7" />
      <circle cx="30" cy="8" r="6" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
      <path
        d="M27.3 8 L29.1 9.8 L32.7 6.2"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
