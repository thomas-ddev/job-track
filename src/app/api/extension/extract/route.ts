import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { normalizePlainText } from "@/lib/html-to-text";
import { callGroqChatCompletion } from "@/lib/groq";
import {
  buildExtractionMessages,
  extractionToNotes,
  parseExtractionResponse,
} from "@/lib/job-posting-extraction";
import { authenticateApiToken } from "@/lib/extension-auth";
import { upsertTechnologyIds } from "@/server/actions/applications";
import { ApplicationStatus } from "@/generated/prisma";

// Seule route REST du projet (le reste passe par des Server Actions) : une
// extension navigateur ne peut pas invoquer le protocole RPC interne des
// Server Actions, elle a besoin d'un endpoint HTTP classique, authentifié par
// jeton plutôt que par cookie de session (voir src/lib/extension-auth.ts).
const bodySchema = z.object({
  url: z.url({ error: "URL invalide." }),
  pageText: z.string().trim().min(1).max(200_000),
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  const auth = await authenticateApiToken(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Jeton invalide ou manquant." },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  const json: unknown = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Requête invalide." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const pageText = normalizePlainText(parsed.data.pageText);

  const extracted = await callGroqChatCompletion({
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: buildExtractionMessages(pageText, parsed.data.url),
  })
    .then(parseExtractionResponse)
    .catch((error: unknown) => {
      console.error("[/api/extension/extract] Extraction Groq échouée :", error);
      return null;
    });

  if (!extracted) {
    return NextResponse.json(
      { error: "L'extraction automatique a échoué." },
      { status: 502, headers: CORS_HEADERS },
    );
  }

  const application = await db
    .$transaction(async (tx) => {
      const technologyIds = await upsertTechnologyIds(tx, extracted.technologies);

      const created = await tx.application.create({
        data: {
          userId: auth.userId,
          company: extracted.company ?? "Entreprise inconnue",
          position: extracted.position ?? "Poste inconnu",
          jobUrl: parsed.data.url,
          salary: extracted.salary ?? undefined,
          notes: extractionToNotes(extracted) || undefined,
          status: ApplicationStatus.APPLIED,
          technologies: { create: technologyIds.map((technologyId) => ({ technologyId })) },
        },
      });

      await tx.statusEvent.create({
        data: { applicationId: created.id, fromStatus: null, toStatus: created.status },
      });

      return created;
    })
    .catch((error: unknown) => {
      console.error("[/api/extension/extract] Création de la candidature échouée :", error);
      return null;
    });

  if (!application) {
    return NextResponse.json(
      { error: "Impossible d'enregistrer la candidature." },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");

  return NextResponse.json(
    { id: application.id, path: `/applications/${application.id}` },
    { status: 201, headers: CORS_HEADERS },
  );
}
