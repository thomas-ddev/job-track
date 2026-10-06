import { jobExtractionDataSchema, type JobExtractionData } from "@/schemas/job-extraction";

const SYSTEM_PROMPT = `Tu es un assistant qui extrait les informations structurées d'une offre d'emploi ou de mission freelance à partir d'un texte brut scrapé depuis une page web (le texte peut contenir du contenu de navigation sans rapport, à ignorer).

Réponds uniquement avec un objet JSON valide, sans aucun texte autour, au format exact suivant :
{
  "company": string ou null,
  "position": string ou null,
  "location": string ou null,
  "contractType": string ou null (ex: "CDI", "Freelance", "CDD", "Alternance"),
  "remote": string ou null (ex: "100% remote", "Hybride", "Sur site"),
  "salary": nombre entier ou null (salaire annuel brut en euros ; laisse null si inconnu ou exprimé en TJM/jour),
  "technologies": tableau de chaînes courtes (compétences/technologies mentionnées, ex "React", "Node.js"),
  "summary": string ou null (résumé du poste/de la mission en 3 à 5 phrases, en français)
}

Si une information est absente ou incertaine, mets null (tableau vide pour technologies). N'invente rien.`;

export function buildExtractionMessages(pageText: string, sourceUrl: string) {
  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `URL source : ${sourceUrl}\n\nContenu de la page :\n${pageText}`,
    },
  ];
}

export function parseExtractionResponse(rawContent: string): JobExtractionData {
  const parsed: unknown = JSON.parse(rawContent);
  return jobExtractionDataSchema.parse(parsed);
}

// Les champs sans colonne dédiée dans le modèle Application (lieu, type de
// contrat, télétravail, résumé) sont regroupés dans les notes plutôt que
// d'ajouter des colonnes pour une fonctionnalité qui reste une aide au
// pré-remplissage, pas une source de vérité structurée.
export function extractionToNotes(data: JobExtractionData): string {
  const lines: string[] = [];
  if (data.location) lines.push(`Lieu : ${data.location}`);
  if (data.contractType) lines.push(`Contrat : ${data.contractType}`);
  if (data.remote) lines.push(`Télétravail : ${data.remote}`);
  if (data.summary) {
    if (lines.length > 0) lines.push("");
    lines.push(data.summary);
  }
  return lines.join("\n");
}
