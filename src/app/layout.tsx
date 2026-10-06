import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Suivez vos candidatures, votre pipeline Kanban et vos statistiques de recherche d'emploi en un seul endroit.";

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "JobTrack — Suivi de candidatures",
  },
  description: DESCRIPTION,
  // Pas de metadataBase : le projet n'a pas encore d'URL de déploiement
  // publique stable (voir README). openGraph/twitter restent utiles tels
  // quels pour un aperçu de lien correct une fois le projet déployé.
  openGraph: {
    title: "JobTrack — Suivi de candidatures",
    description: DESCRIPTION,
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "JobTrack — Suivi de candidatures",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-950 font-sans text-slate-50">
        {children}
      </body>
    </html>
  );
}
