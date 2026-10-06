// Nettoyage minimal, volontairement sans dépendance (pas de cheerio/jsdom) :
// on retire scripts/styles, on dépouille les balises, on décode les entités
// les plus courantes et on compresse les espaces. Suffisant pour fournir du
// texte exploitable à un LLM, pas pour du scraping structuré précis.
const ENTITY_PATTERN = /&amp;|&lt;|&gt;|&quot;|&#39;|&apos;|&nbsp;/g;

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function decodeEntities(value: string): string {
  return value.replace(ENTITY_PATTERN, (match) => ENTITY_MAP[match] ?? match);
}

export function htmlToText(html: string, maxLength = 15000): string {
  const withoutNonContent = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const withLineBreaks = withoutNonContent.replace(/<\/(p|div|li|br|h[1-6]|tr)>/gi, "\n");

  const withoutTags = withLineBreaks.replace(/<[^>]+>/g, " ");

  const decoded = decodeEntities(withoutTags);

  const collapsed = decoded
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");

  return collapsed.slice(0, maxLength);
}
