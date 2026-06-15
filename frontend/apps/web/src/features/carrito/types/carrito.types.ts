export type ItemCarrito = {
  id: string;
  nombre: string;
  imagen: string;
  precio: number;
  cantidad: number;
  stock: number;
};

export type ModalidadEntrega = "domicilio" | "tienda";

export type CarritoState = {
  items: ItemCarrito[];
  modalidad: ModalidadEntrega;
  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  cambiarCantidad: (id: string, cantidad: number) => void;
  eliminar: (id: string) => void;
  vaciar: () => void;
  setModalidad: (m: ModalidadEntrega) => void;
};
