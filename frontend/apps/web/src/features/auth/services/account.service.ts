import { authenticatedRequest } from "../../../shared/api/authenticated-client";

export type AccountProfile = {
  userPublicId: string;
  nombre: string;
  correo: string;
  telefono: string | null;
  direccion: string | null;
  documento: string | null;
  fechaRegistro: string;
};

export type UpdateAccountProfilePayload = {
  nombre: string;
  telefono: string | null;
  direccion: string;
};

export const accountService = {
  profile: () => authenticatedRequest<AccountProfile>("/api/me"),
  update: (payload: UpdateAccountProfilePayload) => authenticatedRequest<AccountProfile>("/api/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  }),
};
