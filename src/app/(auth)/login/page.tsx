import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion — JobTrack",
};

export default function LoginPage() {
  return (
    <>
      <h2 className="text-lg font-medium text-slate-300">Connexion</h2>
      <LoginForm />
    </>
  );
}
