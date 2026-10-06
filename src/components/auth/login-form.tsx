"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";

import { loginAction } from "@/server/actions/auth";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_PASSWORD } from "@/lib/demo-account";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Remplit les champs avec le compte de démonstration puis soumet le
  // formulaire via la même Server Action que la connexion manuelle (pas de
  // chemin de connexion séparé à maintenir) : un visiteur peut explorer
  // l'application en un clic, sans avoir à chercher les identifiants dans le
  // README.
  function fillAndSubmitDemoAccount() {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("email") as HTMLInputElement).value = DEMO_ACCOUNT_EMAIL;
    (form.elements.namedItem("password") as HTMLInputElement).value = DEMO_ACCOUNT_PASSWORD;
    form.requestSubmit();
  }

  return (
    <form ref={formRef} action={action} className="flex w-full max-w-sm flex-col gap-4">
      <button
        type="button"
        onClick={fillAndSubmitDemoAccount}
        disabled={pending}
        className="rounded-md border border-sky-800 bg-sky-950/40 px-4 py-2 text-sm font-medium text-sky-300 transition-colors hover:bg-sky-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Essayer avec le compte de démonstration
      </button>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <div className="h-px flex-1 bg-slate-800" />
        ou connectez-vous
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      <FormField
        id="email"
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        errors={state?.errors?.email}
      />

      <FormField
        id="password"
        name="password"
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        errors={state?.errors?.password}
      />

      {state?.message && (
        <p role="alert" className="text-sm text-red-400">
          {state.message}
        </p>
      )}

      <SubmitButton pending={pending}>Se connecter</SubmitButton>

      <p className="text-sm text-slate-400">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-sky-400 hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
