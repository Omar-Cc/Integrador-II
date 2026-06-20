export type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};

export type ErrorResponse = {
  errorCode: string;
  message: string;
};

export type AuthUser = {
  userPublicId: string;
  clientPublicId: string | null;
  nombre: string;
  correo: string;
  rol: string;
};

export type MfaMethod = "TOTP" | "EMAIL_OTP";

export type MfaChallenge = {
  challengePublicId: string;
  expiresAt: string;
  availableMethods: MfaMethod[];
  defaultMethod: MfaMethod;
};

export type AuthFlow = {
  status: "AUTHENTICATED" | "MFA_REQUIRED";
  accessToken: string | null;
  expiresInSeconds: number;
  user: AuthUser | null;
  mfaChallenge: MfaChallenge | null;
};
