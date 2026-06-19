import { create } from "zustand";
import type { CarritoState, ModalidadEntrega } from "../types/carrito.types";

// Store sin persist para evitar problemas de hidratación SSR.
// El carrito vive en memoria durante la sesión.
// Para persistencia real, conectar al backend con React Query.
export const useCarritoStore = create<CarritoState>()((set, get) => ({
  items: [],
  modalidad: "domicilio",

  agregar: (item, cantidad = 1) => {
    const { items } = get();
    const existente = items.find((i) => i.id === item.id);
    if (existente) {
      set({
        items: items.map((i) =>
          i.id === item.id
            ? { ...i, cantidad: Math.min(i.stock, i.cantidad + cantidad) }
            : i,
        ),
      });
    } else {
      set({ items: [...items, { ...item, cantidad }] });
    }
  },

  cambiarCantidad: (id, cantidad) => {
    set({
      items: get().items.map((i) =>
        i.id === id
          ? { ...i, cantidad: Math.max(1, Math.min(i.stock, cantidad)) }
          : i,
      ),
    });
  },

  eliminar: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  vaciar: () => set({ items: [] }),

  setModalidad: (modalidad: ModalidadEntrega) => set({ modalidad }),
}));

// ── Selectores derivados ──
export const COSTO_ENVIO = 15;
export const MINIMO_ENVIO_GRATIS = 500;

export function calcularResumen(
  items: CarritoState["items"],
  modalidad: ModalidadEntrega,
) {
  const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const envioGratis = subtotal >= MINIMO_ENVIO_GRATIS;
  const costoEnvio =
    modalidad === "domicilio" && !envioGratis ? COSTO_ENVIO : 0;
  const total = subtotal + costoEnvio;
  return { subtotal, costoEnvio, total, envioGratis };
}
