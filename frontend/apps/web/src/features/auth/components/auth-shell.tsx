import Link from "next/link";

export const fieldClass = "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/15";
export const buttonClass = "w-full rounded-md bg-yellow-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60";

export function AuthShell({ title, subtitle, children }: Readonly<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-yellow-400 p-4">
      <section className="w-full max-w-md rounded-md border border-white/10 bg-zinc-950 p-7 text-white shadow-2xl">
        <Link href="/" className="text-lg font-extrabold">Marweld Peru S.A.C.</Link>
        <div className="my-5 border-t border-white/10 pt-5">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-white/50">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}

export function FormError({ message }: { message: string | null }) {
  return message ? <p role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{message}</p> : null;
}
