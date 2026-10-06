// Icône "ouvrir dans un nouvel onglet", partagée entre le champ "Lien de
// l'offre" (ApplicationForm) et la liste des candidatures (page /applications).
export function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.5 3a.75.75 0 0 1 .75-.75h3.25a.75.75 0 0 1 .75.75v3.25a.75.75 0 0 1-1.5 0V4.81l-5.22 5.22a.75.75 0 0 1-1.06-1.06l5.22-5.22H12.5a.75.75 0 0 1-.75-.75Z" />
      <path d="M4.75 4.5A1.25 1.25 0 0 0 3.5 5.75v9.5A1.25 1.25 0 0 0 4.75 16.5h9.5a1.25 1.25 0 0 0 1.25-1.25v-4a.75.75 0 0 0-1.5 0v4a.25.25 0 0 1-.25.25h-9.5a.25.25 0 0 1-.25-.25v-9.5a.25.25 0 0 1 .25-.25h4a.75.75 0 0 0 0-1.5h-4Z" />
    </svg>
  );
}
