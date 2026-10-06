"use client";

import { useEffect } from "react";

import {
  buildFollowUpNudgeMessage,
  buildNewApplicationsNudgeMessage,
  shouldNudgeFollowUp,
  shouldNudgeNewApplications,
} from "@/lib/notification-rules";

const STORAGE_ENABLED_KEY = "jobtrack:notifications-enabled";
const STORAGE_LAST_SHOWN_KEY = "jobtrack:notifications-last-shown";

type BrowserNotificationManagerProps = {
  lastApplicationCreatedAt: string | null;
  staleAppliedCount: number;
};

// Ne rend rien : composant purement effet de bord, monté une fois sur le
// tableau de bord. Utilise l'API Notification du navigateur directement
// (pas de vraie Web Push — ça nécessiterait un service worker, des clés
// VAPID et un abonnement stocké côté serveur) : ne fonctionne donc que tant
// que JobTrack est ouvert dans un onglet, voir le texte explicatif dans
// src/components/settings/notifications-section.tsx.
export function BrowserNotificationManager({
  lastApplicationCreatedAt,
  staleAppliedCount,
}: BrowserNotificationManagerProps) {
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    if (localStorage.getItem(STORAGE_ENABLED_KEY) !== "true") return;

    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(STORAGE_LAST_SHOWN_KEY) === today) return;

    const now = new Date();
    const lastApplicationDate = lastApplicationCreatedAt
      ? new Date(lastApplicationCreatedAt)
      : null;

    const messages: string[] = [];
    if (shouldNudgeFollowUp(staleAppliedCount)) {
      messages.push(buildFollowUpNudgeMessage(staleAppliedCount));
    }
    if (shouldNudgeNewApplications(lastApplicationDate, now)) {
      messages.push(buildNewApplicationsNudgeMessage());
    }

    if (messages.length === 0) return;

    new Notification("JobTrack", { body: messages.join(" ") });
    localStorage.setItem(STORAGE_LAST_SHOWN_KEY, today);
  }, [lastApplicationCreatedAt, staleAppliedCount]);

  return null;
}
