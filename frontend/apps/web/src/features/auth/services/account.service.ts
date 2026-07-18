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

export const accountService = {
  profile: () => authenticatedRequest<AccountProfile>("/api/me"),
};
