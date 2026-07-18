import { authenticatedRequest } from "../../../shared/api/authenticated-client";

export type CheckoutPayload = {
  items: { productoPublicId: string; cantidad: number }[];
  modalidadEntrega: "DOMICILIO" | "TIENDA";
  nombreRecibe?: string;
  telefono?: string;
  direccion?: string;
  distrito?: string;
  referencia?: string;
  correo: string;
};

export type CheckoutResult = {
  orderPublicId: string;
  paymentPublicId: string;
  paymentApproved: boolean;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  message: string;
};

export const checkoutService = {
  process: (payload: CheckoutPayload) =>
    authenticatedRequest<CheckoutResult>("/api/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
