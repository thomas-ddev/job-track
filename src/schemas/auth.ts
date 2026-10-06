import { z } from "zod";

// Règle de mot de passe volontairement simple (longueur minimale uniquement) :
// des contraintes de complexité (majuscule, symbole, etc.) n'empêchent pas les
// mots de passe faibles et nuisent à l'utilisabilité. La longueur minimale est
// le facteur qui a le plus d'impact réel sur la résistance au brute-force.
const email = z.email({ error: "Adresse e-mail invalide." }).trim().toLowerCase();
const password = z
  .string()
  .min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." });

export const signUpSchema = z.object({
  name: z.string().trim().min(1, { error: "Le nom est requis." }).max(100),
  email,
  password,
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: "Le mot de passe est requis." }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
