"use client";

import { useActionState } from "react";
import Link from "next/link";

import { loginAction } from "@/server/actions/auth";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
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
