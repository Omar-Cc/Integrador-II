import React, { useState } from "react";
import { cn } from "@marweld/ui/lib/utils";
import { useAuthStore } from "../../../shared/stores/auth.store";

export function LoginPage() {
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    login(email);
    setIsLoading(false);
  };

  return (
    <div className="bg-zinc-950 relative flex h-screen w-screen items-center justify-center overflow-hidden p-4">
      {/* Decoración de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[var(--primary)]/10 opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-[var(--primary)]/10 opacity-30 blur-3xl" />
      </div>

      {/* Card principal */}
      <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900/40 p-8 text-white shadow-2xl backdrop-blur-xl">
        {/* Cabecera: ícono + título */}
        <div className="flex w-full items-center gap-3">
          <div>
            <span className="text-[var(--primary)] text-[10px] font-bold uppercase tracking-[0.2em]">Marweld Perú — Admin</span>
            <h1 className="text-xl font-extrabold leading-tight text-white mt-1">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-white/50 mt-1">Accede al panel de control del ERP administrativo.</p>
          </div>
        </div>

        {/* Línea divisora */}
        <div className="h-px w-full bg-white/10" />

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-4"
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
              <span className="text-[var(--primary)] absolute left-3.5 top-1/2 -translate-y-1/2">
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className={cn(
                  "w-full rounded-xl py-3 pl-10 pr-3 text-xs outline-none transition-all duration-200",
                  "border border-white/10 bg-black/40 text-white placeholder:text-white/20",
                  "hover:border-[var(--primary)]/50",
                  "focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 focus:ring-2",
                )}
              />
            </div>
          </div>

          {/* Campo contraseña */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-white/70"
              >
                Contraseña
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-[var(--primary)]/70 hover:text-[var(--primary)] text-[10px] font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="relative">
              <span className="text-[var(--primary)] absolute left-3.5 top-1/2 -translate-y-1/2">
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full rounded-xl py-3 pl-10 pr-10 text-xs outline-none transition-all duration-200",
                  "border border-white/10 bg-black/40 text-white placeholder:text-white/20",
                  "hover:border-[var(--primary)]/50",
                  "focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 focus:ring-2",
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
                className="hover:text-[var(--primary)] absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-white/30 transition-colors duration-200"
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

          {/* Botón Ingresar */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || password.length < 6}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3 mt-2 cursor-pointer",
              "bg-[var(--primary)] text-sm font-bold text-zinc-950",
              "shadow-[var(--primary)]/10 shadow-lg",
              "hover:brightness-95 active:scale-[0.98]",
              "transition-all duration-200",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {isLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-zinc-950"
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
                Ingresar al Panel
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/10 mt-2">
          © {new Date().getFullYear()} Marweld Perú S.A.C.
        </p>
      </div>
    </div>
  );
}
