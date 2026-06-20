"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@marweld/ui/lib/utils";
import { ApiError } from "../../../shared/api/client";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { authService } from "../../auth/services/auth.service";
import { mfaService } from "../../auth/services/mfa.service";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const challenge = useAuthStore((s) => s.challenge);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized) {
      if (user) {
        router.replace("/");
      } else if (challenge && new Date(challenge.expiresAt) > new Date()) {
        router.replace("/login/2fa");
      }
    }
  }, [isInitialized, user, challenge, router]);

  if (!isInitialized) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contrasena.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const flow = await authService.login(email, password);
      setAuth(flow);
      if (flow.status === "MFA_REQUIRED") {
        router.push("/login/2fa");
        return;
      }
      try {
        const mfaStatus = await mfaService.status();
        const needsSetup = !mfaStatus.totpEnabled && !mfaStatus.emailOtpEnabled;
        router.push(needsSetup ? "/cuenta/seguridad" : "/");
      } catch {
        router.push("/");
      }
    } catch (cause) {
      if (cause instanceof ApiError && cause.errorCode === "EMAIL_NOT_VERIFIED") {
        router.push(`/verificar-correo?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(cause instanceof ApiError ? cause.message : "No se pudo iniciar sesion. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-primary relative flex h-screen items-center justify-center overflow-hidden p-4">
      {/* Decoración de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary-foreground absolute -right-32 -top-32 h-72 w-72 rounded-full opacity-10 blur-3xl" />
        <div className="bg-primary-foreground absolute -bottom-32 -left-32 h-72 w-72 rounded-full opacity-10 blur-3xl" />
      </div>

      {/* Card principal */}
      <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black px-7 py-6 text-white shadow-2xl">
        {/* Cabecera: ícono + título */}
        <div className="flex w-full items-center gap-3">
          <div>
            <h1 className="text-lg font-extrabold leading-tight text-white">
              Marweld Perú S.A.C.
            </h1>
            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-white/40">
              Iniciar Sesión
            </p>
          </div>
        </div>

        {/* Línea divisora */}
        <div className="via-primary h-px w-full bg-gradient-to-r from-transparent to-transparent opacity-30" />

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-3"
          noValidate
        >
          {/* Campo email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-white/70"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="text-primary absolute left-3 top-1/2 -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="ejemplo@correo.com"
                className={cn(
                  "w-full rounded-lg py-2.5 pl-9 pr-3 text-sm outline-none transition-all duration-200",
                  "border border-white/20 bg-white/10 text-white placeholder:text-white/25",
                  "hover:border-primary/60",
                  "focus:border-primary focus:ring-primary/20 focus:ring-2",
                )}
              />
            </div>
          </div>

          {/* Campo contraseña */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-white/70"
            >
              Contraseña
            </label>
            <div className="relative">
              <span className="text-primary absolute left-3 top-1/2 -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className={cn(
                  "w-full rounded-lg py-2.5 pl-9 pr-10 text-sm outline-none transition-all duration-200",
                  "border border-white/20 bg-white/10 text-white placeholder:text-white/25",
                  "hover:border-primary/60",
                  "focus:border-primary focus:ring-primary/20 focus:ring-2",
                )}
              />
              <button
                type="button"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword((v) => !v);
                }}
                className="hover:text-primary absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-white/30 transition-colors duration-200"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path
                      fillRule="evenodd"
                      d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                    <path d="M12 8.25a3.75 3.75 0 0 0-3.713 3.218L4.99 8.17A11.25 11.25 0 0 0 1.323 11.9a1.762 1.762 0 0 0 0 1.113C2.811 17.523 7.028 20.75 12 20.75c1.734 0 3.373-.412 4.82-1.143l-3.32-3.32A3.75 3.75 0 0 1 8.25 12Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Link olvidé contraseña */}
          <div className="-mt-1 flex justify-end">
            <a
              href="#"
              aria-disabled="true"
              onClick={(event) => event.preventDefault()}
              className="text-primary/70 hover:text-primary text-xs font-medium transition-colors duration-200"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {error && (
            <p
              role="alert"
              className="-mt-1 flex items-center gap-1.5 text-xs font-medium text-red-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          )}

          {/* Botón Ingresar */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3",
              "bg-primary text-sm font-bold text-black",
              "shadow-primary/30 shadow-md",
              "hover:brightness-95 active:scale-[0.98]",
              "transition-all duration-200",
              "disabled:cursor-not-allowed disabled:opacity-70",
            )}
          >
            {isLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Ingresando...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1015.75 1.5zm0 3a.75.75 0 000 1.5A2.25 2.25 0 0118 8.25a.75.75 0 001.5 0 3.75 3.75 0 00-3.75-3.75z"
                    clipRule="evenodd"
                  />
                </svg>
                Ingresar
              </>
            )}
          </button>

          {/* Divisor + Registro */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/25">¿No tienes cuenta?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <a
            href="/registro"
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-2.5",
              "border border-white/15 bg-white/5 text-sm font-semibold text-white/70",
              "hover:border-primary/40 hover:bg-white/10 hover:text-white active:scale-[0.98]",
              "transition-all duration-200",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M6.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM3.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM19.75 7.5a.75.75 0 0 1 .75.75v2.25h2.25a.75.75 0 0 1 0 1.5h-2.25v2.25a.75.75 0 0 1-1.5 0v-2.25H16.75a.75.75 0 0 1 0-1.5H19v-2.25a.75.75 0 0 1 .75-.75Z" />
            </svg>
            Registrarse
          </a>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-white/20">
          © {new Date().getFullYear()} Marweld Perú S.A.C.
        </p>
      </div>
    </div>
  );
}
