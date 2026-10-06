import type { DefaultSession } from "next-auth";

// Augmente les types d'Auth.js pour refléter le champ "id" que l'on ajoute
// explicitement à la session dans le callback `session` de src/auth.ts.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
