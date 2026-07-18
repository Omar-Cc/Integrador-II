import { authenticatedRequest } from "../../../shared/api/authenticated-client";

export type OrderSummary = {
  publicId: string;
  estadoCodigo: string;
  estadoNombre: string;
  total: number;
  fechaPedido: string;
  cantidadProductos: number;
};

export type OrderItem = {
  productoPublicId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type OrderTracking = {
  estadoCodigo: string;
  titulo: string;
  descripcion: string | null;
  ubicacion: string | null;
  fechaEvento: string;
};

export type OrderDetail = OrderSummary & {
  direccionEntrega: string;
  productos: OrderItem[];
  seguimiento: OrderTracking[];
};

export const orderService = {
  list: () => authenticatedRequest<OrderSummary[]>("/api/me/orders"),
  detail: (publicId: string) => authenticatedRequest<OrderDetail>(`/api/me/orders/${publicId}`),
};
