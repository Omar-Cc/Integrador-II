"use client";

import { useEffect, useState } from "react";
import { ApiError } from "../../../shared/api/client";
import { accountService, type AccountProfile } from "../services/account.service";

export function AccountAddressesPage() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void accountService.profile().then(setProfile).catch((cause) => setError(cause instanceof ApiError ? cause.message : "No se pudo cargar tu dirección.")); }, []);
  return <section className="rounded-3xl border border-white/10 bg-zinc-900/55 p-6 text-white shadow-2xl sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">Direcciones</p><h1 className="mt-2 text-2xl font-bold">Puntos de entrega</h1><p className="mt-2 text-sm leading-6 text-white/50">Consulta la dirección que registraste al crear tu cuenta.</p>{error && <p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}<div className="mt-7 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.035] p-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-black"><svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path fillRule="evenodd" d="M12 1.5A8.25 8.25 0 0 0 3.75 9.75c0 5.272 5.12 10.14 7.19 11.884a1.64 1.64 0 0 0 2.12 0c2.07-1.745 7.19-6.612 7.19-11.884A8.25 8.25 0 0 0 12 1.5Zm0 11.25a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" clipRule="evenodd" /></svg></div><div><p className="font-semibold">Dirección principal</p><p className="mt-1 text-sm leading-6 text-white/60">{profile?.direccion ?? "Cargando dirección registrada..."}</p></div></div></div><div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/45">La edición y el registro de más direcciones se habilitarán cuando esté disponible el módulo de gestión.</div></section>;
}
