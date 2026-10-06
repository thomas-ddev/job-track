import { describe, expect, it } from "vitest";

import { ApplicationStatus } from "@/generated/prisma";
import {
  buildReminderMessage,
  needsReminder,
  REMINDER_THRESHOLD_DAYS,
  selectApplicationsNeedingReminder,
  type ApplicationForReminder,
} from "@/lib/reminders";

const DAY = 24 * 60 * 60 * 1000;
const now = new Date(2026, 9, 15);

describe("needsReminder", () => {
  it("ignore les candidatures qui ne sont pas au statut 'Envoyée'", () => {
    const application: ApplicationForReminder = {
      id: "a1",
      status: ApplicationStatus.INTERVIEW,
      lastAppliedAt: new Date(now.getTime() - 30 * DAY),
    };

    expect(needsReminder(application, now)).toBe(false);
  });

  it("ne relance pas avant le seuil", () => {
    const application: ApplicationForReminder = {
      id: "a1",
      status: ApplicationStatus.APPLIED,
      lastAppliedAt: new Date(now.getTime() - (REMINDER_THRESHOLD_DAYS - 1) * DAY),
    };

    expect(needsReminder(application, now)).toBe(false);
  });

  it("relance exactement au seuil et au-delà", () => {
    const atThreshold: ApplicationForReminder = {
      id: "a1",
      status: ApplicationStatus.APPLIED,
      lastAppliedAt: new Date(now.getTime() - REMINDER_THRESHOLD_DAYS * DAY),
    };
    const pastThreshold: ApplicationForReminder = {
      id: "a2",
      status: ApplicationStatus.APPLIED,
      lastAppliedAt: new Date(now.getTime() - (REMINDER_THRESHOLD_DAYS + 5) * DAY),
    };

    expect(needsReminder(atThreshold, now)).toBe(true);
    expect(needsReminder(pastThreshold, now)).toBe(true);
  });

  it("respecte un seuil personnalisé", () => {
    const application: ApplicationForReminder = {
      id: "a1",
      status: ApplicationStatus.APPLIED,
      lastAppliedAt: new Date(now.getTime() - 4 * DAY),
    };

    expect(needsReminder(application, now, 3)).toBe(true);
    expect(needsReminder(application, now, 5)).toBe(false);
  });
});

describe("selectApplicationsNeedingReminder", () => {
  it("ne retient que les candidatures à relancer", () => {
    const applications: ApplicationForReminder[] = [
      {
        id: "to-remind",
        status: ApplicationStatus.APPLIED,
        lastAppliedAt: new Date(now.getTime() - 20 * DAY),
      },
      {
        id: "too-recent",
        status: ApplicationStatus.APPLIED,
        lastAppliedAt: new Date(now.getTime() - 2 * DAY),
      },
      {
        id: "wrong-status",
        status: ApplicationStatus.OFFER,
        lastAppliedAt: new Date(now.getTime() - 20 * DAY),
      },
    ];

    const result = selectApplicationsNeedingReminder(applications, now);

    expect(result.map((application) => application.id)).toEqual(["to-remind"]);
  });
});

describe("buildReminderMessage", () => {
  it("mentionne l'entreprise et le poste", () => {
    expect(buildReminderMessage("Acme", "Développeur backend")).toBe(
      "Toujours sans nouvelles de Acme pour le poste de Développeur backend — pensez à relancer.",
    );
  });
});
