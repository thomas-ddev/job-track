const REPOSITORY_URL = "https://github.com/thomas-ddev/job-track";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 px-4 py-6 text-sm text-slate-500 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p>© {year} Thomas Dubrez. Tous droits réservés.</p>
        <nav className="flex items-center gap-4">
          <a
            href={REPOSITORY_URL}
            className="hover:text-slate-300"
            target="_blank"
            rel="noreferrer"
          >
            Code source
          </a>
        </nav>
      </div>
    </footer>
  );
}
