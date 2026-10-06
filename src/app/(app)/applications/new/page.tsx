import type { Metadata } from "next";

import { ApplicationForm } from "@/components/applications/application-form";

export const metadata: Metadata = {
  title: "Nouvelle candidature — JobTrack",
};

export default function NewApplicationPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-50">Nouvelle candidature</h1>
      <ApplicationForm mode="create" />
    </div>
  );
}
