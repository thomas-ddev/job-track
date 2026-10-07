// Utilise le service de favicons de Google plutôt que de récupérer et
// stocker nous-mêmes les icônes : pas de fetch serveur (risque SSRF sur une
// URL fournie par l'utilisateur), pas de stockage, et un fallback déjà géré
// (icône générique si le site n'a pas de favicon) plutôt qu'une image cassée.
export function getFaviconUrl(jobUrl: string | null | undefined, size = 32): string | null {
  if (!jobUrl) return null;

  let hostname: string;
  let protocol: string;
  try {
    ({ hostname, protocol } = new URL(jobUrl));
  } catch {
    return null;
  }
  if (protocol !== "http:" && protocol !== "https:") return null;

  return `https://www.google.com/s2/favicons?sz=${size}&domain=${encodeURIComponent(hostname)}`;
}
