import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { authConfig } from "@/auth.config";

// Instance Auth.js séparée de celle de src/auth.ts : authConfig ne déclare
// aucun provider, donc ni Prisma ni bcrypt ne sont inclus dans le bundle du
// Proxy (voir le commentaire dans src/auth.config.ts). Décoder le JWT de
// session ne nécessite pas d'accès à la base de données.
const { auth } = NextAuth(authConfig);

// Contrôle "optimiste" uniquement : on lit le JWT de session pour rediriger
// rapidement, sans toucher la base de données (le Proxy tourne sur chaque
// requête, y compris les navigations préchargées — une requête base de
// données ici serait un problème de performance).
// Ce n'est PAS la protection principale : chaque Server Action et chaque
// accès aux données revérifie la session via src/lib/dal.ts. Si ce fichier
// était supprimé ou mal configuré, l'application resterait sécurisée — elle
// perdrait seulement la redirection anticipée.
const PROTECTED_PREFIXES = ["/dashboard", "/applications", "/kanban"];
const AUTH_PAGES = ["/login", "/register"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
