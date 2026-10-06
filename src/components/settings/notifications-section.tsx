"use client";

import { useSyncExternalStore } from "react";

const STORAGE_ENABLED_KEY = "jobtrack:notifications-enabled";
// Événement interne pour notifier useSyncExternalStore après une écriture
// (requestPermission, localStorage) : rien d'autre ne "pousse" ces valeurs
// côté navigateur, il faut donc déclencher la resynchronisation nous-mêmes.
const CHANGE_EVENT = "jobtrack:notifications-settings-changed";

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

function notifyChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// useSyncExternalStore plutôt que useState + useEffect : ces valeurs
// dépendent d'API navigateur absentes côté serveur (Notification,
// localStorage), et useSyncExternalStore gère nativement l'écart entre le
// rendu serveur (snapshot par défaut ci-dessous) et le rendu client, sans
// avertissement d'hydratation ni setState dans un effet.
function getSupportedSnapshot() {
  return typeof Notification !== "undefined";
}
function getSupportedServerSnapshot() {
  return false;
}

function getPermissionSnapshot(): NotificationPermission {
  return typeof Notification !== "undefined" ? Notification.permission : "default";
}
function getPermissionServerSnapshot(): NotificationPermission {
  return "default";
}

function getEnabledSnapshot() {
  return localStorage.getItem(STORAGE_ENABLED_KEY) === "true";
}
function getEnabledServerSnapshot() {
  return false;
}

export function NotificationsSection() {
  const supported = useSyncExternalStore(
    subscribe,
    getSupportedSnapshot,
    getSupportedServerSnapshot,
  );
  const permission = useSyncExternalStore(
    subscribe,
    getPermissionSnapshot,
    getPermissionServerSnapshot,
  );
  const enabled = useSyncExternalStore(subscribe, getEnabledSnapshot, getEnabledServerSnapshot);

  async function handleEnable() {
    const result = await Notification.requestPermission();
    if (result === "granted") {
      localStorage.setItem(STORAGE_ENABLED_KEY, "true");
    }
    notifyChange();
  }

  function handleDisable() {
    localStorage.setItem(STORAGE_ENABLED_KEY, "false");
    notifyChange();
  }

  return (
    <div className="flex max-w-xl flex-col gap-3 rounded-md border border-slate-700 bg-slate-800/50 p-4">
      <h2 className="text-lg font-semibold text-slate-50">Notifications du navigateur</h2>
      <p className="text-sm text-slate-400">
        Un rappel si aucune candidature n&apos;a été ajoutée depuis une semaine, ou si une
        candidature envoyée attend une relance depuis plus de 7 jours. Déclenché à l&apos;ouverture
        du tableau de bord, au plus une fois par jour — ça fonctionne tant que JobTrack est ouvert
        dans un onglet, ce n&apos;est pas une vraie notification &quot;push&quot; reçue navigateur
        fermé.
      </p>

      {!supported ? (
        <p className="text-sm text-slate-500">Ton navigateur ne supporte pas les notifications.</p>
      ) : permission === "denied" ? (
        <p className="text-sm text-amber-400">
          Les notifications sont bloquées pour ce site dans les réglages de ton navigateur.
        </p>
      ) : enabled ? (
        <div className="flex items-center gap-3">
          <p className="text-sm text-emerald-400">Notifications activées.</p>
          <button
            type="button"
            onClick={handleDisable}
            className="text-sm text-slate-400 underline hover:text-slate-200"
          >
            Désactiver
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleEnable}
          className="w-fit rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500"
        >
          Activer les notifications
        </button>
      )}
    </div>
  );
}
