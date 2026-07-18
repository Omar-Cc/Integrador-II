"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "../../../shared/api/client";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { orderService, type OrderSummary } from "../services/order.service";
import { OrderStatus } from "./order-status";

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const date = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" });

export function OrdersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.isInitialized);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!user) { router.replace("/login"); return; }
    void orderService.list().then(setOrders).catch((cause) => {
      setError(cause instanceof ApiError ? cause.message : "No se pudo cargar tu historial de pedidos.");
    }).finally(() => setLoading(false));
  }, [initialized, router, user]);

  if (!initialized || !user) return null;
  return <section className="min-h-[calc(100vh-8rem)] text-white"><div className="rounded-3xl border border-white/10 bg-zinc-900/65 p-6 shadow-2xl sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">Mis pedidos</p><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Historial y seguimiento</h1><p className="mt-2 max-w-xl text-sm leading-6 text-white/50">Revisa el estado de tus compras y entra a cada pedido para conocer su recorrido.</p></div><Link href="/productos" className="inline-flex w-fit items-center gap-2 rounded-xl border border-yellow-400/35 bg-yellow-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300">Seguir comprando <span aria-hidden="true">→</span></Link></div>
    {loading && <div className="mt-8 space-y-3" aria-live="polite"><div className="h-24 animate-pulse rounded-2xl bg-white/5" /><div className="h-24 animate-pulse rounded-2xl bg-white/5" /></div>}
    {error && <p role="alert" className="mt-7 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
    {!loading && !error && orders.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-300"><svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true"><path d="M5.25 3.75A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H17.5V3a.75.75 0 0 0-1.5 0v.75h-8.5V3A.75.75 0 0 0 6 3v.75H5.25Z" /></svg></div><h2 className="mt-4 font-semibold">Aún no tienes pedidos</h2><p className="mt-2 text-sm text-white/45">Cuando completes una compra, aparecerá aquí con su estado y seguimiento.</p></div>}
    {!loading && orders.length > 0 && <div className="mt-8 space-y-3">{orders.map((order) => <Link key={order.publicId} href={`/mis-pedidos/${order.publicId}`} className="group grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-yellow-400/35 hover:bg-white/[0.06] sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-semibold text-white">Pedido <span className="font-mono text-sm text-white/55">#{order.publicId.slice(0, 8).toUpperCase()}</span></p><p className="mt-1 text-sm text-white/45">{date.format(new Date(order.fechaPedido))} · {order.cantidadProductos} {order.cantidadProductos === 1 ? "producto" : "productos"}</p></div><div className="sm:justify-self-center"><OrderStatus code={order.estadoCodigo} label={order.estadoNombre} /></div><div className="flex items-center justify-between gap-5 sm:justify-self-end"><span className="font-bold text-yellow-300">{money.format(order.total)}</span><svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-yellow-300" aria-hidden="true"><path fillRule="evenodd" d="M7.22 4.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06L11.19 10 7.22 6.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg></div></Link>)}</div>}
  </div></section>;
}
