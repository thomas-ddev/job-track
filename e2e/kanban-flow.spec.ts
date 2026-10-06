import { expect, test } from "@playwright/test";

import { E2E_USER_EMAIL, E2E_USER_PASSWORD } from "./global-setup";

// Parcours critique de l'application, de bout en bout : connexion ->
// création d'une candidature -> déplacement dans le Kanban. Le compte utilisé
// est créé par e2e/global-setup.ts directement en base (voir ce fichier pour
// le choix de ne pas repasser par le formulaire d'inscription ici).
test("connexion, création d'une candidature puis déplacement dans le Kanban", async ({ page }) => {
  const company = `Test Company ${Date.now()}`;
  const position = "Développeur E2E";

  await page.goto("/login");
  await page.getByLabel("E-mail").fill(E2E_USER_EMAIL);
  await page.getByLabel("Mot de passe").fill(E2E_USER_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/applications/new");
  await page.getByLabel("Entreprise").fill(company);
  await page.getByLabel("Poste").fill(position);
  // Statut par défaut du formulaire : "À postuler". La candidature doit donc
  // apparaître dans cette colonne du Kanban une fois créée.
  await page.getByRole("button", { name: "Créer la candidature" }).click();

  // Après création, redirection vers la fiche détaillée.
  await expect(page).toHaveURL(/\/applications\/[a-z0-9]+$/);
  await expect(page.getByRole("heading", { name: position })).toBeVisible();

  await page.goto("/kanban");

  const cardLink = page.getByRole("link", { name: position });
  await expect(cardLink).toBeVisible();

  // Le Kanban est un composant client (KanbanBoard) qui doit s'hydrater avant
  // que son gestionnaire `onChange` ne soit attaché au <select> de statut.
  // `networkidle` seul n'est pas un signal fiable (le réseau peut être calme
  // avant la fin de l'hydratation React, en particulier avec Turbopack qui
  // compile certaines routes à la demande) : on attend le marqueur
  // `data-hydrated="true"` posé par un `useEffect` dans KanbanBoard, qui ne
  // peut s'exécuter qu'une fois le composant réellement monté côté client.
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

  // Déplacement via le <select> accessible de la carte plutôt qu'en simulant
  // un vrai glisser-déposer à la souris : les deux chemins appellent la même
  // Server Action (changeApplicationStatusAction, voir
  // src/components/kanban/kanban-card.tsx), et le select est un moyen fiable
  // et non flaky de déclencher ce changement en test automatisé.
  const statusSelect = page.getByLabel(`Changer le statut de ${position} chez ${company}`);

  // La mise à jour est optimiste côté client (changeApplicationStatusAction
  // s'exécute dans un startTransition, voir KanbanBoard.moveCard) : sans
  // attendre explicitement la réponse de cette Server Action, `page.reload()`
  // peut gagner la course sur un runner plus lent (CI) et recharger avant que
  // l'écriture en base n'ait eu lieu, faisant échouer l'assertion suivante de
  // façon intermittente.
  await Promise.all([
    page.waitForResponse(
      (response) => response.request().method() === "POST" && response.url().includes("/kanban"),
    ),
    statusSelect.selectOption("INTERVIEW"),
  ]);

  // Persistée en base : on recharge la page pour vérifier que le changement
  // de statut a bien survécu, pas seulement l'état React local.
  await page.reload();
  const interviewColumn = page.getByRole("heading", { name: "Entretien" }).locator("xpath=..");
  await expect(interviewColumn.getByRole("link", { name: position })).toBeVisible();
});
