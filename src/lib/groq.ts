import "server-only";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

type GroqMessage = { role: "system" | "user"; content: string };

type GroqChatPayload = {
  messages: GroqMessage[];
  model?: string;
  temperature?: number;
  response_format?: { type: "json_object" };
};

// Plusieurs clés Groq (quota gratuit par clé) peuvent être fournies, séparées
// par des virgules, pour retenter automatiquement avec une autre clé en cas
// de 429 (quota épuisé) plutôt que de faire échouer l'extraction.
function getApiKeys(): string[] {
  const raw = process.env.GROQ_API_KEYS ?? process.env.GROQ_API_KEY ?? "";
  const keys = raw
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  if (keys.length === 0) {
    throw new Error("Aucune clé Groq configurée (GROQ_API_KEYS).");
  }
  return keys;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = temp;
  }
  return copy;
}

export async function callGroqChatCompletion(payload: GroqChatPayload): Promise<string> {
  const keys = shuffle(getApiKeys());
  const body = JSON.stringify({ model: DEFAULT_MODEL, ...payload });

  let lastErrorMessage = "Appel Groq impossible.";

  for (const key of keys) {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body,
      signal: AbortSignal.timeout(15_000),
    });

    if (response.ok) {
      const json = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = json.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        throw new Error("Réponse Groq inattendue.");
      }
      return content;
    }

    lastErrorMessage = `Groq a répondu ${response.status}.`;
    // On ne retente avec une autre clé que sur 429 (quota) : les autres
    // erreurs (400, 401...) ne seront pas résolues en changeant de clé.
    if (response.status !== 429) {
      break;
    }
  }

  throw new Error(lastErrorMessage);
}
