"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "../../../shared/api/client";
import { authService } from "../services/auth.service";
import { AuthShell, buttonClass, fieldClass, FormError } from "./auth-shell";

export function VerifyEmailPage() {
  const search = useSearchParams();
  const router = useRouter();
  const [correo, setCorreo] = useState(search.get("email") ?? "");
  const [codigo, setCodigo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!cooldown) return;
    const timer = globalThis.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => globalThis.clearInterval(timer);
  }, [cooldown]);

  async function verify(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(null);
    try { await authService.verifyEmail(correo, codigo); router.push("/login?verified=1"); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "No se pudo verificar el correo."); }
    finally { setLoading(false); }
  }
  async function resend() {
    setError(null);
    try { await authService.resendVerification(correo); setCooldown(60); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "No se pudo reenviar el codigo."); }
  }
  return <AuthShell title="Verifica tu correo" subtitle="Ingresa el codigo de seis digitos que enviamos a tu correo.">
    <form onSubmit={verify} className="space-y-4">
      <label className="block text-sm">Correo<input className={`${fieldClass} mt-1`} type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} /></label>
      <label className="block text-sm">Codigo<input className={`${fieldClass} mt-1 text-center text-xl tracking-[0.3em]`} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))} /></label>
      <FormError message={error} />
      <button className={buttonClass} disabled={loading}>{loading ? "Verificando..." : "Verificar correo"}</button>
      <button type="button" onClick={resend} disabled={cooldown > 0 || !correo} className="w-full text-sm font-semibold text-yellow-400 disabled:text-white/30">{cooldown ? `Reenviar en ${cooldown}s` : "Reenviar codigo"}</button>
    </form>
  </AuthShell>;
}
