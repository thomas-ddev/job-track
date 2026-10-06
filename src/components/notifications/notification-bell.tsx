import Link from "next/link";

import { getUnreadNotificationsForUser } from "@/server/data/notifications";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/server/actions/notifications";

// Composant serveur : pas d'état client nécessaire, le menu déroulant est un
// <details>/<summary> natif (accessible au clavier et au lecteur d'écran
// sans JavaScript), et chaque action passe par une Server Action — cohérent
// avec le choix déjà fait pour les formulaires du reste de l'application.
export async function NotificationBell({ userId }: { userId: string }) {
  const notifications = await getUnreadNotificationsForUser(userId);

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 [&::-webkit-details-marker]:hidden">
        Notifications
        {notifications.length > 0 && (
          <span
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-xs font-semibold text-white"
            aria-label={`${notifications.length} notification(s) non lue(s)`}
          >
            {notifications.length}
          </span>
        )}
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-80 rounded-md border border-slate-700 bg-slate-900 p-3 shadow-lg shadow-black/30">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune notification pour le moment.</p>
        ) : (
          <>
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id} className="rounded-md bg-slate-800 p-2 text-sm">
                  <p className="text-slate-200">{notification.message}</p>
                  <div className="mt-1 flex items-center justify-between">
                    {notification.application ? (
                      <Link
                        href={`/applications/${notification.application.id}`}
                        className="text-xs text-sky-400 hover:underline"
                      >
                        Voir la candidature
                      </Link>
                    ) : (
                      <span />
                    )}
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="id" value={notification.id} />
                      <button
                        type="submit"
                        className="text-xs text-slate-400 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                      >
                        Marquer comme lue
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
            <form
              action={markAllNotificationsReadAction}
              className="mt-2 border-t border-slate-800 pt-2"
            >
              <button
                type="submit"
                className="text-xs text-sky-400 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
              >
                Tout marquer comme lu
              </button>
            </form>
          </>
        )}
      </div>
    </details>
  );
}
