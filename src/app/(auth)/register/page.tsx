import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Créer un compte — JobTrack",
};

export default function RegisterPage() {
  return (
    <>
      <h2 className="text-lg font-medium text-slate-300">Créer un compte</h2>
      <RegisterForm />
    </>
  );
}
