import { describe, expect, it } from "vitest";

import { ApplicationStatus } from "@/generated/prisma";
import {
  computeAverageResponseDelayDays,
  computeResponseRate,
  computeStatusBreakdown,
  computeWeeklyApplicationCounts,
  startOfWeek,
} from "@/lib/stats";

describe("startOfWeek", () => {
  it("ramène une date au lundi de sa semaine", () => {
    // Mercredi 8 octobre 2026 -> lundi 5 octobre 2026.
    expect(startOfWeek(new Date(2026, 9, 8))).toEqual(new Date(2026, 9, 5));
  });

  it("gère le dimanche comme dernier jour de la semaine précédente", () => {
    // Dimanche 11 octobre 2026 -> lundi 5 octobre 2026 (pas le 11).
    expect(startOfWeek(new Date(2026, 9, 11))).toEqual(new Date(2026, 9, 5));
  });
});

describe("computeWeeklyApplicationCounts", () => {
  it("initialise toutes les semaines à 0, y compris celles sans candidature", () => {
    const reference = new Date(2026, 9, 8); // semaine du 5 octobre 2026
    const buckets = computeWeeklyApplicationCounts([], 3, reference);

    expect(buckets).toHaveLength(3);
    expect(buckets.every((bucket) => bucket.count === 0)).toBe(true);
    expect(buckets[2]?.weekStart).toEqual(new Date(2026, 9, 5));
  });

  it("regroupe les candidatures dans la bonne semaine", () => {
    const reference = new Date(2026, 9, 8);
    const buckets = computeWeeklyApplicationCounts(
      [new Date(2026, 9, 6), new Date(2026, 9, 7), new Date(2026, 8, 29)],
      3,
      reference,
    );

    // Semaine du 5 octobre : 2 candidatures. Semaine du 28 septembre : 1.
    expect(buckets[2]?.count).toBe(2);
    expect(buckets[1]?.count).toBe(1);
    expect(buckets[0]?.count).toBe(0);
  });
});

describe("computeResponseRate", () => {
  it("retourne null quand aucune candidature n'a été envoyée", () => {
    expect(
      computeResponseRate([ApplicationStatus.TO_APPLY, ApplicationStatus.TO_APPLY]),
    ).toBeNull();
  });

  it("exclut les candidatures 'À postuler' du calcul", () => {
    const statuses = [
      ApplicationStatus.TO_APPLY,
      ApplicationStatus.APPLIED,
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.REJECTED,
    ];
    // 2 répondues (INTERVIEW, REJECTED) sur 3 envoyées (APPLIED, INTERVIEW, REJECTED).
    expect(computeResponseRate(statuses)).toBeCloseTo((2 / 3) * 100);
  });

  it("retourne 100 quand toutes les candidatures envoyées ont une réponse", () => {
    expect(computeResponseRate([ApplicationStatus.OFFER, ApplicationStatus.REJECTED])).toBe(100);
  });
});

describe("computeAverageResponseDelayDays", () => {
  const DAY = 24 * 60 * 60 * 1000;

  it("retourne null quand aucune candidature n'a reçu de réponse", () => {
    expect(
      computeAverageResponseDelayDays([
        { applicationId: "a1", toStatus: ApplicationStatus.APPLIED, createdAt: new Date(0) },
      ]),
    ).toBeNull();
  });

  it("calcule le délai moyen entre l'envoi et la première réaction", () => {
    const base = new Date(2026, 0, 1).getTime();
    const events = [
      // Candidature 1 : envoyée jour 0, réponse jour 9 -> délai 9 jours.
      { applicationId: "a1", toStatus: ApplicationStatus.APPLIED, createdAt: new Date(base) },
      {
        applicationId: "a1",
        toStatus: ApplicationStatus.OFFER,
        createdAt: new Date(base + 9 * DAY),
      },
      // Candidature 2 : envoyée jour 0, réponse jour 1 -> délai 1 jour.
      { applicationId: "a2", toStatus: ApplicationStatus.APPLIED, createdAt: new Date(base) },
      {
        applicationId: "a2",
        toStatus: ApplicationStatus.REJECTED,
        createdAt: new Date(base + 1 * DAY),
      },
    ];

    expect(computeAverageResponseDelayDays(events)).toBeCloseTo(5);
  });

  it("ignore une réaction antérieure à l'envoi (ordre des événements)", () => {
    const base = new Date(2026, 0, 1).getTime();
    const events = [
      { applicationId: "a1", toStatus: ApplicationStatus.INTERVIEW, createdAt: new Date(base) },
      { applicationId: "a1", toStatus: ApplicationStatus.APPLIED, createdAt: new Date(base + DAY) },
    ];

    expect(computeAverageResponseDelayDays(events)).toBeNull();
  });
});

describe("computeStatusBreakdown", () => {
  it("initialise tous les statuts à 0, y compris ceux sans candidature", () => {
    const breakdown = computeStatusBreakdown([ApplicationStatus.APPLIED]);

    expect(breakdown).toEqual({
      TO_APPLY: 0,
      APPLIED: 1,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
    });
  });
});
