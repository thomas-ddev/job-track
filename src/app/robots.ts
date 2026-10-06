import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // L'espace applicatif protégé n'a aucun intérêt à être indexé (pages
        // privées derrière connexion) — seules la page d'accueil, /login et
        // /register le sont.
        disallow: ["/dashboard", "/applications", "/kanban"],
      },
    ],
  };
}
