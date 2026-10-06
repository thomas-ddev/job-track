import { describe, expect, it } from "vitest";

import {
  buildExtractionMessages,
  extractionToNotes,
  parseExtractionResponse,
} from "@/lib/job-posting-extraction";

describe("buildExtractionMessages", () => {
  it("includes the source URL and page text in the user message", () => {
    const messages = buildExtractionMessages("Développeur React", "https://example.com/job/1");

    const [systemMessage, userMessage] = messages;

    expect(messages).toHaveLength(2);
    expect(systemMessage?.role).toBe("system");
    expect(userMessage?.role).toBe("user");
    expect(userMessage?.content).toContain("https://example.com/job/1");
    expect(userMessage?.content).toContain("Développeur React");
  });
});

describe("parseExtractionResponse", () => {
  it("parses a valid JSON payload", () => {
    const raw = JSON.stringify({
      company: "Acme",
      position: "Développeur",
      location: "Paris",
      contractType: "CDI",
      remote: "Hybride",
      salary: 45000,
      technologies: ["React", "Node.js"],
      summary: "Un poste intéressant.",
    });

    expect(parseExtractionResponse(raw)).toEqual({
      company: "Acme",
      position: "Développeur",
      location: "Paris",
      contractType: "CDI",
      remote: "Hybride",
      salary: 45000,
      technologies: ["React", "Node.js"],
      summary: "Un poste intéressant.",
    });
  });

  it("throws on malformed JSON", () => {
    expect(() => parseExtractionResponse("not json")).toThrow();
  });

  it("throws when a required shape is violated", () => {
    expect(() => parseExtractionResponse(JSON.stringify({ company: 123 }))).toThrow();
  });
});

describe("extractionToNotes", () => {
  it("combines location, contract, remote and summary into readable notes", () => {
    const notes = extractionToNotes({
      company: null,
      position: null,
      location: "Paris",
      contractType: "CDI",
      remote: "Hybride",
      salary: null,
      technologies: [],
      summary: "Résumé du poste.",
    });

    expect(notes).toBe("Lieu : Paris\nContrat : CDI\nTélétravail : Hybride\n\nRésumé du poste.");
  });

  it("returns an empty string when nothing is available", () => {
    const notes = extractionToNotes({
      company: null,
      position: null,
      location: null,
      contractType: null,
      remote: null,
      salary: null,
      technologies: [],
      summary: null,
    });

    expect(notes).toBe("");
  });
});
