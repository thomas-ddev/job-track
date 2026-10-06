# Extension JobTrack — Ajout rapide

Ajoute en un clic l'offre affichée dans l'onglet actif à JobTrack, y compris sur des pages qui
nécessitent une connexion (LinkedIn Jobs...) : l'extension lit le texte déjà affiché dans ton
navigateur connecté, là où un `fetch` côté serveur se heurterait à un mur de connexion.

## Installation

Cette extension n'est pas publiée sur addons.mozilla.org, donc pas signée par Mozilla. Deux
façons de l'installer :

### Option A — Temporaire, sur n'importe quel Firefox (recommandé)

1. Ouvre `about:debugging#/runtime/this-firefox` dans Firefox.
2. Clique sur « Charger un module complémentaire temporaire… ».
3. Sélectionne `extension/manifest.json` dans ce dépôt (ou `extension/dist/jobtrack-extension.xpi`
   après avoir lancé `./scripts/build-extension.sh`).
4. L'icône JobTrack apparaît dans la barre d'outils.

Firefox décharge les extensions temporaires à la fermeture du navigateur : il faudra la
recharger à chaque session.

### Option B — Installation persistante du fichier `.xpi` (nécessite Firefox Developer Edition,

Nightly, ou ESR)

Firefox grand public refuse d'installer un `.xpi` non signé de façon permanente, même en
double-cliquant dessus. Sur Developer Edition/Nightly/ESR :

1. Génère le fichier : `./scripts/build-extension.sh` (produit
   `extension/dist/jobtrack-extension.xpi`).
2. Va dans `about:config`, mets `xpinstall.signatures.required` à `false`.
3. Va dans `about:addons` → engrenage → « Installer un module depuis un fichier » → sélectionne
   le `.xpi`.

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

## Déboguer

En cas d'erreur ("Impossible d'enregistrer la candidature.", etc.) :

1. Va sur `about:debugging#/runtime/this-firefox`, repère JobTrack puis clique sur
   « Inspecter » : ça ouvre les DevTools du script d'arrière-plan (`background.js`), qui logue
   chaque étape (scraping, appel réseau, réponse du serveur) avec le préfixe `[JobTrack]`.
2. Si l'erreur vient du serveur (statut 500/502), le détail complet est dans les logs de l'app :
   `ssh saas-core01 "journalctl --user -u job-track -n 100 --no-pager"`.
