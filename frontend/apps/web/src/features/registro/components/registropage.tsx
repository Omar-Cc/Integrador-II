"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@marweld/ui/lib/utils";
import { ApiError } from "../../../shared/api/client";
import { registrarUsuario } from "../services/registro.service";
import type { RegistroFormData } from "../types/registro.types";
import { useAuthStore } from "../../../shared/stores/auth.store";

const initialForm: RegistroFormData = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  confirmPassword: "",
  telefono: "",
  documento: "",
  direccion: "",
};

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,255}$/;

function registrationErrorMessage(cause: unknown): string {
  if (!(cause instanceof ApiError)) {
    return "No se pudo crear la cuenta. Intenta nuevamente.";
  }
  const messages: Record<string, string> = {
    EMAIL_ALREADY_EXISTS: "El correo ya se encuentra registrado.",
    DOCUMENTO_ALREADY_EXISTS: "El documento ya se encuentra registrado.",
    VALIDATION_ERROR: cause.message,
    EMAIL_DELIVERY_ERROR: "La cuenta fue procesada, pero no se pudo enviar el correo de verificacion.",
  };
  return messages[cause.errorCode] ?? cause.message;
}

export default function RegistroPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const challenge = useAuthStore((s) => s.challenge);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [form, setForm] = useState<RegistroFormData>(initialForm);
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success] = useState(false);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellido.trim() || !form.email.trim()) {
      setError("Completa tu nombre, apellido y correo.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Ingresa un correo valido.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!STRONG_PASSWORD.test(form.password)) {
      setError(
        "La contrasena debe tener 8 caracteres, mayuscula, minuscula, numero y simbolo.",
      );
      return;
    }
    if (step === 1) {
      setError(null);
      setStep(2);
      return;
    }
    if (!form.documento.trim() || !form.direccion.trim()) {
      setError("Completa el documento y la direccion.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await registrarUsuario({
        nombre: `${form.nombre.trim()} ${form.apellido.trim()}`,
        correo: form.email.trim(),
        contrasena: form.password,
        telefono: form.telefono.trim() || undefined,
        documento: form.documento.trim(),
        direccion: form.direccion.trim(),
      });
      router.push(
        `/verificar-correo?email=${encodeURIComponent(form.email.trim())}`,
      );
    } catch (cause) {
      setError(registrationErrorMessage(cause));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Estado de éxito ---
  if (success) {
    return (
      <div className="bg-primary flex h-screen items-center justify-center overflow-hidden p-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black px-7 py-10 text-center text-white">
          <div className="bg-primary flex h-14 w-14 items-center justify-center rounded-xl shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7 text-black"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              ¡Registro exitoso!
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Tu cuenta ha sido creada correctamente.
            </p>
          </div>
          <a
            href="/login"
            className="bg-primary mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-black transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary relative flex h-screen items-center justify-center overflow-hidden p-4">
      {/* Decoración de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-black opacity-10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-black opacity-10 blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black px-7 py-6 text-white shadow-2xl">
        {/* Cabecera */}
        <div className="flex w-full items-center gap-3">
          <div className="bg-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-black"
              aria-hidden="true"
            >
              <path d="M6.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM3.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM19.75 7.5a.75.75 0 0 1 .75.75v2.25h2.25a.75.75 0 0 1 0 1.5h-2.25v2.25a.75.75 0 0 1-1.5 0v-2.25H16.75a.75.75 0 0 1 0-1.5H19v-2.25a.75.75 0 0 1 .75-.75Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-tight text-white">
              Marweld Perú S.A.C.
            </h1>
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">
              Crear cuenta
            </p>
          </div>
        </div>

        {/* Divisor */}
        <div className="via-primary h-px w-full bg-gradient-to-r from-transparent to-transparent opacity-30" />

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-3"
          noValidate
        >
          {step === 1 ? (
            <>
          {/* Nombre y Apellido en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="nombre"
                className="text-xs font-semibold text-white/70"
              >
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="given-name"
                required
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ana"
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200",
                  "border border-white/20 bg-white/10 text-white placeholder:text-white/25",
                  "hover:border-primary/60 focus:border-primary focus:ring-primary/20 focus:ring-2",
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="apellido"
                className="text-xs font-semibold text-white/70"
              >
                Apellido
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                autoComplete="family-name"
                required
                value={form.apellido}
                onChange={handleChange}
                placeholder="García"
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200",
                  "border border-white/20 bg-white/10 text-white placeholder:text-white/25",
                  "hover:border-primary/60 focus:border-primary focus:ring-primary/20 focus:ring-2",
                )}
              />
            </div>
          </div>

          {/* Email */}
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
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className={cn(
                  "w-full rounded-lg py-2.5 pl-9 pr-3 text-sm outline-none transition-all duration-200",
                  "border border-white/20 bg-white/10 text-white placeholder:text-white/25",
                  "hover:border-primary/60 focus:border-primary focus:ring-primary/20 focus:ring-2",
                )}
              />
            </div>
          </div>

          {/* Contraseña */}
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
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={cn(
                  "w-full rounded-lg py-2.5 pl-9 pr-10 text-sm outline-none transition-all duration-200",
                  "border border-white/20 bg-white/10 text-white placeholder:text-white/25",
                  "hover:border-primary/60 focus:border-primary focus:ring-primary/20 focus:ring-2",
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

          {/* Confirmar contraseña */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-semibold text-white/70"
            >
              Confirmar Contraseña
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
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className={cn(
                  "w-full rounded-lg py-2.5 pl-9 pr-10 text-sm outline-none transition-all duration-200",
                  "border border-white/20 bg-white/10 text-white placeholder:text-white/25",
                  "hover:border-primary/60 focus:border-primary focus:ring-primary/20 focus:ring-2",
                  error &&
                    "border-red-500/60 focus:border-red-500 focus:ring-red-500/20",
                )}
              />
              <button
                type="button"
                aria-label={
                  showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={(e) => {
                  e.preventDefault();
                  setShowConfirm((v) => !v);
                }}
                className="hover:text-primary absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-white/30 transition-colors duration-200"
              >
                {showConfirm ? (
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

            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="telefono"
                    className="text-xs font-semibold text-white/70"
                  >
                    Telefono (opcional)
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    autoComplete="tel"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="999 999 999"
                    className={cn(
                      "w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200",
                      "border border-white/20 bg-white/10 text-white placeholder:text-white/25",
                      "hover:border-primary/60 focus:border-primary focus:ring-primary/20 focus:ring-2",
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="documento"
                    className="text-xs font-semibold text-white/70"
                  >
                    Documento
                  </label>
                  <input
                    id="documento"
                    name="documento"
                    type="text"
                    required
                    value={form.documento}
                    onChange={handleChange}
                    placeholder="DNI o RUC"
                    className={cn(
                      "w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200",
                      "border border-white/20 bg-white/10 text-white placeholder:text-white/25",
                      "hover:border-primary/60 focus:border-primary focus:ring-primary/20 focus:ring-2",
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="direccion"
                  className="text-xs font-semibold text-white/70"
                >
                  Direccion
                </label>
                <textarea
                  id="direccion"
                  name="direccion"
                  required
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Calle, numero, distrito y ciudad"
                  className={cn(
                    "min-h-24 w-full resize-none rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200",
                    "border border-white/20 bg-white/10 text-white placeholder:text-white/25",
                    "hover:border-primary/60 focus:border-primary focus:ring-primary/20 focus:ring-2",
                  )}
                />
              </div>
            </>
          )}

          {/* Mensaje de error */}
          {error && (
            <p className="-mt-1 flex items-center gap-1.5 text-xs font-medium text-red-400">
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

          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              disabled={isLoading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-2.5",
                "border border-white/15 bg-white/5 text-sm font-semibold text-white/70",
                "hover:border-primary/40 hover:bg-white/10 hover:text-white active:scale-[0.98]",
                "transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70",
              )}
            >
              Volver
            </button>
          )}

          {/* Botón Registrarse */}
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
                Registrando...
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
                  <path d="M6.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM3.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM19.75 7.5a.75.75 0 0 1 .75.75v2.25h2.25a.75.75 0 0 1 0 1.5h-2.25v2.25a.75.75 0 0 1-1.5 0v-2.25H16.75a.75.75 0 0 1 0-1.5H19v-2.25a.75.75 0 0 1 .75-.75Z" />
                </svg>
                {step === 1 ? "Continuar" : "Crear cuenta"}
              </>
            )}
          </button>

          {/* Volver al login */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/25">¿Ya tienes cuenta?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <a
            href="/login"
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
              <path
                fillRule="evenodd"
                d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1015.75 1.5zm0 3a.75.75 0 000 1.5A2.25 2.25 0 0118 8.25a.75.75 0 001.5 0 3.75 3.75 0 00-3.75-3.75z"
                clipRule="evenodd"
              />
            </svg>
            Iniciar sesión
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
