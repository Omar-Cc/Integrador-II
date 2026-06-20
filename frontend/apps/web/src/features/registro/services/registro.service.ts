import { authService } from "../../auth/services/auth.service";
import type { RegistroPayload } from "../types/registro.types";

export function registrarUsuario(payload: RegistroPayload) {
  return authService.register(payload);
}
