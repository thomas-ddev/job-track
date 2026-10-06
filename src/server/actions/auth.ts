"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { signUpSchema, signInSchema } from "@/schemas/auth";

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

const BCRYPT_COST_FACTOR = 12;

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, password } = validated.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { errors: { email: ["Un compte existe déjà avec cette adresse e-mail."] } };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);
  await db.user.create({ data: { name, email, passwordHash } });

  // Connecte directement l'utilisateur après l'inscription plutôt que de le
  // renvoyer vers l'écran de connexion : une étape de moins, et on évite de
  // lui demander un mot de passe qu'il vient de saisir à l'instant.
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    // next-auth lève une redirection interne (NEXT_REDIRECT) via une erreur :
    // il faut la laisser remonter, sinon la redirection ne se produit jamais.
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { message: "Compte créé, mais la connexion automatique a échoué." };
    }
    throw error;
  }

  return undefined;
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      ...validated.data,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { message: "E-mail ou mot de passe incorrect." };
    }
    throw error;
  }

  return undefined;
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
