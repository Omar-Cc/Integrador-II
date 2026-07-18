"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "../../../shared/api/client";
import { authService } from "../services/auth.service";
import { AuthShell, buttonClass, fieldClass, FormError } from "./auth-shell";

export function PasswordResetRequestPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = correo.trim();
    if (!normalizedEmail) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.requestPasswordReset(normalizedEmail);
      setSent(true);
      router.prefetch(`/restablecer-contrasena?correo=${encodeURIComponent(normalizedEmail)}`);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "No se pudo procesar la solicitud. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Recupera tu contraseña" subtitle="Te enviaremos un código para crear una nueva contraseña.">
      {sent ? (
        <div className="space-y-5">
          <div className="rounded-md border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-100" role="status">
            Si existe una cuenta activa con ese correo, enviamos un código de seis dígitos. Revisa también tu carpeta de spam.
          </div>
          <Link href={`/restablecer-contrasena?correo=${encodeURIComponent(correo.trim())}`} className={buttonClass}>
            Ingresar código
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="correo" className="mb-1.5 block text-sm font-medium text-white/80">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              className={fieldClass}
              placeholder="nombre@correo.com"
              required
            />
          </div>
          <FormError message={error} />
          <button type="submit" className={buttonClass} disabled={loading}>
            {loading ? "Enviando código..." : "Enviar código"}
          </button>
          <Link href="/login" className="block text-center text-sm text-white/60 transition hover:text-yellow-300">Volver a iniciar sesión</Link>
        </form>
      )}
    </AuthShell>
  );
}
