// Formate une Date en valeur acceptée par <input type="date"> (YYYY-MM-DD),
// en heure locale plutôt que via toISOString() (qui bascule en UTC et peut
// décaler le jour affiché selon le fuseau du serveur). parseDateInputValue
// fait l'opération inverse, avec la même convention, pour que l'aller-retour
// affichage -> édition -> enregistrement soit stable.
export function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
