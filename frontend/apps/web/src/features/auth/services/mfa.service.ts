import { authenticatedRequest } from "../../../shared/api/authenticated-client";

export type MfaStatus = { totpEnabled: boolean; emailOtpEnabled: boolean };
export type TotpSetup = { otpauthUri: string; qrCodeDataUrl: string; estado: string };

export const mfaService = {
  status: () => authenticatedRequest<MfaStatus>("/api/me/2fa"),
  startTotp: () => authenticatedRequest<TotpSetup>("/api/me/2fa/totp/setup", { method: "POST" }),
  confirmTotp: (codigo: string) => authenticatedRequest("/api/me/2fa/totp/confirm", { method: "POST", body: JSON.stringify({ codigo }) }),
  startEmail: () => authenticatedRequest<{ fechaExpiracion: string }>("/api/me/2fa/email/setup", { method: "POST" }),
  confirmEmail: (codigo: string) => authenticatedRequest("/api/me/2fa/email/confirm", { method: "POST", body: JSON.stringify({ codigo }) }),
};
