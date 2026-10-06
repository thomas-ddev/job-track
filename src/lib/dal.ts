import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

// Centralise la vérification de session : tout code serveur qui a besoin de
// savoir "qui est l'utilisateur courant" passe par cette fonction plutôt que
// d'appeler auth() directement, pour qu'il n'existe qu'un seul endroit où la
// règle "pas de session => redirection vers /login" est définie.
// `cache()` mémoïse le résultat pour la durée d'un rendu : plusieurs appels
// dans l'arbre de composants d'une même requête ne déclenchent qu'une seule
// vérification.
export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return { userId: session.user.id };
});

// Variante qui ne redirige pas : utile pour les pages publiques qui affichent
// un contenu différent selon qu'un utilisateur est connecté ou non (ex. page
// d'accueil), sans forcer une redirection.
export const getOptionalSession = cache(async () => {
  const session = await auth();
  return session?.user?.id ? { userId: session.user.id } : null;
});
