type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string | number;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  errors?: string[];
  // Élément optionnel affiché à côté du label (ex. un lien "ouvrir dans un
  // nouvel onglet" pour le champ "Lien de l'offre") : évite de dupliquer le
  // balisage label/input accessible de FormField pour ce seul besoin.
  labelAddon?: React.ReactNode;
  // Élément optionnel affiché à droite de l'input, dans le même conteneur
  // (ex. favicon du lien de l'offre).
  trailingAddon?: React.ReactNode;
};

// Composant volontairement minimal : associe toujours le <label> à son champ
// via htmlFor/id (accessibilité) et relie les erreurs au champ avec
// aria-describedby + aria-invalid, pour que les lecteurs d'écran annoncent
// l'erreur au moment où l'utilisateur atteint le champ, pas seulement
// visuellement.
export function FormField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  required = true,
  defaultValue,
  value,
  onChange,
  placeholder,
  errors,
  labelAddon,
  trailingAddon,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const hasError = Boolean(errors?.length);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-200">
          {label}
        </label>
        {labelAddon}
      </div>
      <div className="flex items-center gap-2">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 ring-offset-2 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500 aria-invalid:border-red-500"
        />
        {trailingAddon}
      </div>
      {hasError && (
        <p id={errorId} className="text-sm text-red-400">
          {errors?.join(" ")}
        </p>
      )}
    </div>
  );
}
