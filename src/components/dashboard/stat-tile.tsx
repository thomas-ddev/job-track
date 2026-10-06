type StatTileProps = {
  label: string;
  value: string;
  helperText?: string;
};

// Contrat "stat tile" de la skill dataviz : un label en phrase (sans deux-points
// final), une valeur en chiffres proportionnels (pas tabulaires — c'est une
// grande valeur isolée, pas une colonne de tableau à aligner), pas de
// décoration superflue.
export function StatTile({ label, value, helperText }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-3xl font-semibold text-slate-50">{value}</span>
      {helperText && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
}
