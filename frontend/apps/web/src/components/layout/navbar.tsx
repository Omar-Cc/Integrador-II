"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@marweld/ui/lib/utils";
import { useCarritoStore } from "../../features/carrito/stores/carrito.store";
import { useAuthStore } from "../../shared/stores/auth.store";

export default function Navbar() {
  const { user, initialize, logout } = useAuthStore();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCarritoStore((s) =>
    s.items.reduce((acc, i) => acc + i.cantidad, 0),
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  const activeName = user ? user.name : "";
  const activeRole = user ? user.role : "";

  const initials = activeName
    ? activeName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Barra principal */}
      <div className="border-white/8 border-b bg-zinc-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-5">
          {/* ── Logo ── */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3"
            aria-label="Marweld Perú — Inicio"
          >
            <div className="bg-primary shadow-primary/20 group-hover:shadow-primary/40 flex h-8 w-8 items-center justify-center rounded-lg shadow-lg transition-all duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4.5 h-4.5 text-black"
                aria-hidden="true"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-1.56-1.561V5.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v2.116L12 3.53 2.47 11.47a.75.75 0 001.06 1.06l1.061-1.06V19.5a2.25 2.25 0 002.25 2.25H9a.75.75 0 00.75-.75v-4.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21a.75.75 0 00.75.75h3.418a2.25 2.25 0 002.25-2.25V11.47l1.061 1.06a.75.75 0 101.06-1.06l-8.69-8.69z" />
              </svg>
            </div>
            <div className="hidden leading-none sm:block">
              <span className="block text-[15px] font-bold tracking-tight text-white">
                Marweld Perú
              </span>
              <span className="text-primary/70 text-[10px] font-semibold uppercase tracking-[0.2em]">
                S.A.C.
              </span>
            </div>
          </Link>

          {/* ── Buscador central ── */}
          <div className="hidden max-w-lg flex-1 md:block">
            <div className="relative">
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
                className="bg-white/6 border-white/8 hover:bg-white/8 focus:border-primary/50 focus:ring-primary/15 w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/25 hover:border-white/15 focus:bg-white/10 focus:ring-2"
              />
            </div>
          </div>

          {/* ── Acciones derechas ── */}
          <div className="ml-auto flex items-center gap-2">
            {/* Carrito */}
            <Link
              href="/carrito"
              aria-label={`Carrito${cartCount > 0 ? `, ${cartCount} productos` : ""}`}
              className="border-white/8 group relative flex h-9 items-center gap-2 rounded-xl border bg-white/5 px-3.5 text-white/60 transition-all duration-200 hover:border-white/15 hover:bg-white/10 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4.5 h-4.5 group-hover:text-primary transition-colors duration-200"
                aria-hidden="true"
              >
                <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
              </svg>
              <span className="hidden text-xs font-medium sm:inline">
                Carrito
              </span>
              {cartCount > 0 && (
                <span className="bg-primary shadow-primary/40 absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-black shadow-sm">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Separador */}
            <div
              className="hidden h-6 w-px bg-white/10 sm:block"
              aria-hidden="true"
            />

            {user ? (
              <>
                {/* Usuario */}
                <div className="border-white/8 hover:bg-white/8 hidden h-9 cursor-default items-center gap-2 rounded-xl border bg-white/5 pl-1 pr-3 transition-all duration-200 hover:border-white/15 sm:flex">
                  <div className="bg-primary shadow-primary/30 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm">
                    <span className="text-[11px] font-black leading-none text-black">
                      {initials}
                    </span>
                  </div>
                  <div className="leading-none">
                    <p className="text-xs font-semibold leading-none text-white">
                      {activeName}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-none text-white/35">
                      {activeRole}
                    </p>
                  </div>
                </div>

                {/* Salir */}
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Cerrar sesión"
                  className="group hidden h-9 items-center gap-1.5 rounded-xl border border-transparent px-3 text-white/40 transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/10 hover:text-white sm:flex"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4 transition-colors duration-200 group-hover:text-red-400"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm5.03 4.72a.75.75 0 0 1 0 1.06l-1.72 1.72h10.94a.75.75 0 0 1 0 1.5H10.81l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 0 1 1.06 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs font-medium">Salir</span>
                </button>
              </>
            ) : (
              /* Botón Ingresar */
              <Link
                href="/login"
                className="bg-primary shadow-primary/10 flex h-9 items-center justify-center rounded-xl px-4 text-xs font-bold text-black shadow-md transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
              >
                Ingresar
              </Link>
            )}

            {/* Hamburger (mobile) */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              className="border-white/8 flex h-9 w-9 items-center justify-center rounded-xl border bg-white/5 text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4.5 h-4.5"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Menú móvil ── */}
      <div
        className={cn(
          "border-white/8 overflow-hidden border-b bg-zinc-950 transition-all duration-300 md:hidden",
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4">
          {/* Buscador móvil */}
          <div className="relative">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              className="bg-white/6 border-white/8 focus:border-primary/50 focus:ring-primary/15 w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/25 focus:ring-2"
            />
          </div>

          {/* Info usuario */}
          {user ? (
            <div className="flex items-center gap-3 px-1">
              <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
                <span className="text-xs font-black text-black">
                  {initials}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{activeName}</p>
                <p className="text-xs text-white/40">{activeRole}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-all duration-200 hover:bg-red-500/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm5.03 4.72a.75.75 0 0 1 0 1.06l-1.72 1.72h10.94a.75.75 0 0 1 0 1.5H10.81l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 0 1 1.06 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                Salir
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-primary shadow-primary/10 flex h-10 items-center justify-center rounded-xl px-4 text-sm font-bold text-black shadow-md transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
