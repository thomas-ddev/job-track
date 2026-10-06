export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-950 px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-50">JobTrack</h1>
      {children}
    </main>
  );
}
