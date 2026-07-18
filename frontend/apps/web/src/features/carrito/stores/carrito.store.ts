import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CarritoState, ModalidadEntrega } from "../types/carrito.types";

// El carrito se conserva durante la sesión del visitante, igual que su sesión de chatbot.
export const useCarritoStore = create<CarritoState>()(persist((set, get) => ({
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

  establecerItems: (items) => set({ items }),

  setModalidad: (modalidad: ModalidadEntrega) => set({ modalidad }),
}), {
  name: "marweld_cart",
  storage: createJSONStorage(() => sessionStorage),
  partialize: (state) => ({ items: state.items, modalidad: state.modalidad }),
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
