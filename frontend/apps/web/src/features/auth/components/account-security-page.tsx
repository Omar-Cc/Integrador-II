"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "../../../shared/api/client";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { buttonClass, fieldClass, FormError } from "./auth-shell";
import { mfaService, type MfaStatus, type TotpSetup } from "../services/mfa.service";

export function AccountSecurityPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.isInitialized);
  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [totp, setTotp] = useState<TotpSetup | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [emailPending, setEmailPending] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!initialized) return;
    if (!user) { router.replace("/login"); return; }
    setLoadingStatus(true);
    void mfaService.status()
      .then(setStatus)
      .catch(() => setError("No se pudo consultar la seguridad de la cuenta."))
      .finally(() => setLoadingStatus(false));
  }, [initialized, user, router]);
  if (!initialized || !user) return null;

  async function run(action: () => Promise<unknown>, done: () => void) {
    setError(null);
    try { await action(); done(); setStatus(await mfaService.status()); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "No se pudo completar la operacion."); }
  }
  return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
    <div className="mx-auto max-w-3xl">
      <button onClick={() => router.back()} className="mb-6 text-sm text-yellow-400">Volver</button>
      <h1 className="text-2xl font-bold">Seguridad de la cuenta</h1>
      <p className="mt-1 text-sm text-white/50">Configura un segundo factor para {user.correo}.</p>
      {loadingStatus && <p className="mt-6 text-sm text-white/50">Consultando metodos configurados...</p>}
      {status && !status.totpEnabled && !status.emailOtpEnabled && (
        <div className="mt-6 border-l-2 border-yellow-400 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100">
          Aun no tienes verificacion en dos pasos. Activa una aplicacion autenticadora o el codigo por correo.
        </div>
      )}
      <FormError message={error} />
      <section className="mt-8 border-t border-white/10 py-6">
        <div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold">Aplicacion autenticadora</h2><p className="text-sm text-white/45">Codigos TOTP que cambian cada 30 segundos.</p></div><span className="text-sm text-yellow-400">{loadingStatus ? "Consultando" : status?.totpEnabled ? "Activo" : "Inactivo"}</span></div>
        {status && !status.totpEnabled && !totp && <button className="mt-4 rounded-md border border-yellow-400 px-4 py-2 text-sm text-yellow-400" onClick={() => void mfaService.startTotp().then(setTotp).catch((cause) => setError(cause instanceof ApiError ? cause.message : "No se pudo iniciar TOTP."))}>Configurar TOTP</button>}
        {totp && <div className="mt-5 grid gap-5 sm:grid-cols-[180px_1fr]">
          <Image src={totp.qrCodeDataUrl} alt="Codigo QR para configurar TOTP" width={180} height={180} unoptimized className="bg-white p-2" />
          <form onSubmit={(e) => { e.preventDefault(); void run(() => mfaService.confirmTotp(totpCode), () => setTotp(null)); }} className="space-y-3"><p className="text-sm text-white/60">Escanea el QR e ingresa el codigo actual.</p><input className={fieldClass} inputMode="numeric" pattern="[0-9]{6}" required value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))} /><button className={buttonClass}>Activar TOTP</button></form>
        </div>}
      </section>
      <section className="border-t border-white/10 py-6">
        <div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold">Codigo por correo</h2><p className="text-sm text-white/45">Recibe un codigo temporal en tu correo.</p></div><span className="text-sm text-yellow-400">{loadingStatus ? "Consultando" : status?.emailOtpEnabled ? "Activo" : "Inactivo"}</span></div>
        {status && !status.emailOtpEnabled && !emailPending && <button className="mt-4 rounded-md border border-yellow-400 px-4 py-2 text-sm text-yellow-400" onClick={() => void mfaService.startEmail().then(() => setEmailPending(true)).catch((cause) => setError(cause instanceof ApiError ? cause.message : "No se pudo enviar el codigo."))}>Activar por correo</button>}
        {emailPending && <form onSubmit={(e) => { e.preventDefault(); void run(() => mfaService.confirmEmail(emailCode), () => setEmailPending(false)); }} className="mt-4 max-w-sm space-y-3"><input className={fieldClass} inputMode="numeric" pattern="[0-9]{6}" required value={emailCode} onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))} /><button className={buttonClass}>Confirmar correo</button></form>}
      </section>
    </div>
  </main>;
}
