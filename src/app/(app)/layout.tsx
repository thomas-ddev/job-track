import Link from "next/link";

import { verifySession } from "@/lib/dal";
import { LogoutButton } from "@/components/auth/logout-button";

// Le groupe (app) regroupe toutes les pages qui nécessitent une session.
// verifySession() redirige vers /login si l'utilisateur n'est pas authentifié
// — voir src/lib/dal.ts pour le détail de cette garantie.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await verifySession();

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <nav className="flex items-center gap-6">
          <span className="text-lg font-semibold text-slate-50">JobTrack</span>
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-slate-50">
            Tableau de bord
          </Link>
          <Link href="/applications" className="text-sm text-slate-300 hover:text-slate-50">
            Candidatures
          </Link>
          <Link href="/kanban" className="text-sm text-slate-300 hover:text-slate-50">
            Kanban
          </Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
