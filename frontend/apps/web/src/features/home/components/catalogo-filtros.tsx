"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@marweld/ui/lib/utils";
import { ProductoCard } from "./producto-card";
import { getProductos } from "../services/productos.service";
import type { Categoria, Marca, Producto } from "../types/producto.types";

const CATEGORIAS: Categoria[] = [
  "Soldadura",
  "Herramientas",
  "Seguridad",
  "Abrasivos",
  "Electricidad",
];

const PRICE_LIMIT = 5000;

type Orden = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

type CatalogoFiltrosProps = {
  productos: Producto[];
};

function parsePrice(value: string | null, fallback: number) {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? Math.min(price, PRICE_LIMIT) : fallback;
}

export function CatalogoFiltros({ productos: initialProductos }: CatalogoFiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState<Producto[]>(initialProductos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [busqueda, setBusqueda] = useState(() => searchParams.get("q") ?? "");
  const [categoria, setCategoria] = useState<Categoria | "">(
    () => (CATEGORIAS.includes(searchParams.get("categoria") as Categoria)
      ? searchParams.get("categoria") as Categoria
      : ""),
  );
  const [soloDisponibles, setSoloDisponibles] = useState(
    () => searchParams.get("disponibles") === "1",
  );
  const [precioMin, setPrecioMin] = useState(() => parsePrice(searchParams.get("precioMin"), 0));
  const [precioMax, setPrecioMax] = useState(() => parsePrice(searchParams.get("precioMax"), PRICE_LIMIT));
  const [orden, setOrden] = useState<Orden>(
    () => (searchParams.get("orden") as Orden) || "relevancia",
  );

  useEffect(() => {
    const nextBusqueda = searchParams.get("q") ?? "";
    const nextCategoria = searchParams.get("categoria") as Categoria | null;
    const nextDisponibles = searchParams.get("disponibles") === "1";
    const nextMin = parsePrice(searchParams.get("precioMin"), 0);
    const nextMax = parsePrice(searchParams.get("precioMax"), PRICE_LIMIT);
    const nextOrden = searchParams.get("orden") as Orden | null;

    setBusqueda(nextBusqueda);
    setCategoria(nextCategoria && CATEGORIAS.includes(nextCategoria) ? nextCategoria : "");
    setSoloDisponibles(nextDisponibles);
    setPrecioMin(Math.min(nextMin, nextMax));
    setPrecioMax(Math.max(nextMin, nextMax));
    setOrden(nextOrden && ["relevancia", "precio-asc", "precio-desc", "nombre"].includes(nextOrden)
      ? nextOrden
      : "relevancia");
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(false);
      getProductos({
        categoria: categoria || undefined,
        precioMin: precioMin || undefined,
        precioMax: precioMax < PRICE_LIMIT ? precioMax : undefined,
        soloDisponibles: soloDisponibles || undefined,
        busqueda: busqueda.trim() || undefined,
      })
        .then(setProductos)
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [busqueda, categoria, soloDisponibles, precioMin, precioMax]);

  useEffect(() => {
    const query = new URLSearchParams();
    if (busqueda.trim()) query.set("q", busqueda.trim());
    if (categoria) query.set("categoria", categoria);
    if (soloDisponibles) query.set("disponibles", "1");
    if (precioMin > 0) query.set("precioMin", String(precioMin));
    if (precioMax < PRICE_LIMIT) query.set("precioMax", String(precioMax));
    if (orden !== "relevancia") query.set("orden", orden);

    const nextQuery = query.toString();
    if (nextQuery !== searchParams.toString()) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [busqueda, categoria, soloDisponibles, precioMin, precioMax, orden, pathname, router, searchParams]);

  const productosOrdenados = useMemo(() => {
    const sorted = [...productos];
    if (orden === "precio-asc") return sorted.sort((a, b) => a.precio - b.precio);
    if (orden === "precio-desc") return sorted.sort((a, b) => b.precio - a.precio);
    if (orden === "nombre") return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return sorted;
  }, [productos, orden]);

  const hayFiltrosActivos = Boolean(
    busqueda || categoria || soloDisponibles || precioMin > 0 || precioMax < PRICE_LIMIT || orden !== "relevancia",
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoria("");
    setSoloDisponibles(false);
    setPrecioMin(0);
    setPrecioMax(PRICE_LIMIT);
    setOrden("relevancia");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-black px-5 py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-0 top-8 h-px w-2/3 bg-gradient-to-l from-primary/60 to-transparent" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_25rem] lg:items-end">
          <div>
            <p className="text-primary text-[11px] font-black uppercase tracking-[0.28em]">Catálogo técnico</p>
            <h1 className="mt-3 max-w-3xl text-balance text-3xl font-black tracking-tight text-white sm:text-5xl">
              Equipamiento preparado para el trabajo real.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
              Encuentra máquinas, consumibles y protección industrial con disponibilidad visible antes de comprar.
            </p>
          </div>

          <label className="group relative block">
            <span className="sr-only">Buscar productos</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-primary"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <input
              type="search"
              name="catalogo-busqueda"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Busca por nombre, marca o uso…"
              className="w-full rounded-2xl border border-white/10 bg-zinc-900/90 py-4 pl-12 pr-4 text-sm text-white shadow-2xl outline-none transition-colors placeholder:text-white/35 hover:border-white/20 focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>
      </section>

      <section className="border-b border-white/8 bg-zinc-950 px-5">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto py-4 [scrollbar-width:thin]">
          <button
            type="button"
            onClick={() => setCategoria("")}
            className={cn("shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors", !categoria ? "border-primary bg-primary text-black" : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white")}
          >
            Todo el catálogo
          </button>
          {CATEGORIAS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={categoria === item}
              onClick={() => setCategoria(categoria === item ? "" : item)}
              className={cn("shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors", categoria === item ? "border-primary bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white")}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8 lg:py-10">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">Filtros</h2>
              {hayFiltrosActivos && <button type="button" onClick={limpiarFiltros} className="text-primary text-xs font-bold hover:underline">Restablecer</button>}
            </div>
            <FiltrosContenido
              categoria={categoria}
              setCategoria={setCategoria}
              soloDisponibles={soloDisponibles}
              setSoloDisponibles={setSoloDisponibles}
              precioMin={precioMin}
              precioMax={precioMax}
              setPrecioMin={setPrecioMin}
              setPrecioMax={setPrecioMax}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-5">
            <p className="text-sm text-white/50" aria-live="polite">
              {loading ? "Actualizando catálogo…" : <><strong className="text-white">{productosOrdenados.length}</strong> productos encontrados</>}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltrosAbiertos((value) => !value)}
                aria-expanded={filtrosAbiertos}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-white/80 transition-colors hover:border-white/25 lg:hidden"
              >
                Filtros
                {hayFiltrosActivos && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />}
              </button>
              <label className="sr-only" htmlFor="orden-catalogo">Ordenar productos</label>
              <select
                id="orden-catalogo"
                value={orden}
                onChange={(event) => setOrden(event.target.value as Orden)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-xs font-bold text-white outline-none transition-colors hover:border-white/25 focus:border-primary/60"
              >
                <option value="relevancia">Ordenar: relevancia</option>
                <option value="precio-asc">Menor precio</option>
                <option value="precio-desc">Mayor precio</option>
                <option value="nombre">Nombre: A–Z</option>
              </select>
            </div>
          </div>

          {filtrosAbiertos && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-zinc-900 p-5 lg:hidden">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">Filtros</h2>
                {hayFiltrosActivos && <button type="button" onClick={limpiarFiltros} className="text-primary text-xs font-bold">Restablecer</button>}
              </div>
              <FiltrosContenido
                categoria={categoria}
                setCategoria={setCategoria}
                soloDisponibles={soloDisponibles}
                setSoloDisponibles={setSoloDisponibles}
                precioMin={precioMin}
                precioMax={precioMax}
                setPrecioMin={setPrecioMin}
                setPrecioMax={setPrecioMax}
              />
            </div>
          )}

          {error ? (
            <EstadoCatalogo titulo="No se pudo actualizar el catálogo" detalle="Comprueba tu conexión e inténtalo nuevamente." accion="Reintentar" onClick={() => window.location.reload()} />
          ) : productosOrdenados.length === 0 && !loading ? (
            <EstadoCatalogo titulo="No encontramos coincidencias" detalle="Prueba otra palabra o restablece los filtros para ver todos los productos." accion="Restablecer filtros" onClick={limpiarFiltros} />
          ) : (
            <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3", loading && "pointer-events-none opacity-55")}>
              {productosOrdenados.map((producto) => <ProductoCard key={producto.id} producto={producto} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

type FiltrosContenidoProps = {
  categoria: Categoria | "";
  setCategoria: (categoria: Categoria | "") => void;
  soloDisponibles: boolean;
  setSoloDisponibles: (value: boolean) => void;
  precioMin: number;
  precioMax: number;
  setPrecioMin: (value: number) => void;
  setPrecioMax: (value: number) => void;
};

function FiltrosContenido({ categoria, setCategoria, soloDisponibles, setSoloDisponibles, precioMin, precioMax, setPrecioMin, setPrecioMax }: FiltrosContenidoProps) {
  return (
    <div className="mt-6 space-y-6">
      <fieldset>
        <legend className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/45">Categoría</legend>
        <div className="space-y-1">
          {CATEGORIAS.map((item) => (
            <button key={item} type="button" onClick={() => setCategoria(categoria === item ? "" : item)} className={cn("flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors", categoria === item ? "bg-primary/12 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white")}>
              {item}
              {categoria === item && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="border-t border-white/8 pt-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">Disponibilidad</p>
            <p className="mt-1 text-xs text-white/50">Mostrar productos con stock.</p>
          </div>
          <button type="button" role="switch" aria-checked={soloDisponibles} onClick={() => setSoloDisponibles(!soloDisponibles)} className={cn("relative h-6 w-11 shrink-0 rounded-full border transition-colors", soloDisponibles ? "border-primary bg-primary" : "border-white/15 bg-white/8")}>
            <span className={cn("absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform", soloDisponibles ? "translate-x-5" : "translate-x-0.5")} />
          </button>
        </div>
      </div>

      <fieldset className="border-t border-white/8 pt-5">
        <legend className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/45">Rango de precio</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wide text-white/40">Desde
            <input type="number" min="0" max={precioMax} inputMode="decimal" value={precioMin} onChange={(event) => setPrecioMin(Math.min(Number(event.target.value) || 0, precioMax))} className="mt-1.5 w-full rounded-lg border border-white/10 bg-black px-2.5 py-2 text-xs font-bold text-white outline-none focus:border-primary/60" />
          </label>
          <label className="text-[10px] font-bold uppercase tracking-wide text-white/40">Hasta
            <input type="number" min={precioMin} max={PRICE_LIMIT} inputMode="decimal" value={precioMax} onChange={(event) => setPrecioMax(Math.max(Number(event.target.value) || 0, precioMin))} className="mt-1.5 w-full rounded-lg border border-white/10 bg-black px-2.5 py-2 text-xs font-bold text-white outline-none focus:border-primary/60" />
          </label>
        </div>
        <p className="mt-3 text-xs text-white/45">S/ {precioMin.toLocaleString("es-PE")} — S/ {precioMax.toLocaleString("es-PE")}</p>
      </fieldset>
    </div>
  );
}

function EstadoCatalogo({ titulo, detalle, accion, onClick }: { titulo: string; detalle: string; accion: string; onClick: () => void }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-zinc-900/40 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">⌕</div>
      <h2 className="mt-4 text-lg font-black text-white">{titulo}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">{detalle}</p>
      <button type="button" onClick={onClick} className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-black transition-transform hover:brightness-95 active:scale-95">{accion}</button>
    </div>
  );
}
