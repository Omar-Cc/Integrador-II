import type { RegistroPayload } from "../types/registro.types";

// Simula la respuesta del backend al registrar un usuario
export async function mockRegistrar(
  payload: RegistroPayload,
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 1200));
  console.log("Registro mock:", payload);
  return { success: true };
}
