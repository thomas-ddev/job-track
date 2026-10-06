#!/bin/bash
# Empaquette extension/ en un .xpi (un .xpi n'est qu'un zip standard).
# Ce fichier n'est PAS signé par Mozilla : voir extension/README.md pour les
# limitations d'installation que ça implique sur Firefox grand public.
set -euo pipefail

cd "$(dirname "$0")/.."

OUT_DIR="extension/dist"
OUT_FILE="$OUT_DIR/jobtrack-extension.xpi"

mkdir -p "$OUT_DIR"
rm -f "$OUT_FILE"

cd extension
zip -r -X "../$OUT_FILE" manifest.json background.js popup.html popup.js popup.css

echo "Extension empaquetée : $OUT_FILE"
