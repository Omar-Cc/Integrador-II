"use client";

import { useState, useMemo } from "react";
import { cn } from "@marweld/ui/lib/utils";
import { ProductoCard } from "./producto-card";
import type { Producto, Categoria, Marca } from "../types/producto.types";

const CATEGORIAS: Categoria[] = [
  "Soldadura",
  "Herramientas",
  "Seguridad",
  "Abrasivos",
];
const MARCAS: Marca[] = ["Lincoln", "Miller", "ESAB", "3M", "Bosch", "DeWalt"];

type CatalogoFiltrosProps = {
  productos: Producto[];
};

export function CatalogoFiltros({ productos }: CatalogoFiltrosProps) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "">("");
  const [marca, setMarca] = useState<Marca | "">("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [precioMax, setPrecioMax] = useState(2500);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const filtrados = useMemo(() => {
    return productos.filter((p) => {
      const q = busqueda.toLowerCase();
      const matchBusqueda =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcionCorta.toLowerCase().includes(q);
      const matchCategoria = !categoria || p.categoria === categoria;
      const matchMarca = !marca || p.marca === marca;
      const matchPrecio = p.precio <= precioMax;
      const matchDisponible = !soloDisponibles || p.disponible;
      return (
        matchBusqueda &&
        matchCategoria &&
        matchMarca &&
        matchPrecio &&
        matchDisponible
      );
    });
  }, [productos, busqueda, categoria, marca, precioMax, soloDisponibles]);

  const limpiarFiltros = () => {
    setCategoria("");
    setMarca("");
    setSoloDisponibles(false);
    setPrecioMax(2500);
    setBusqueda("");
  };

  const hayFiltrosActivos =
    categoria || marca || soloDisponibles || precioMax < 2500 || busqueda;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ── Hero ── */}
      <section className="border-white/8 border-b bg-black px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Catálogo de Productos
            </h1>
            <p className="mt-1 text-sm text-white/40">
              Materiales y herramientas para soldadura y construcción
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              className="bg-white/6 focus:border-primary/50 focus:ring-primary/15 w-full rounded-xl border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/25 focus:ring-2"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl gap-7 px-5 py-8">
        {/* ── Sidebar filtros (desktop) ── */}
        <aside className="hidden w-56 shrink-0 flex-col gap-5 lg:flex">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">Filtros</span>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="text-primary/80 hover:text-primary text-[11px] transition-colors duration-200"
              >
                Limpiar
              </button>
            )}
          </div>

          <FiltroGrupo titulo="Categoría">
            <div className="flex flex-col gap-1">
              {CATEGORIAS.map((cat) => (
                <FiltroChip
                  key={cat}
                  label={cat}
                  activo={categoria === cat}
                  onClick={() => setCategoria(categoria === cat ? "" : cat)}
                />
              ))}
            </div>
          </FiltroGrupo>

          <FiltroGrupo titulo="Marca">
            <div className="flex flex-col gap-1">
              {MARCAS.map((m) => (
                <FiltroChip
                  key={m}
                  label={m}
                  activo={marca === m}
                  onClick={() => setMarca(marca === m ? "" : m)}
                />
              ))}
            </div>
          </FiltroGrupo>

          <FiltroGrupo titulo="Precio máximo">
            <div className="flex flex-col gap-2">
              <input
                type="range"
                min={10}
                max={2500}
                step={10}
                value={precioMax}
                onChange={(e) => setPrecioMax(Number(e.target.value))}
                className="accent-primary w-full cursor-pointer"
                aria-label="Precio máximo"
              />
              <div className="flex justify-between text-[11px] text-white/40">
                <span>S/ 0</span>
                <span
                  className="text-primary font-semibold"
                  suppressHydrationWarning
                >
                  S/ {precioMax.toLocaleString()}
                </span>
              </div>
            </div>
          </FiltroGrupo>

          <FiltroGrupo titulo="Disponibilidad">
            <button
              type="button"
              role="switch"
              aria-checked={soloDisponibles}
              onClick={() => setSoloDisponibles((v) => !v)}
              className="group flex w-fit cursor-pointer items-center gap-2.5"
            >
              <div
                className={cn(
                  "relative h-5 w-9 rounded-full border transition-all duration-200",
                  soloDisponibles
                    ? "bg-primary border-primary"
                    : "bg-white/8 border-white/15",
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200",
                    soloDisponibles ? "left-[18px]" : "left-0.5",
                  )}
                />
              </div>
              <span className="text-xs text-white/60 transition-colors duration-200 group-hover:text-white">
                Solo disponibles
              </span>
            </button>
          </FiltroGrupo>
        </aside>

        {/* ── Contenido principal ── */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Barra top */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-white/40">
              <span className="font-semibold text-white">
                {filtrados.length}
              </span>{" "}
              productos
            </p>
            <button
              className="bg-white/6 flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-medium text-white/70 transition-all duration-200 hover:text-white lg:hidden"
              onClick={() => setFiltrosAbiertos((v) => !v)}
              aria-expanded={filtrosAbiertos}
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
                  d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z"
                  clipRule="evenodd"
                />
              </svg>
              Filtros{" "}
              {hayFiltrosActivos && (
                <span
                  className="bg-primary h-1.5 w-1.5 rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          {/* Panel filtros móvil */}
          {filtrosAbiertos && (
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 lg:hidden">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                  Categoría
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIAS.map((cat) => (
                    <FiltroChip
                      key={cat}
                      label={cat}
                      activo={categoria === cat}
                      onClick={() => setCategoria(categoria === cat ? "" : cat)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                  Marca
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {MARCAS.map((m) => (
                    <FiltroChip
                      key={m}
                      label={m}
                      activo={marca === m}
                      onClick={() => setMarca(marca === m ? "" : m)}
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={soloDisponibles}
                    onChange={(e) => setSoloDisponibles(e.target.checked)}
                    className="accent-primary h-3.5 w-3.5"
                  />
                  Solo disponibles
                </label>
                {hayFiltrosActivos && (
                  <button
                    onClick={limpiarFiltros}
                    className="text-primary/80 hover:text-primary text-xs transition-colors duration-200"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Grid de productos */}
          {filtrados.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-10 w-10 text-white/15"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-white/40">
                No se encontraron productos con esos filtros.
              </p>
              <button
                onClick={limpiarFiltros}
                className="text-primary/80 hover:text-primary text-sm font-medium transition-colors duration-200"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtrados.map((p) => (
                <ProductoCard key={p.id} producto={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Subcomponentes internos ──

function FiltroGrupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
        {titulo}
      </p>
      {children}
      <div className="bg-white/6 h-px" />
    </div>
  );
}

function FiltroChip({
  label,
  activo,
  onClick,
}: {
  label: string;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-all duration-150",
        activo
          ? "bg-primary/15 border-primary/40 text-primary"
          : "hover:bg-white/6 border-transparent bg-transparent text-white/50 hover:text-white",
      )}
    >
      {label}
    </button>
  );
}
