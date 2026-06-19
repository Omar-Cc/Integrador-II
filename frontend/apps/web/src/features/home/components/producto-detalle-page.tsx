"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@marweld/ui/lib/utils";
import { ProductoCard } from "./producto-card";
import { useCarritoStore } from "../../carrito/stores/carrito.store";
import type { Producto, PreguntaFrecuente } from "../types/producto.types";

type ProductoDetallePageProps = {
  producto: Producto;
  relacionados: Producto[];
  preguntas: PreguntaFrecuente[];
};

export function ProductoDetallePage({
  producto,
  relacionados,
  preguntas,
}: ProductoDetallePageProps) {
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null);
  const agregar = useCarritoStore((s) => s.agregar);

  const handleAgregarCarrito = () => {
    if (!producto.disponible) return;
    agregar(
      {
        id: producto.id,
        nombre: producto.nombre,
        imagen: producto.imagen,
        precio: producto.precio,
        stock: producto.stock,
      },
      cantidad,
    );
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  };

  const descuento = producto.precioAnterior
    ? Math.round((1 - producto.precio / producto.precioAnterior) * 100)
    : null;

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
          <Link
            href="/"
            className="hover:text-primary transition-colors duration-200"
          >
            {producto.categoria}
          </Link>
          <span>/</span>
          <span className="max-w-[200px] truncate text-white/60">
            {producto.nombre}
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 py-8">
        {/* ── Imagen + Info ── */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Imagen */}
          <div className="border-white/8 relative aspect-square overflow-hidden rounded-2xl border bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="h-full w-full object-cover"
            />
            {descuento && (
              <div className="bg-primary shadow-primary/30 absolute left-4 top-4 rounded-lg px-3 py-1 text-sm font-black text-black shadow-lg">
                -{descuento}% OFF
              </div>
            )}
            {!producto.disponible && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded-xl border border-white/10 bg-black/70 px-4 py-2 text-sm font-semibold text-white/70">
                  Sin stock
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-primary/80 bg-primary/10 border-primary/20 rounded-lg border px-2.5 py-1 text-xs font-semibold">
                {producto.categoria}
              </span>
              <span className="bg-white/6 border-white/8 rounded-lg border px-2.5 py-1 text-xs text-white/40">
                {producto.marca}
              </span>
              <span
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                  producto.disponible
                    ? "bg-green-400/8 border-green-400/20 text-green-400"
                    : "bg-red-400/8 border-red-400/20 text-red-400",
                )}
              >
                {producto.disponible
                  ? `En stock (${producto.stock} uds.)`
                  : "Sin stock"}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              {producto.nombre}
            </h1>

            <p className="text-sm leading-relaxed text-white/55">
              {producto.descripcionCorta}
            </p>

            {/* Precio */}
            <div className="flex items-end gap-3">
              <span className="text-primary text-4xl font-black leading-none">
                S/ {producto.precio.toFixed(2)}
              </span>
              {producto.precioAnterior && (
                <span className="mb-1 text-lg leading-none text-white/30 line-through">
                  S/ {producto.precioAnterior.toFixed(2)}
                </span>
              )}
            </div>

            <div className="bg-white/8 h-px" />

            {/* Cantidad */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center overflow-hidden rounded-xl border border-white/15 bg-white/5">
                  <button
                    type="button"
                    onClick={() => setCantidad((v) => Math.max(1, v - 1))}
                    disabled={cantidad <= 1}
                    aria-label="Reducir cantidad"
                    className="hover:bg-white/8 flex h-10 w-10 items-center justify-center text-white/50 transition-all duration-150 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
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
                        d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-white">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCantidad((v) => Math.min(producto.stock, v + 1))
                    }
                    disabled={
                      cantidad >= producto.stock || !producto.disponible
                    }
                    aria-label="Aumentar cantidad"
                    className="hover:bg-white/8 flex h-10 w-10 items-center justify-center text-white/50 transition-all duration-150 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
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
                        d="M10 3a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 10 3Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <span className="text-xs text-white/30">
                  {producto.stock} disponibles
                </span>
              </div>
            </div>

            {/* Botón carrito */}
            <button
              type="button"
              onClick={handleAgregarCarrito}
              disabled={!producto.disponible}
              className={cn(
                "flex w-full items-center justify-center gap-3 rounded-xl py-4 text-base font-bold transition-all duration-300",
                agregado
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                  : producto.disponible
                    ? "bg-primary shadow-primary/25 text-black shadow-lg hover:brightness-95 active:scale-[0.98]"
                    : "bg-white/8 border-white/8 cursor-not-allowed border text-white/25",
              )}
            >
              {agregado ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  ¡Agregado al carrito!
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                  </svg>
                  {producto.disponible ? "Agregar al carrito" : "Sin stock"}
                </>
              )}
            </button>

            {/* Descripción larga */}
            <div className="border-white/8 rounded-xl border bg-zinc-900 p-4">
              <p className="text-sm leading-relaxed text-white/50">
                {producto.descripcionLarga}
              </p>
            </div>
          </div>
        </div>

        {/* ── Características técnicas ── */}
        <section aria-labelledby="caracteristicas-titulo">
          <h2
            id="caracteristicas-titulo"
            className="mb-4 text-lg font-bold text-white"
          >
            Características técnicas
          </h2>
          <div className="border-white/8 overflow-hidden rounded-2xl border bg-zinc-900">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {producto.caracteristicas.map((c, i) => (
                <div
                  key={c.label}
                  className={cn(
                    "border-white/6 flex items-start justify-between gap-4 border-b px-5 py-3.5 last:border-b-0",
                    i % 2 === 0 ? "sm:border-r-white/6 sm:border-r" : "",
                  )}
                >
                  <span className="text-sm text-white/40">{c.label}</span>
                  <span className="text-right text-sm font-semibold text-white">
                    {c.valor}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Productos relacionados ── */}
        {relacionados.length > 0 && (
          <section aria-labelledby="relacionados-titulo">
            <h2
              id="relacionados-titulo"
              className="mb-4 text-lg font-bold text-white"
            >
              Productos relacionados
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relacionados.map((p) => (
                <ProductoCard key={p.id} producto={p} />
              ))}
            </div>
          </section>
        )}

        {/* ── Preguntas frecuentes ── */}
        <section aria-labelledby="faqs-titulo">
          <h2 id="faqs-titulo" className="mb-4 text-lg font-bold text-white">
            Preguntas frecuentes
          </h2>
          <div className="divide-white/8 border-white/8 flex flex-col divide-y overflow-hidden rounded-2xl border">
            {preguntas.map((faq, i) => (
              <div key={i} className="bg-zinc-900">
                <button
                  type="button"
                  onClick={() =>
                    setPreguntaAbierta(preguntaAbierta === i ? null : i)
                  }
                  aria-expanded={preguntaAbierta === i}
                  className="hover:bg-white/4 flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150"
                >
                  <span className="text-sm font-medium text-white/80">
                    {faq.pregunta}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={cn(
                      "text-primary h-4 w-4 shrink-0 transition-transform duration-200",
                      preguntaAbierta === i && "rotate-180",
                    )}
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {preguntaAbierta === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm leading-relaxed text-white/45">
                      {faq.respuesta}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
