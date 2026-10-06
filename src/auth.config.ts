import type { NextAuthConfig } from "next-auth";

// Configuration partagée entre src/auth.ts (instance complète, avec le
// provider Credentials qui dépend de Prisma et bcrypt) et src/proxy.ts
// (instance légère utilisée uniquement pour décoder le cookie de session).
// Séparer les deux évite que le Proxy — exécuté sur chaque requête — embarque
// le client Prisma et bcrypt dans son bundle alors qu'il n'a besoin que de
// vérifier la présence d'un JWT valide.
export const authConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
