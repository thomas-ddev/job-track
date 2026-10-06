const setupSection = document.getElementById("setup");
const mainSection = document.getElementById("main");
const tokenInput = document.getElementById("token");
const statusEl = document.getElementById("status");

function setStatus(message, kind) {
  statusEl.textContent = message ?? "";
  statusEl.className = kind ?? "";
}

async function refreshView() {
  const { apiToken } = await browser.storage.local.get("apiToken");
  if (apiToken) {
    setupSection.classList.add("hidden");
    mainSection.classList.remove("hidden");
  } else {
    setupSection.classList.remove("hidden");
    mainSection.classList.add("hidden");
  }
}

document.getElementById("save-token").addEventListener("click", async () => {
  const value = tokenInput.value.trim();
  if (!value) {
    setStatus("Colle d'abord un jeton.", "error");
    return;
  }
  await browser.storage.local.set({ apiToken: value });
  tokenInput.value = "";
  setStatus("Jeton enregistré.", "success");
  await refreshView();
});

document.getElementById("reconfigure").addEventListener("click", async () => {
  await browser.storage.local.remove("apiToken");
  setStatus("", "");
  await refreshView();
});

document.getElementById("add-tab").addEventListener("click", async () => {
  const addButton = document.getElementById("add-tab");
  setStatus("Extraction en cours...", "");
  addButton.disabled = true;

  const result = await browser.runtime.sendMessage({ type: "ADD_CURRENT_TAB" });

  addButton.disabled = false;

  if (result?.ok) {
    setStatus("Candidature ajoutée, onglet ouvert.", "success");
  } else {
    setStatus(result?.error ?? "Une erreur est survenue.", "error");
  }
});

refreshView();
