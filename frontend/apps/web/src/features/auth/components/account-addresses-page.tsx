"use client";

import { useEffect, useState } from "react";
import { ApiError } from "../../../shared/api/client";
import { accountService, type AccountProfile } from "../services/account.service";

export function AccountAddressesPage() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [address, setAddress] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void accountService.profile()
      .then((data) => { setProfile(data); setAddress(data.direccion ?? ""); })
      .catch((cause) => setError(cause instanceof ApiError ? cause.message : "No se pudo cargar tu dirección."));
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await accountService.update({ nombre: profile.nombre, telefono: profile.telefono, direccion: address });
      setProfile(updated);
      setAddress(updated.direccion ?? "");
      setEditing(false);
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "No se pudo actualizar la dirección.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="rounded-3xl border border-white/10 bg-zinc-900/55 p-6 text-white shadow-2xl sm:p-8">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">Direcciones</p>
    <h1 className="mt-2 text-2xl font-bold">Punto de entrega principal</h1>
    <p className="mt-2 text-sm leading-6 text-white/50">Mantén esta dirección actualizada para agilizar futuras compras.</p>
    {error && <p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
    {saved && <p role="status" className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">Dirección principal actualizada.</p>}
    <div className="mt-7 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.035] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-black">⌖</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3"><p className="font-semibold">Dirección principal</p>{!editing && <button type="button" onClick={() => { setSaved(false); setEditing(true); }} className="text-xs font-bold text-yellow-300 hover:text-yellow-200">Editar</button>}</div>
          {editing ? <form onSubmit={save} className="mt-3"><textarea required maxLength={1500} value={address} onChange={(event) => setAddress(event.target.value)} className="min-h-28 w-full rounded-xl border border-white/10 bg-zinc-950 p-3 text-sm leading-6 text-white outline-none focus:border-yellow-400/60" /><div className="mt-3 flex gap-3"><button disabled={saving} className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-60">{saving ? "Guardando…" : "Guardar dirección"}</button><button type="button" onClick={() => { setAddress(profile?.direccion ?? ""); setEditing(false); }} className="text-sm font-semibold text-white/55 hover:text-white">Cancelar</button></div></form> : <p className="mt-1 text-sm leading-6 text-white/60">{profile?.direccion ?? "Cargando dirección registrada..."}</p>}
        </div>
      </div>
    </div>
    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/45">Actualmente puedes mantener una dirección principal. La gestión de múltiples direcciones se incorporará en una siguiente etapa.</div>
  </section>;
}
