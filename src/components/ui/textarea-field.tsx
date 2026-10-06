type TextareaFieldProps = {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
  errors?: string[];
};

export function TextareaField({
  id,
  name,
  label,
  defaultValue,
  rows = 4,
  errors,
}: TextareaFieldProps) {
  const errorId = `${id}-error`;
  const hasError = Boolean(errors?.length);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className="resize-y rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500 aria-invalid:border-red-500"
      />
      {hasError && (
        <p id={errorId} className="text-sm text-red-400">
          {errors?.join(" ")}
        </p>
      )}
    </div>
  );
}
