type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  errors?: string[];
  // Élément optionnel affiché à côté du label (ex. un lien "ouvrir dans un
  // nouvel onglet" pour le champ "Lien de l'offre") : évite de dupliquer le
  // balisage label/input accessible de FormField pour ce seul besoin.
  labelAddon?: React.ReactNode;
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
  placeholder,
  errors,
  labelAddon,
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
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 ring-offset-2 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500 aria-invalid:border-red-500"
      />
      {hasError && (
        <p id={errorId} className="text-sm text-red-400">
          {errors?.join(" ")}
        </p>
      )}
    </div>
  );
}
