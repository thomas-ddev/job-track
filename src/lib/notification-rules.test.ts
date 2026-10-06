import { describe, expect, it } from "vitest";

import {
  buildFollowUpNudgeMessage,
  buildNewApplicationsNudgeMessage,
  shouldNudgeFollowUp,
  shouldNudgeNewApplications,
} from "@/lib/notification-rules";

const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date("2026-10-15T12:00:00Z");

describe("shouldNudgeNewApplications", () => {
  it("returns false when there is no application at all", () => {
    expect(shouldNudgeNewApplications(null, now)).toBe(false);
  });

  it("returns false for a recent application", () => {
    const recent = new Date(now.getTime() - 3 * DAY_MS);
    expect(shouldNudgeNewApplications(recent, now)).toBe(false);
  });

  it("returns true once the last application is 7+ days old", () => {
    const old = new Date(now.getTime() - 7 * DAY_MS);
    expect(shouldNudgeNewApplications(old, now)).toBe(true);
    const older = new Date(now.getTime() - 20 * DAY_MS);
    expect(shouldNudgeNewApplications(older, now)).toBe(true);
  });
});

describe("shouldNudgeFollowUp", () => {
  it("returns false when there is nothing stale", () => {
    expect(shouldNudgeFollowUp(0)).toBe(false);
  });

  it("returns true when at least one application is stale", () => {
    expect(shouldNudgeFollowUp(1)).toBe(true);
    expect(shouldNudgeFollowUp(5)).toBe(true);
  });
});

describe("message builders", () => {
  it("pluralizes the follow-up message", () => {
    expect(buildFollowUpNudgeMessage(1)).toContain("1 candidature envoyée attend");
    expect(buildFollowUpNudgeMessage(3)).toContain("3 candidatures envoyées attendent");
  });

  it("returns a non-empty new-applications message", () => {
    expect(buildNewApplicationsNudgeMessage().length).toBeGreaterThan(0);
  });
});
