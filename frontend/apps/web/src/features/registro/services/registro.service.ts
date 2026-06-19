import type { RegistroPayload } from "../types/registro.types";
import { mockRegistrar } from "../data/registro.mock";

// TODO: reemplazar mockRegistrar por llamada axios al backend
export async function registrarUsuario(
  payload: RegistroPayload,
): Promise<{ success: boolean }> {
  return mockRegistrar(payload);
}
