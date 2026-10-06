import Link from "next/link";

import { verifySession } from "@/lib/dal";
import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SiteFooter } from "@/components/layout/site-footer";

// Le groupe (app) regroupe toutes les pages qui nécessitent une session.
// verifySession() redirige vers /login si l'utilisateur n'est pas authentifié
// — voir src/lib/dal.ts pour le détail de cette garantie.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await verifySession();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
        <div className="flex items-center gap-3">
          <NotificationBell userId={userId} />
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 px-4 py-8 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}
