const API_BASE = "https://jobs.thomasdubrez.fr";

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
  const token = await getToken();
  if (!token) {
    return {
      ok: false,
      error: "Aucun jeton configuré. Renseigne-le dans le popup de l'extension.",
    };
  }

  const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) {
    return { ok: false, error: "Impossible de déterminer l'onglet actif." };
  }

  let scraped;
  try {
    const [result] = await browser.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: scrapeJobPage,
    });
    scraped = result?.result;
  } catch {
    return { ok: false, error: "Impossible de lire le contenu de cette page." };
  }

  if (!scraped?.pageText) {
    return { ok: false, error: "Cette page ne contient pas de texte exploitable." };
  }

  let response;
  try {
    response = await fetch(`${API_BASE}/api/extension/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: scraped.url, pageText: scraped.pageText }),
    });
  } catch {
    return { ok: false, error: "Impossible de contacter JobTrack." };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, error: body?.error ?? `Erreur serveur (${response.status}).` };
  }

  const data = await response.json();
  const appUrl = `${API_BASE}${data.path}`;
  await browser.tabs.create({ url: appUrl });

  return { ok: true, url: appUrl };
}

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "ADD_CURRENT_TAB") {
    return addCurrentTabToJobTrack();
  }
  return undefined;
});
