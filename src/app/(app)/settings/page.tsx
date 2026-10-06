import type { Metadata } from "next";

import { verifySession } from "@/lib/dal";
import { hasApiToken } from "@/server/data/users";
import { ApiTokenSection } from "@/components/settings/api-token-section";

export const metadata: Metadata = {
  title: "Réglages — JobTrack",
};

export default async function SettingsPage() {
  const { userId } = await verifySession();
  const tokenExists = await hasApiToken(userId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-50">Réglages</h1>
      <ApiTokenSection hasToken={tokenExists} />
    </div>
  );
}
