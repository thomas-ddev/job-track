# Extension JobTrack — Ajout rapide

Ajoute en un clic l'offre affichée dans l'onglet actif à JobTrack, y compris sur des pages qui
nécessitent une connexion (LinkedIn Jobs...) : l'extension lit le texte déjà affiché dans ton
navigateur connecté, là où un `fetch` côté serveur se heurterait à un mur de connexion.

## Installation (temporaire, non publiée sur addons.mozilla.org)

1. Ouvre `about:debugging#/runtime/this-firefox` dans Firefox.
2. Clique sur « Charger un module complémentaire temporaire… ».
3. Sélectionne `extension/manifest.json` dans ce dépôt.
4. L'icône JobTrack apparaît dans la barre d'outils.

Firefox décharge les extensions temporaires à la fermeture du navigateur : il faudra la
recharger à chaque session, sauf si tu la fais signer par Mozilla pour une installation durable.

## Configuration

1. Sur JobTrack, va dans **Réglages** et clique sur « Générer un jeton ». Copie-le (affiché une
   seule fois).
2. Ouvre le popup de l'extension, colle le jeton dans le champ et clique sur « Enregistrer ».

## Utilisation

Sur une offre d'emploi (LinkedIn, Jobgether, Free-Work, Collective, Freelance-Informatique, ou
tout autre site), clique sur l'icône JobTrack puis sur « Ajouter cette offre à JobTrack ».
L'extension récupère le texte de la page, l'envoie à JobTrack qui l'analyse via Groq et crée
directement une candidature (statut « Envoyée »). Un nouvel onglet s'ouvre sur la fiche créée
pour vérification/complément.
