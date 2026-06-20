import { apiRequest } from "../../../shared/api/client";
import type { AuthFlow, MfaMethod } from "../../../shared/api/types";

export type RegisterPayload = {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  documento: string;
  direccion: string;
};

export const authService = {
  register: (payload: RegisterPayload) =>
    apiRequest<{ userPublicId: string; correo: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  verifyEmail: (correo: string, codigo: string) =>
    apiRequest<{ estado: string }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ correo, codigo }),
    }),
  resendVerification: (correo: string) =>
    apiRequest<{ estado: string }>("/api/auth/resend-verification-code", {
      method: "POST",
      body: JSON.stringify({ correo }),
    }),
  login: (correo: string, contrasena: string) =>
    apiRequest<AuthFlow>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, contrasena }),
    }),
  sendMfaEmail: (challengePublicId: string) =>
    apiRequest<{ expiresAt: string }>("/api/auth/login/mfa/email/send", {
      method: "POST",
      body: JSON.stringify({ challengePublicId }),
    }),
  verifyMfa: (challengePublicId: string, method: MfaMethod, codigo: string) =>
    apiRequest<AuthFlow>("/api/auth/login/mfa/verify", {
      method: "POST",
      body: JSON.stringify({ challengePublicId, method, codigo }),
    }),
  refresh: () => apiRequest<AuthFlow>("/api/auth/refresh", { method: "POST" }),
  logout: () => apiRequest<void>("/api/auth/logout", { method: "POST" }),
};
