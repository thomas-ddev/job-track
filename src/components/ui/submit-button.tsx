type SubmitButtonProps = {
  pending: boolean;
  children: React.ReactNode;
};

export function SubmitButton({ pending, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="rounded-md bg-sky-600 px-4 py-2 font-medium text-white transition-colors hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Patientez…" : children}
    </button>
  );
}
