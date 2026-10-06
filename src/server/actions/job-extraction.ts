"use server";

import { z } from "zod";

import { verifySession } from "@/lib/dal";
import { htmlToText } from "@/lib/html-to-text";
import { callGroqChatCompletion } from "@/lib/groq";
import { buildExtractionMessages, parseExtractionResponse } from "@/lib/job-posting-extraction";
import type { JobExtractionData } from "@/schemas/job-extraction";

const urlSchema = z.url({ error: "Le lien n'est pas une URL valide." });

export type JobExtractionResult =
  { success: true; data: JobExtractionData } | { success: false; error: string };

// Pré-remplissage assisté par IA : on récupère la page de l'offre côté
// serveur, on la réduit à du texte, puis on demande à Groq d'en extraire des
// champs structurés. Le résultat n'est jamais écrit en base directement : il
// ne fait que pré-remplir le formulaire de création, que l'utilisateur
// valide ou corrige avant soumission.
export async function extractJobPostingAction(rawUrl: string): Promise<JobExtractionResult> {
  await verifySession();

  const parsedUrl = urlSchema.safeParse(rawUrl);
  if (!parsedUrl.success) {
    return { success: false, error: "Le lien n'est pas une URL valide." };
  }

  let html: string;
  try {
    const response = await fetch(parsedUrl.data, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JobTrackBot/1.0; +https://jobs.thomasdubrez.fr)",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return { success: false, error: `La page a répondu avec le statut ${response.status}.` };
    }
    html = await response.text();
  } catch {
    return {
      success: false,
      error: "Impossible de récupérer cette page (lien invalide, site hors ligne ou bloquant).",
    };
  }

  const pageText = htmlToText(html);
  if (pageText.length < 50) {
    return { success: false, error: "La page ne contient pas assez de texte exploitable." };
  }

  try {
    const content = await callGroqChatCompletion({
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: buildExtractionMessages(pageText, parsedUrl.data),
    });
    const data = parseExtractionResponse(content);
    return { success: true, data };
  } catch {
    return {
      success: false,
      error: "L'extraction automatique a échoué. Remplis le formulaire manuellement.",
    };
  }
}
