"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "../../../shared/api/client";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { accountService, type AccountProfile } from "../services/account.service";

const cardClass = "rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)]";

function Icon({ children }: Readonly<{ children: React.ReactNode }>) {
  return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-black">{children}</span>;
}

function ActionCard({ href, title, detail, status, icon }: Readonly<{
  href?: string;
  title: string;
  detail: string;
  status: string;
  icon: React.ReactNode;
}>) {
  const content = <>
    <Icon>{icon}</Icon>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-white">{title}</h2><span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">{status}</span></div>
      <p className="mt-1 text-sm leading-5 text-white/50">{detail}</p>
    </div>
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white/30" aria-hidden="true"><path fillRule="evenodd" d="M7.22 4.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06L11.19 10 7.22 6.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
  </>;
  const className = "group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-yellow-400/35 hover:bg-white/[0.06]";
  return href ? <Link href={href} className={className}>{content}</Link> : <div className={`${className} cursor-not-allowed opacity-65`}>{content}</div>;
}

export function AccountPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.isInitialized);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!user) { router.replace("/login"); return; }
    void accountService.profile().then(setProfile).catch((cause) => {
      setError(cause instanceof ApiError ? cause.message : "No pudimos cargar los datos de tu cuenta.");
    });
  }, [initialized, router, user]);

  if (!initialized || !user) return null;
  const initials = user.nombre.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase();
  const memberSince = profile?.fechaRegistro
    ? new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" }).format(new Date(profile.fechaRegistro))
    : null;

  return <section className="min-h-[calc(100vh-8rem)] bg-zinc-950 px-4 py-8 text-white sm:py-12">
    <div className="mx-auto max-w-6xl">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-yellow-400/10 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-yellow-400/20" />
        <div className="pointer-events-none absolute -right-2 -top-5 h-32 w-32 rounded-full bg-yellow-400/10 blur-2xl" />
        <p className="relative text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">Mi cuenta</p>
        <div className="relative mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-xl font-black text-black shadow-lg shadow-yellow-400/20">{initials}</div><div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hola, {user.nombre.split(" ")[0]}</h1><p className="mt-1 text-sm text-white/55">{profile?.correo ?? user.correo}{memberSince ? ` · Cliente desde ${memberSince}` : ""}</p></div></div>
          <Link href="/productos" className="inline-flex w-fit items-center gap-2 rounded-xl border border-yellow-400/40 bg-yellow-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300"><span>Explorar catálogo</span><span aria-hidden="true">→</span></Link>
        </div>
      </div>

      {error && <p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className={cardClass} aria-labelledby="perfil-title">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">Perfil</p><h2 id="perfil-title" className="mt-1 text-xl font-bold">Tus datos personales</h2></div><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">Cuenta activa</span></div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs uppercase tracking-wider text-white/35">Nombre</dt><dd className="mt-1 text-sm font-medium text-white">{profile?.nombre ?? user.nombre}</dd></div><div><dt className="text-xs uppercase tracking-wider text-white/35">Correo</dt><dd className="mt-1 break-all text-sm font-medium text-white">{profile?.correo ?? user.correo}</dd></div><div><dt className="text-xs uppercase tracking-wider text-white/35">Teléfono</dt><dd className="mt-1 text-sm font-medium text-white">{profile?.telefono || "No registrado"}</dd></div><div><dt className="text-xs uppercase tracking-wider text-white/35">Documento</dt><dd className="mt-1 text-sm font-medium text-white">{profile?.documento || "No registrado"}</dd></div></dl>
        </section>
        <section className={`${cardClass} border-yellow-400/15`} aria-labelledby="entrega-title">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">Entrega</p><h2 id="entrega-title" className="mt-1 text-xl font-bold">Dirección registrada</h2>
          <div className="mt-5 flex gap-3"><Icon><svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path fillRule="evenodd" d="M12 1.5A8.25 8.25 0 0 0 3.75 9.75c0 5.272 5.12 10.14 7.19 11.884a1.64 1.64 0 0 0 2.12 0c2.07-1.745 7.19-6.612 7.19-11.884A8.25 8.25 0 0 0 12 1.5Zm0 11.25a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" clipRule="evenodd" /></svg></Icon><p className="pt-1 text-sm leading-6 text-white/70">{profile?.direccion || "Aún no tienes una dirección registrada."}</p></div>
          <p className="mt-5 text-xs leading-5 text-white/40">La edición de direcciones estará disponible próximamente.</p>
        </section>
      </div>

      <section className="mt-7" aria-labelledby="accesos-title"><div className="mb-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">Accesos</p><h2 id="accesos-title" className="mt-1 text-xl font-bold">Gestiona tu cuenta</h2></div><div className="grid gap-4 md:grid-cols-3">
        <ActionCard href="/cuenta/seguridad" title="Seguridad" detail="Configura el segundo factor de autenticación." status="Disponible" icon={<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path fillRule="evenodd" d="M12 1.5 4.5 5.25v5.59c0 4.74 3.21 9.15 7.5 10.66 4.29-1.51 7.5-5.92 7.5-10.66V5.25L12 1.5Zm0 5.25a2.25 2.25 0 0 0-2.25 2.25v1.5h4.5V9A2.25 2.25 0 0 0 12 6.75Z" clipRule="evenodd" /></svg>} />
        <ActionCard href="/cuenta/pedidos" title="Pedidos" detail="Consulta compras, estados y comprobantes cuando el módulo esté listo." status="Próximamente" icon={<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M5.25 3.75A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H17.5V3a.75.75 0 0 0-1.5 0v.75h-8.5V3A.75.75 0 0 0 6 3v.75H5.25ZM7.5 9.5h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1 0-1.5Zm0 4h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1 0-1.5Z" /></svg>} />
        <ActionCard href="/cuenta/direcciones" title="Direcciones" detail="Administra más puntos de entrega cuando la gestión esté habilitada." status="Próximamente" icon={<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path fillRule="evenodd" d="M12 1.5A8.25 8.25 0 0 0 3.75 9.75c0 5.272 5.12 10.14 7.19 11.884a1.64 1.64 0 0 0 2.12 0c2.07-1.745 7.19-6.612 7.19-11.884A8.25 8.25 0 0 0 12 1.5Zm0 11.25a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" clipRule="evenodd" /></svg>} />
      </div></section>
    </div>
  </section>;
}
