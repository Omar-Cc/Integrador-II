"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "../../../shared/api/client";
import type { MfaMethod } from "../../../shared/api/types";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { authService } from "../services/auth.service";
import { AuthShell, buttonClass, fieldClass, FormError } from "./auth-shell";

export function LoginMfaPage() {
  const router = useRouter();
  const challenge = useAuthStore((state) => state.challenge);
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const [selectedMethod, setSelectedMethod] = useState<MfaMethod | null>(null);
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isInitialized) return;

    if (user) {
      router.replace("/");
      return;
    }

    if (!challenge || new Date(challenge.expiresAt) <= new Date()) {
      router.replace("/login");
    }
  }, [challenge, user, isInitialized, router]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  if (!isInitialized || !challenge) return null;

  async function sendCode() {
    if (!challenge) return;
    setLoading(true);
    setError(null);
    try {
      await authService.sendMfaEmail(challenge.challengePublicId);
      setCodeSent(true);
      setTimeLeft(60);
      setCodigo("");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "No se pudo enviar el código.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedMethod || !challenge) return;
    setLoading(true);
    setError(null);
    try {
      const flow = await authService.verifyMfa(
        challenge.challengePublicId,
        selectedMethod,
        codigo
      );
      setAuth(flow);
      router.replace("/");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "No se pudo validar el código.");
    } finally {
      setLoading(false);
    }
  }

  function handleCambiarMetodo() {
    setSelectedMethod(null);
    setCodeSent(false);
    setCodigo("");
    setError(null);
    setTimeLeft(0);
  }

  // Render method selection cards
  const renderCards = (currentActive: MfaMethod | null) => (
    <div className="space-y-3">
      {challenge.availableMethods.map((item) => {
        const isActive = currentActive === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => {
              setSelectedMethod(item);
              setError(null);
              setCodigo("");
            }}
            className={`w-full text-left p-4 rounded-lg border transition group ${
              isActive
                ? "border-yellow-400 bg-yellow-400/5 shadow-md"
                : "border-white/10 bg-white/5 hover:border-yellow-400/50 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-bold transition ${
                  isActive ? "text-yellow-400" : "text-white group-hover:text-yellow-400"
                }`}
              >
                {item === "TOTP" ? "Aplicación autenticadora" : "Correo electrónico"}
              </span>
              {isActive && (
                <span className="text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/20">
                  Seleccionado
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-white/50 leading-relaxed">
              {item === "TOTP"
                ? "Usa los códigos de seguridad temporales de tu app de autenticación (Google Authenticator, Authy, etc.)."
                : "Enviaremos un código único de 6 dígitos a tu dirección de correo electrónico."}
            </p>
          </button>
        );
      })}
    </div>
  );

  // If no method selected yet
  if (!selectedMethod) {
    return (
      <AuthShell
        title="Verificación en dos pasos"
        subtitle="Selecciona uno de los métodos disponibles para verificar tu identidad."
      >
        <div className="space-y-4">
          {renderCards(null)}
          <FormError message={error} />
        </div>
      </AuthShell>
    );
  }

  // If EMAIL_OTP and code has not been sent yet
  if (selectedMethod === "EMAIL_OTP" && !codeSent) {
    return (
      <AuthShell
        title="Verificación por Correo"
        subtitle="Confirma tu identidad enviando un código a tu correo."
      >
        <div className="space-y-4">
          {renderCards("EMAIL_OTP")}
          
          <div className="pt-2">
            <button
              type="button"
              onClick={sendCode}
              disabled={loading}
              className={buttonClass}
            >
              {loading ? "Enviando código..." : "Enviar código"}
            </button>
          </div>

          <FormError message={error} />

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleCambiarMetodo}
              className="text-xs text-white/60 hover:text-white underline transition"
            >
              Regresar a métodos
            </button>
          </div>
        </div>
      </AuthShell>
    );
  }

  // If EMAIL_OTP and code is sent
  if (selectedMethod === "EMAIL_OTP" && codeSent) {
    return (
      <AuthShell
        title="Ingresa tu código"
        subtitle="Hemos enviado un código a tu correo electrónico."
      >
        <form onSubmit={verify} className="space-y-4">
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-center">
            <p className="text-xs text-green-300 font-medium">
              Código enviado a tu correo. Revisa tu bandeja de entrada.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="otp-input" className="text-xs text-white/50 block font-medium">
              Código de verificación (6 dígitos):
            </label>
            <input
              id="otp-input"
              aria-label="Código de verificación"
              className={`${fieldClass} text-center text-xl tracking-[0.3em] font-mono`}
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <FormError message={error} />

          <button
            className={buttonClass}
            disabled={loading || codigo.length !== 6}
          >
            {loading ? "Validando..." : "Confirmar"}
          </button>

          <div className="flex flex-col items-center justify-between gap-3 pt-2 text-xs">
            {timeLeft > 0 ? (
              <span className="text-white/40">
                Reenviar código en <strong className="text-yellow-400 font-mono">{timeLeft}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={sendCode}
                disabled={loading}
                className="text-yellow-400 hover:text-yellow-300 font-semibold transition disabled:opacity-50"
              >
                Reenviar código
              </button>
            )}

            <button
              type="button"
              onClick={handleCambiarMetodo}
              className="text-white/60 hover:text-white font-medium underline transition"
            >
              Cambiar método
            </button>
          </div>
        </form>
      </AuthShell>
    );
  }

  // If TOTP is selected
  return (
    <AuthShell
      title="Aplicación Autenticadora"
      subtitle="Ingresa el código generado por tu app."
    >
      <div className="space-y-4">
        {renderCards("TOTP")}

        <form onSubmit={verify} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label htmlFor="totp-input" className="text-xs text-white/50 block font-medium">
              Código de verificación (6 dígitos):
            </label>
            <input
              id="totp-input"
              aria-label="Código de verificación"
              className={`${fieldClass} text-center text-xl tracking-[0.3em] font-mono`}
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <FormError message={error} />

          <button
            className={buttonClass}
            disabled={loading || codigo.length !== 6}
          >
            {loading ? "Validando..." : "Confirmar"}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleCambiarMetodo}
            className="text-xs text-white/60 hover:text-white underline transition"
          >
            Cambiar método
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
