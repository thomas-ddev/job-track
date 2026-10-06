import { SiteFooter } from "@/components/layout/site-footer";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950">
      <AnimatedBackground />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <h1 className="text-2xl font-semibold text-slate-50">JobTrack</h1>
        </div>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
