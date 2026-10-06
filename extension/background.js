const API_BASE = "https://jobs.thomasdubrez.fr";
const LOG_PREFIX = "[JobTrack]";

async function getToken() {
  const { apiToken } = await browser.storage.local.get("apiToken");
  return apiToken ?? null;
}

// Injectée dans l'onglet actif : tourne dans le contexte de la page (donc
// après connexion sur LinkedIn/Jobgether/etc.), récupère juste le texte
// visible. Le tri entre contenu utile et navigation/menus est laissé à
// l'extraction côté serveur (le prompt Groq est déjà conçu pour ignorer le
// bruit, voir src/lib/job-posting-extraction.ts côté app).
function scrapeJobPage() {
  return {
    url: window.location.href,
    pageText: document.body ? document.body.innerText : "",
  };
}

async function addCurrentTabToJobTrack() {
  console.log(`${LOG_PREFIX} Démarrage de l'ajout...`);

  const token = await getToken();
  if (!token) {
    console.error(`${LOG_PREFIX} Aucun jeton configuré.`);
    return {
      ok: false,
      error: "Aucun jeton configuré. Renseigne-le dans le popup de l'extension.",
    };
  }

  const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) {
    console.error(`${LOG_PREFIX} Aucun onglet actif détecté.`);
    return { ok: false, error: "Impossible de déterminer l'onglet actif." };
  }

  let scraped;
  try {
    const [result] = await browser.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: scrapeJobPage,
    });
    scraped = result?.result;
    console.log(
      `${LOG_PREFIX} Page scrapée :`,
      scraped?.url,
      `(${scraped?.pageText?.length ?? 0} caractères)`,
    );
  } catch (error) {
    console.error(`${LOG_PREFIX} Échec du scraping de la page :`, error);
    return { ok: false, error: "Impossible de lire le contenu de cette page." };
  }

  if (!scraped?.pageText) {
    console.error(`${LOG_PREFIX} Page sans texte exploitable.`);
    return { ok: false, error: "Cette page ne contient pas de texte exploitable." };
  }

  let response;
  try {
    console.log(`${LOG_PREFIX} Envoi à ${API_BASE}/api/extension/extract...`);
    response = await fetch(`${API_BASE}/api/extension/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: scraped.url, pageText: scraped.pageText }),
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} Impossible de contacter JobTrack :`, error);
    return { ok: false, error: "Impossible de contacter JobTrack." };
  }

  console.log(`${LOG_PREFIX} Réponse serveur : ${response.status}`);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    console.error(`${LOG_PREFIX} Erreur serveur :`, response.status, body);
    return { ok: false, error: body?.error ?? `Erreur serveur (${response.status}).` };
  }

  const data = await response.json();
  const appUrl = `${API_BASE}${data.path}`;
  console.log(`${LOG_PREFIX} Candidature créée :`, appUrl);
  await browser.tabs.create({ url: appUrl });

  return { ok: true, url: appUrl };
}

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "ADD_CURRENT_TAB") {
    return addCurrentTabToJobTrack();
  }
  return undefined;
});
