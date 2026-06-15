"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@marweld/ui/lib/utils";
import { useCarritoStore, calcularResumen } from "../stores/carrito.store";
import type { ItemCarrito } from "../types/carrito.types";

export default function CarritoPage() {
  const { items, modalidad, cambiarCantidad, eliminar, setModalidad, vaciar } =
    useCarritoStore();
  const { subtotal } = calcularResumen(items, modalidad);
  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);

  const [etapa, setEtapa] = useState<1 | 2>(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("etapa") === "2" && items.length > 0) {
        setEtapa(2);
      }
    }
  }, [items.length]);

  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);

  const [orderSuccess, setOrderSuccess] = useState<{
    nroPedido: string;
    modalidad: string;
    total: number;
    direccion?: string;
    distrito?: string;
    correo: string;
  } | null>(null);

  const [deliveryForm, setDeliveryForm] = useState({
    nombreRecibe: "",
    telefono: "",
    direccion: "",
    distrito: "",
    referencia: "",
    fechaEntrega: "",
    comentarios: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    titular: "",
    numeroTarjeta: "",
    vencimiento: "",
    cvv: "",
    dni: "",
    correo: "",
  });

  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>(
    {},
  );

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setDeliveryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVencimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.substring(0, 4);
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setPaymentForm((prev) => ({ ...prev, vencimiento: value }));
  };

  const handleNumeroTarjetaChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.substring(0, 16);
    setPaymentForm((prev) => ({ ...prev, numeroTarjeta: value }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.substring(0, 4);
    setPaymentForm((prev) => ({ ...prev, cvv: value }));
  };

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 12) value = value.substring(0, 12);
    setPaymentForm((prev) => ({ ...prev, dni: value }));
  };

  const isFormValid =
    deliveryForm.nombreRecibe.trim() !== "" &&
    deliveryForm.telefono.trim() !== "" &&
    deliveryForm.direccion.trim() !== "" &&
    deliveryForm.distrito.trim() !== "" &&
    deliveryForm.referencia.trim() !== "";

  // Costo de envío según reglas: gratis si supera 500, de lo contrario 15 si es delivery y el formulario está completo.
  const costoEnvioFinal =
    modalidad === "tienda" ? 0 : isFormValid ? (subtotal >= 500 ? 0 : 15) : 0;

  const totalFinal = subtotal + costoEnvioFinal;
  const envioGratis = subtotal >= 500;

  const handleProcederPago = () => {
    setMostrarModalPago(true);
  };

  const validatePayment = (): boolean => {
    const errors: Record<string, string> = {};

    if (!paymentForm.titular.trim()) {
      errors.titular = "El nombre es requerido";
    }

    if (!paymentForm.numeroTarjeta) {
      errors.numeroTarjeta = "Número requerido";
    } else if (!/^\d{15,16}$/.test(paymentForm.numeroTarjeta)) {
      errors.numeroTarjeta = "Debe ser de 15 o 16 dígitos";
    }

    if (!paymentForm.vencimiento) {
      errors.vencimiento = "Requerido";
    } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentForm.vencimiento)) {
      errors.vencimiento = "MM/AA inválido";
    }

    if (!paymentForm.cvv) {
      errors.cvv = "Requerido";
    } else if (!/^\d{3,4}$/.test(paymentForm.cvv)) {
      errors.cvv = "3 o 4 dígitos";
    }

    if (!paymentForm.dni.trim()) {
      errors.dni = "DNI es requerido";
    } else if (!/^\d{8,12}$/.test(paymentForm.dni)) {
      errors.dni = "DNI inválido";
    }

    if (!paymentForm.correo.trim()) {
      errors.correo = "Correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentForm.correo)) {
      errors.correo = "Correo inválido";
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePagarAhora = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePayment()) return;

    setProcesandoPago(true);

    setTimeout(() => {
      setProcesandoPago(false);
      setMostrarModalPago(false);

      const nroPedido = `MW-${Math.floor(100000 + Math.random() * 900000)}`;

      setOrderSuccess({
        nroPedido,
        modalidad:
          modalidad === "tienda" ? "Recojo en Tienda" : "Delivery a Domicilio",
        total: totalFinal,
        direccion:
          modalidad === "domicilio" ? deliveryForm.direccion : undefined,
        distrito: modalidad === "domicilio" ? deliveryForm.distrito : undefined,
        correo: paymentForm.correo,
      });
      vaciar();
    }, 2000);
  };

  // ── Pantalla de Éxito ──
  if (orderSuccess) {
    return (
      <div className="animate-fade-in flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 px-5 py-20 text-center text-white">
        <div className="flex h-20 w-20 animate-bounce items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-10 w-10 text-green-400"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-black tracking-tight text-white">
            ¡Pedido Recibido!
          </h1>
          <p className="mt-2 text-sm font-semibold text-green-400">
            Pago realizado con éxito. Tu pedido ha sido registrado
            correctamente.
          </p>
        </div>

        <div className="border-white/8 my-2 flex w-full max-w-sm flex-col gap-3.5 rounded-2xl border bg-zinc-900 p-5 text-left">
          <h2 className="border-white/8 border-b pb-2 text-xs font-bold uppercase tracking-wider text-white">
            Detalles del Pedido
          </h2>

          <div className="flex justify-between text-sm">
            <span className="text-white/40">Número de pedido:</span>
            <span className="text-primary font-bold">
              {orderSuccess.nroPedido}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/40">Método de entrega:</span>
            <span className="font-semibold text-white">
              {orderSuccess.modalidad}
            </span>
          </div>

          {orderSuccess.direccion && (
            <div className="flex flex-col gap-1 border-t border-white/5 pt-2 text-sm">
              <span className="text-white/40">Dirección de envío:</span>
              <span className="font-medium text-white">
                {orderSuccess.direccion}, {orderSuccess.distrito}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t border-white/5 pt-2 text-sm">
            <span className="text-white/40">Total pagado:</span>
            <span className="text-primary font-black">
              S/ {orderSuccess.total.toFixed(2)}
            </span>
          </div>
        </div>

        <p className="max-w-xs text-xs leading-relaxed text-white/40">
          Se enviará un correo con la confirmación detallada del pedido a{" "}
          <strong className="text-white">{orderSuccess.correo}</strong>.
        </p>

        <Link
          href="/"
          className="bg-primary flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-black transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  // ── Carrito vacío ──
  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 px-5 text-center text-white">
        <div className="border-white/8 flex h-20 w-20 items-center justify-center rounded-2xl border bg-zinc-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-9 w-9 text-white/20"
            aria-hidden="true"
          >
            <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Tu carrito está vacío
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Agrega productos desde el catálogo para comenzar.
          </p>
        </div>
        <Link
          href="/"
          className="bg-primary flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-black transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Breadcrumb */}
      <div className="border-white/8 border-b bg-black px-5 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-xs text-white/30">
          <Link
            href="/"
            className="hover:text-primary transition-colors duration-200"
          >
            Inicio
          </Link>
          <span>/</span>
          <span className="text-white/60">Carrito</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {/* Título */}
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Carrito de compras
            </h1>
            <span className="bg-primary/15 border-primary/30 text-primary rounded-lg border px-2.5 py-1 text-xs font-bold">
              {totalItems} {totalItems === 1 ? "producto" : "productos"}
            </span>
          </div>
        </div>

        {/* Step progress bar */}
        <div className="mx-auto mb-10 flex max-w-md items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300",
                etapa >= 1
                  ? "bg-primary border-primary text-black"
                  : "border-white/10 bg-zinc-900 text-white/40",
              )}
            >
              1
            </div>
            <span
              className={cn(
                "text-xs font-semibold transition-all duration-300",
                etapa >= 1 ? "text-white" : "text-white/40",
              )}
            >
              Carrito
            </span>
          </div>
          <div
            className={cn(
              "h-0.5 flex-1 transition-all duration-300",
              etapa >= 2 ? "bg-primary" : "bg-white/10",
            )}
          />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300",
                etapa >= 2
                  ? "bg-primary border-primary text-black"
                  : "border-white/10 bg-zinc-900 text-white/40",
              )}
            >
              2
            </div>
            <span
              className={cn(
                "text-xs font-semibold transition-all duration-300",
                etapa >= 2 ? "text-white" : "text-white/40",
              )}
            >
              Entrega
            </span>
          </div>
        </div>

        {/* Banner envío gratis (Solo en Etapa 2 si es Delivery) */}
        {etapa === 2 && modalidad === "domicilio" && (
          <>
            {envioGratis ? (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 shrink-0 text-green-400"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-semibold text-green-400">
                  ¡Felicitaciones! Tu pedido califica para{" "}
                  <span className="text-green-300">envío gratis</span>.
                </p>
              </div>
            ) : (
              <div className="border-white/8 mb-5 rounded-xl border bg-zinc-900 px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-white/50">
                    Agrega{" "}
                    <span className="text-primary font-semibold">
                      S/ {(500 - subtotal).toFixed(2)}
                    </span>{" "}
                    más para obtener envío gratis
                  </p>
                  <span className="text-xs text-white/30">
                    {Math.min(100, Math.round((subtotal / 500) * 100))}%
                  </span>
                </div>
                <div className="bg-white/8 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (subtotal / 500) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Layout principal */}
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          {/* ── ETAPA 1: Lista de productos ── */}
          {etapa === 1 && (
            <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onCambiarCantidad={cambiarCantidad}
                  onEliminar={eliminar}
                />
              ))}

              {/* Regresar / Continuar comprando */}
              <Link
                href="/"
                className="hover:text-primary mt-2 flex w-fit items-center gap-2 text-sm text-white/40 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                    clipRule="evenodd"
                  />
                </svg>
                Continuar comprando
              </Link>
            </div>
          )}

          {/* ── ETAPA 2: Datos de entrega ── */}
          {etapa === 2 && (
            <div className="border-white/8 flex w-full min-w-0 flex-1 flex-col gap-6 rounded-2xl border bg-zinc-900 p-6">
              <h2 className="text-lg font-bold text-white">Datos de entrega</h2>

              {/* Selector de Modalidad */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setModalidad("tienda")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2.5 rounded-xl border px-4 py-4 text-sm font-bold transition-all duration-200 sm:flex-row",
                    modalidad === "tienda"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-white/8 bg-zinc-950 text-white/60 hover:border-white/20 hover:text-white",
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 shrink-0"
                  >
                    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-1.56-1.561V5.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v2.116L12 3.53 2.47 11.47a.75.75 0 001.06 1.06l1.061-1.06V19.5a2.25 2.25 0 002.25 2.25H9a.75.75 0 00.75-.75v-4.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21a.75.75 0 00.75.75h3.418a2.25 2.25 0 002.25-2.25V11.47l1.061 1.06a.75.75 0 101.06-1.06l-8.69-8.69z" />
                  </svg>
                  Recojo en tienda
                </button>

                <button
                  type="button"
                  onClick={() => setModalidad("domicilio")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2.5 rounded-xl border px-4 py-4 text-sm font-bold transition-all duration-200 sm:flex-row",
                    modalidad === "domicilio"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-white/8 bg-zinc-950 text-white/60 hover:border-white/20 hover:text-white",
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 shrink-0"
                  >
                    <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h3a3 3 0 1 1 6 0h.375c1.035 0 1.875-.84 1.875-1.875V15h-9ZM8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 0 0-3.732-10.104 1.837 1.837 0 0 0-1.47-.725H15.75Z" />
                  </svg>
                  Delivery a domicilio
                </button>
              </div>

              {/* Contenido según modalidad */}
              {modalidad === "tienda" ? (
                <div className="border-white/8 flex flex-col gap-4 rounded-xl border bg-zinc-950 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="text-primary h-4 w-4 shrink-0"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.375 7.592.83.8 1.653 1.38 2.273 1.765.312.193.572.337.758.433a5.736 5.736 0 00.299.148l.024.01.007.003zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Información de la Tienda Principal
                  </h3>
                  <div className="flex flex-col gap-2.5 text-sm text-white/60">
                    <p>
                      <strong className="text-white">Dirección:</strong> Av.
                      Industrial 123, Ate, Lima, Perú
                    </p>
                    <p>
                      <strong className="text-white">
                        Horario de atención:
                      </strong>{" "}
                      Lunes a Sábado: 8:00 AM - 6:00 PM
                    </p>
                    <p>
                      <strong className="text-white">Costo de envío:</strong>{" "}
                      <span className="font-bold text-green-400">S/ 0.00</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="text-primary h-4 w-4"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                    Formulario de Delivery
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-white/50">
                        Nombre de quien recibe *
                      </label>
                      <input
                        type="text"
                        name="nombreRecibe"
                        value={deliveryForm.nombreRecibe}
                        onChange={handleFormChange}
                        placeholder="Ej. Juan Pérez"
                        className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-white/50">
                        Teléfono de contacto *
                      </label>
                      <input
                        type="text"
                        name="telefono"
                        value={deliveryForm.telefono}
                        onChange={handleFormChange}
                        placeholder="Ej. 987654321"
                        className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      />
                    </div>

                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className="text-xs font-semibold text-white/50">
                        Dirección exacta *
                      </label>
                      <input
                        type="text"
                        name="direccion"
                        value={deliveryForm.direccion}
                        onChange={handleFormChange}
                        placeholder="Ej. Av. Javier Prado Este 456, Dpto 502"
                        className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-white/50">
                        Distrito *
                      </label>
                      <input
                        type="text"
                        name="distrito"
                        value={deliveryForm.distrito}
                        onChange={handleFormChange}
                        placeholder="Ej. La Molina"
                        className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-white/50">
                        Fecha o rango de entrega (opcional)
                      </label>
                      <input
                        type="text"
                        name="fechaEntrega"
                        value={deliveryForm.fechaEntrega}
                        onChange={handleFormChange}
                        placeholder="Ej. Mañana de 9am a 1pm"
                        className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      />
                    </div>

                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className="text-xs font-semibold text-white/50">
                        Referencia de la dirección *
                      </label>
                      <input
                        type="text"
                        name="referencia"
                        value={deliveryForm.referencia}
                        onChange={handleFormChange}
                        placeholder="Ej. A una cuadra del centro comercial"
                        className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      />
                    </div>

                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className="text-xs font-semibold text-white/50">
                        Comentarios adicionales para el repartidor
                      </label>
                      <textarea
                        name="comentarios"
                        value={deliveryForm.comentarios}
                        onChange={handleFormChange}
                        placeholder="Ej. Edificio gris, timbre 5B..."
                        rows={3}
                        className="border-white/8 focus:border-primary w-full resize-none rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CARD RESUMEN DEL PEDIDO ── */}

          {/* Resumen Etapa 1 */}
          {etapa === 1 && (
            <aside className="sticky top-20 w-full shrink-0 lg:w-80">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                {/* Header */}
                <div className="border-white/8 border-b px-5 py-4">
                  <h2 className="text-sm font-bold text-white">
                    Resumen del pedido
                  </h2>
                </div>

                <div className="flex flex-col gap-5 px-5 py-5">
                  {/* Totales */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        Subtotal de productos
                      </span>
                      <span className="text-sm font-semibold text-white">
                        S/ {subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-white/8 h-px" aria-hidden="true" />

                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white">
                        Total preliminar
                      </span>
                      <span className="text-primary text-xl font-black">
                        S/ {subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* CTA Continuar */}
                  <button
                    type="button"
                    onClick={() => setEtapa(2)}
                    className="bg-primary shadow-primary/20 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-black shadow-lg transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
                  >
                    Continuar
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 0 1 .75-.75h10.63l-3-2.72a.75.75 0 1 1 1.04-1.08l4.5 4.08a.75.75 0 0 1 0 1.08l-4.5 4.08a.75.75 0 1 1-1.04-1.08l3-2.72H3.75A.75.75 0 0 1 3 10Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <Link
                    href="/"
                    className="hover:text-primary py-1 text-center text-xs text-white/40 transition-colors duration-200"
                  >
                    Continuar comprando
                  </Link>
                </div>
              </div>
            </aside>
          )}

          {/* Resumen Etapa 2 */}
          {etapa === 2 && (
            <aside className="sticky top-20 w-full shrink-0 lg:w-80">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                {/* Header */}
                <div className="border-white/8 border-b px-5 py-4">
                  <h2 className="text-sm font-bold text-white">
                    Resumen del pedido
                  </h2>
                </div>

                <div className="flex flex-col gap-5 px-5 py-5">
                  {/* Totales */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Subtotal</span>
                      <span className="text-sm font-semibold text-white">
                        S/ {subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Modalidad</span>
                      <span className="max-w-[150px] truncate text-xs font-semibold text-white">
                        {modalidad === "tienda"
                          ? "Recojo en Tienda"
                          : "Delivery"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        Costo de envío
                      </span>
                      {modalidad === "domicilio" && !isFormValid ? (
                        <span className="text-xs italic text-white/30">
                          Pendiente de datos
                        </span>
                      ) : costoEnvioFinal === 0 ? (
                        <span className="text-sm font-semibold text-green-400">
                          Gratis
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-white">
                          S/ {costoEnvioFinal.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="bg-white/8 h-px" aria-hidden="true" />

                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white">
                        Total final
                      </span>
                      <span className="text-primary text-xl font-black">
                        S/ {totalFinal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* CTA Pago */}
                  <button
                    type="button"
                    disabled={modalidad === "domicilio" && !isFormValid}
                    onClick={handleProcederPago}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-lg transition-all duration-200 active:scale-[0.98]",
                      modalidad === "domicilio" && !isFormValid
                        ? "border-white/8 cursor-not-allowed border bg-white/5 text-white/20 shadow-none"
                        : "bg-primary shadow-primary/20 text-black hover:brightness-95",
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15ZM22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5ZM12 12.75a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-1.5 0v-.01a.75.75 0 0 1 .75-.75ZM7.5 12.75a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-1.5 0v-.01a.75.75 0 0 1 .75-.75Z" />
                    </svg>
                    Proceder al pago
                  </button>

                  <button
                    type="button"
                    onClick={() => setEtapa(1)}
                    className="hover:text-primary w-full py-1 text-center text-xs text-white/40 transition-colors duration-200"
                  >
                    Regresar al carrito
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Modal de Pago */}
      {mostrarModalPago && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !procesandoPago && setMostrarModalPago(false)}
          />

          <div className="border-white/8 animate-scale-up relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col gap-6 overflow-y-auto rounded-2xl border bg-zinc-900 p-6 text-white shadow-2xl">
            {procesandoPago ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
                <p className="text-sm font-bold tracking-wide text-white">
                  Procesando pago...
                </p>
              </div>
            ) : (
              <>
                <div className="border-white/8 flex items-center justify-between border-b pb-3">
                  <h2 className="text-lg font-black tracking-tight text-white">
                    Datos de pago
                  </h2>
                  <button
                    type="button"
                    onClick={() => setMostrarModalPago(false)}
                    className="text-white/40 transition-colors duration-150 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form
                  onSubmit={handlePagarAhora}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/50">
                      Nombre del titular de la tarjeta *
                    </label>
                    <input
                      type="text"
                      name="titular"
                      value={paymentForm.titular}
                      onChange={(e) => {
                        setPaymentForm((prev) => ({
                          ...prev,
                          titular: e.target.value,
                        }));
                        if (paymentErrors.titular)
                          setPaymentErrors((prev) => ({
                            ...prev,
                            titular: "",
                          }));
                      }}
                      placeholder="Ej. Juan Pérez Ramos"
                      className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                    />
                    {paymentErrors.titular && (
                      <span className="text-[11px] font-semibold text-red-400">
                        {paymentErrors.titular}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/50">
                      Número de tarjeta *
                    </label>
                    <input
                      type="text"
                      name="numeroTarjeta"
                      value={paymentForm.numeroTarjeta}
                      onChange={(e) => {
                        handleNumeroTarjetaChange(e);
                        if (paymentErrors.numeroTarjeta)
                          setPaymentErrors((prev) => ({
                            ...prev,
                            numeroTarjeta: "",
                          }));
                      }}
                      placeholder="Ej. 4557123456789012"
                      className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                    />
                    {paymentErrors.numeroTarjeta && (
                      <span className="text-[11px] font-semibold text-red-400">
                        {paymentErrors.numeroTarjeta}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/50">
                        Vencimiento (MM/AA) *
                      </label>
                      <input
                        type="text"
                        name="vencimiento"
                        value={paymentForm.vencimiento}
                        onChange={(e) => {
                          handleVencimientoChange(e);
                          if (paymentErrors.vencimiento)
                            setPaymentErrors((prev) => ({
                              ...prev,
                              vencimiento: "",
                            }));
                        }}
                        placeholder="Ej. 12/28"
                        className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      />
                      {paymentErrors.vencimiento && (
                        <span className="text-[11px] font-semibold text-red-400">
                          {paymentErrors.vencimiento}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/50">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentForm.cvv}
                        onChange={(e) => {
                          handleCvvChange(e);
                          if (paymentErrors.cvv)
                            setPaymentErrors((prev) => ({ ...prev, cvv: "" }));
                        }}
                        placeholder="Ej. 123"
                        className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      />
                      {paymentErrors.cvv && (
                        <span className="text-[11px] font-semibold text-red-400">
                          {paymentErrors.cvv}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/50">
                        DNI / Doc. Identidad *
                      </label>
                      <input
                        type="text"
                        name="dni"
                        value={paymentForm.dni}
                        onChange={(e) => {
                          handleDniChange(e);
                          if (paymentErrors.dni)
                            setPaymentErrors((prev) => ({ ...prev, dni: "" }));
                        }}
                        placeholder="Ej. 76543210"
                        className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      />
                      {paymentErrors.dni && (
                        <span className="text-[11px] font-semibold text-red-400">
                          {paymentErrors.dni}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/50">
                        Correo de Confirmación *
                      </label>
                      <input
                        type="email"
                        name="correo"
                        value={paymentForm.correo}
                        onChange={(e) => {
                          setPaymentForm((prev) => ({
                            ...prev,
                            correo: e.target.value,
                          }));
                          if (paymentErrors.correo)
                            setPaymentErrors((prev) => ({
                              ...prev,
                              correo: "",
                            }));
                        }}
                        placeholder="Ej. correo@dominio.com"
                        className="border-white/8 focus:border-primary w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      />
                      {paymentErrors.correo && (
                        <span className="text-[11px] font-semibold text-red-400">
                          {paymentErrors.correo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-white/8 mt-2 flex flex-col gap-2.5 rounded-xl border bg-zinc-950 p-4 text-xs text-white/60">
                    <h3 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Resumen del pago
                    </h3>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-white">
                        S/ {subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        Envío ({modalidad === "tienda" ? "Recojo" : "Delivery"}
                        ):
                      </span>
                      <span
                        className={
                          costoEnvioFinal === 0
                            ? "font-semibold text-green-400"
                            : "font-semibold text-white"
                        }
                      >
                        {costoEnvioFinal === 0
                          ? "Gratis"
                          : `S/ ${costoEnvioFinal.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="bg-white/8 my-1 h-px" />
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-white">
                        Total a pagar:
                      </span>
                      <span className="text-primary font-black">
                        S/ {totalFinal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setMostrarModalPago(false)}
                      className="border-white/8 rounded-xl border py-3 text-sm font-bold transition-all duration-200 hover:bg-white/5 active:scale-[0.98]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-primary shadow-primary/20 rounded-xl py-3 text-sm font-bold text-black shadow-lg transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
                    >
                      Pagar ahora
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────

function ItemCard({
  item,
  onCambiarCantidad,
  onEliminar,
}: {
  item: ItemCarrito;
  onCambiarCantidad: (id: string, cantidad: number) => void;
  onEliminar: (id: string) => void;
}) {
  const subtotalItem = item.precio * item.cantidad;

  return (
    <div className="border-white/8 hover:border-white/12 flex gap-4 rounded-2xl border bg-zinc-900 p-4 transition-colors duration-200">
      {/* Imagen */}
      <Link href={`/producto/${item.id}`} className="shrink-0">
        <div className="border-white/8 h-20 w-20 overflow-hidden rounded-xl border bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imagen}
            alt={item.nombre}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/producto/${item.id}`}
            className="hover:text-primary line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors duration-200"
          >
            {item.nombre}
          </Link>
          {/* Botón eliminar */}
          <button
            type="button"
            onClick={() => onEliminar(item.id)}
            aria-label={`Eliminar ${item.nombre} del carrito`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/25 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Precio unitario */}
          <span className="text-xs text-white/40">
            S/ {item.precio.toFixed(2)} c/u
          </span>

          {/* Selector cantidad */}
          <div className="border-white/12 bg-white/4 flex items-center overflow-hidden rounded-lg border">
            <button
              type="button"
              onClick={() => onCambiarCantidad(item.id, item.cantidad - 1)}
              disabled={item.cantidad <= 1}
              aria-label="Reducir cantidad"
              className="hover:bg-white/8 flex h-8 w-8 items-center justify-center text-white/40 transition-all duration-150 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="w-8 select-none text-center text-sm font-bold text-white">
              {item.cantidad}
            </span>
            <button
              type="button"
              onClick={() => onCambiarCantidad(item.id, item.cantidad + 1)}
              disabled={item.cantidad >= item.stock}
              aria-label="Aumentar cantidad"
              className="hover:bg-white/8 flex h-8 w-8 items-center justify-center text-white/40 transition-all duration-150 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 10 3Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Subtotal */}
          <span className="text-primary text-base font-black">
            S/ {subtotalItem.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
