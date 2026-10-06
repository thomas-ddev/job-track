"use client";

import { useActionState } from "react";
import Link from "next/link";

import { registerAction } from "@/server/actions/auth";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <FormField
        id="name"
        name="name"
        label="Nom"
        autoComplete="name"
        errors={state?.errors?.name}
      />

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
        autoComplete="new-password"
        errors={state?.errors?.password}
      />

      {state?.message && (
        <p role="alert" className="text-sm text-red-400">
          {state.message}
        </p>
      )}

      <SubmitButton pending={pending}>Créer mon compte</SubmitButton>

      <p className="text-sm text-slate-400">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-sky-400 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
