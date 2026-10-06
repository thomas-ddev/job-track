import { SiteFooter } from "@/components/layout/site-footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-2xl font-semibold text-slate-50">JobTrack</h1>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
