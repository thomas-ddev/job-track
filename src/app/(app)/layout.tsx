import Link from "next/link";

import { verifySession } from "@/lib/dal";
import { autoRejectStaleApplications } from "@/server/actions/applications";
import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SiteFooter } from "@/components/layout/site-footer";
import { Logo } from "@/components/layout/logo";

// Le groupe (app) regroupe toutes les pages qui nécessitent une session.
// verifySession() redirige vers /login si l'utilisateur n'est pas authentifié
// — voir src/lib/dal.ts pour le détail de cette garantie.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await verifySession();

  // Balayage paresseux à chaque navigation dans l'app plutôt qu'une tâche
  // planifiée séparée : voir autoRejectStaleApplications pour le détail.
  await autoRejectStaleApplications(userId);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-50 hover:text-slate-200"
          >
            <Logo className="h-7 w-7" />
            JobTrack
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-slate-50">
            Tableau de bord
          </Link>
          <Link href="/applications" className="text-sm text-slate-300 hover:text-slate-50">
            Candidatures
          </Link>
          <Link href="/kanban" className="text-sm text-slate-300 hover:text-slate-50">
            Kanban
          </Link>
          <Link href="/settings" className="text-sm text-slate-300 hover:text-slate-50">
            Réglages
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
