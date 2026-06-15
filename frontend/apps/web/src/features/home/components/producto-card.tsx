"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@marweld/ui/lib/utils";
import { useCarritoStore } from "../../carrito/stores/carrito.store";
import type { Producto } from "../types/producto.types";

type ProductoCardProps = {
  producto: Producto;
};

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCarritoStore((s) => s.agregar);
  const [agregado, setAgregado] = useState(false);

  const descuento = producto.precioAnterior
    ? Math.round((1 - producto.precio / producto.precioAnterior) * 100)
    : null;

  const handleAgregar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!producto.disponible) return;
    agregar({
      id: producto.id,
      nombre: producto.nombre,
      imagen: producto.imagen,
      precio: producto.precio,
      stock: producto.stock,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  return (
    <div className="border-white/8 hover:border-primary/40 hover:shadow-primary/5 group flex flex-col overflow-hidden rounded-2xl border bg-zinc-900 transition-all duration-300 hover:shadow-xl">
      {/* Imagen — clickeable al detalle */}
      <Link
        href={`/producto/${producto.id}`}
        className="relative block aspect-square overflow-hidden bg-zinc-800"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={producto.imagen}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {descuento && (
            <span className="bg-primary rounded-md px-2 py-0.5 text-[10px] font-black leading-tight text-black">
              -{descuento}%
            </span>
          )}
          {producto.destacado && (
            <span className="rounded-md border border-white/10 bg-zinc-800/90 px-2 py-0.5 text-[10px] font-semibold leading-tight text-white/70 backdrop-blur">
              Destacado
            </span>
          )}
        </div>
        {!producto.disponible && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white/70">
              Sin stock
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Categoria + Marca */}
        <div className="flex items-center gap-1.5">
          <span className="text-primary/80 bg-primary/10 rounded-md px-2 py-0.5 text-[10px] font-semibold">
            {producto.categoria}
          </span>
          <span className="text-[10px] text-white/30">{producto.marca}</span>
        </div>

        {/* Nombre — clickeable al detalle */}
        <Link
          href={`/producto/${producto.id}`}
          aria-label={`Ver detalle de ${producto.nombre}`}
        >
          <h3 className="hover:text-primary line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors duration-200">
            {producto.nombre}
          </h3>
        </Link>

        {/* Descripción */}
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-white/40">
          {producto.descripcionCorta}
        </p>

        {/* Precio + CTA */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="text-primary text-lg font-black leading-none">
              S/ {producto.precio.toFixed(2)}
            </p>
            {producto.precioAnterior && (
              <p className="mt-0.5 text-xs text-white/30 line-through">
                S/ {producto.precioAnterior.toFixed(2)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAgregar}
            disabled={!producto.disponible}
            aria-label={`Agregar ${producto.nombre} al carrito`}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
              agregado
                ? "scale-95 border-green-500 bg-green-500 text-white"
                : producto.disponible
                  ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary border hover:text-black"
                  : "cursor-not-allowed border border-white/10 bg-white/5 text-white/20",
            )}
          >
            {agregado ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
