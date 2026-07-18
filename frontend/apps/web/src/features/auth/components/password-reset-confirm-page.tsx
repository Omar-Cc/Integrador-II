"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "../../../shared/api/client";
import { authService } from "../services/auth.service";
import { AuthShell, buttonClass, fieldClass, FormError } from "./auth-shell";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,255}$/;

export function PasswordResetConfirmPage({ initialEmail = "" }: Readonly<{ initialEmail?: string }>) {
  const router = useRouter();
  const [correo, setCorreo] = useState(initialEmail);
  const [codigo, setCodigo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!correo.trim() || !/^\d{6}$/.test(codigo)) {
      setError("Ingresa tu correo y el código de seis dígitos.");
      return;
    }
    if (!passwordRule.test(contrasena)) {
      setError("La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.");
      return;
    }
    if (contrasena !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.confirmPasswordReset(correo.trim(), codigo, contrasena);
      router.replace("/login?password-reset=1");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "No se pudo actualizar la contraseña. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Crea una nueva contraseña" subtitle="El código vence en 15 minutos y solo puede utilizarse una vez.">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="correo" className="mb-1.5 block text-sm font-medium text-white/80">Correo electrónico</label>
          <input id="correo" type="email" autoComplete="email" value={correo} onChange={(event) => setCorreo(event.target.value)} className={fieldClass} required />
        </div>
        <div>
          <label htmlFor="codigo" className="mb-1.5 block text-sm font-medium text-white/80">Código de confirmación</label>
          <input id="codigo" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={codigo} onChange={(event) => setCodigo(event.target.value.replace(/\D/g, ""))} className={fieldClass} placeholder="000000" required />
        </div>
        <div>
          <label htmlFor="contrasena" className="mb-1.5 block text-sm font-medium text-white/80">Nueva contraseña</label>
          <input id="contrasena" type="password" autoComplete="new-password" value={contrasena} onChange={(event) => setContrasena(event.target.value)} className={fieldClass} required />
        </div>
        <div>
          <label htmlFor="confirmacion" className="mb-1.5 block text-sm font-medium text-white/80">Confirmar nueva contraseña</label>
          <input id="confirmacion" type="password" autoComplete="new-password" value={confirmacion} onChange={(event) => setConfirmacion(event.target.value)} className={fieldClass} required />
        </div>
        <p className="text-xs leading-5 text-white/50">Usa 8 o más caracteres, con mayúscula, minúscula, número y símbolo.</p>
        <FormError message={error} />
        <button type="submit" className={buttonClass} disabled={loading}>{loading ? "Actualizando..." : "Restablecer contraseña"}</button>
        <Link href="/recuperar-contrasena" className="block text-center text-sm text-white/60 transition hover:text-yellow-300">Solicitar otro código</Link>
      </form>
    </AuthShell>
  );
}
