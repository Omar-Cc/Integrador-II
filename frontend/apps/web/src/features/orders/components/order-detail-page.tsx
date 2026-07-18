"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "../../../shared/api/client";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { orderService, type OrderDetail } from "../services/order.service";
import { OrderStatus } from "./order-status";

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const dateTime = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" });

export function OrderDetailPage({ publicId }: Readonly<{ publicId: string }>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.isInitialized);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!initialized) return; if (!user) { router.replace("/login"); return; } void orderService.detail(publicId).then(setOrder).catch((cause) => setError(cause instanceof ApiError ? cause.message : "No se pudo cargar el detalle del pedido.")); }, [initialized, publicId, router, user]);
  if (!initialized || !user) return null;
  if (error) return <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-100"><p role="alert">{error}</p><Link href="/mis-pedidos" className="mt-5 inline-block text-sm font-bold text-yellow-300">Volver a mis pedidos</Link></section>;
  if (!order) return <section className="space-y-4" aria-live="polite"><div className="h-36 animate-pulse rounded-3xl bg-white/5" /><div className="h-64 animate-pulse rounded-3xl bg-white/5" /></section>;
  return <section className="text-white"><Link href="/mis-pedidos" className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-yellow-300"><span aria-hidden="true">←</span> Mis pedidos</Link><div className="mt-5 rounded-3xl border border-white/10 bg-zinc-900/65 p-6 shadow-2xl sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">Detalle de pedido</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Pedido <span className="font-mono text-xl text-white/65">#{order.publicId.slice(0, 8).toUpperCase()}</span></h1><p className="mt-2 text-sm text-white/45">Realizado el {dateTime.format(new Date(order.fechaPedido))}</p></div><div className="flex flex-col items-start gap-3 sm:items-end"><OrderStatus code={order.estadoCodigo} label={order.estadoNombre} /><p className="text-xl font-bold text-yellow-300">{money.format(order.total)}</p></div></div></div><div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]"><section className="rounded-3xl border border-white/10 bg-zinc-900/65 p-6"><h2 className="font-bold">Productos</h2><div className="mt-4 divide-y divide-white/10">{order.productos.map((item) => <div key={item.productoPublicId} className="flex items-center justify-between gap-5 py-4"><div><p className="font-medium">{item.nombre}</p><p className="mt-1 text-sm text-white/45">{item.cantidad} × {money.format(item.precioUnitario)}</p></div><p className="font-semibold text-white/85">{money.format(item.subtotal)}</p></div>)}</div><div className="mt-3 flex justify-between border-t border-white/10 pt-4 font-bold"><span>Total</span><span className="text-yellow-300">{money.format(order.total)}</span></div></section><section className="rounded-3xl border border-white/10 bg-zinc-900/65 p-6"><h2 className="font-bold">Seguimiento</h2><div className="mt-5 space-y-0">{order.seguimiento.length > 0 ? order.seguimiento.map((event, index) => <div key={`${event.fechaEvento}-${index}`} className="relative flex gap-4 pb-6 last:pb-0"><div className="relative z-10 mt-0.5 h-3 w-3 shrink-0 rounded-full bg-yellow-300 ring-4 ring-yellow-300/10" />{index < order.seguimiento.length - 1 && <div className="absolute left-[5px] top-4 h-[calc(100%-12px)] w-px bg-white/10" />}<div><p className="font-medium">{event.titulo}</p><p className="mt-1 text-sm leading-5 text-white/50">{event.descripcion || "Actualización registrada."}</p>{event.ubicacion && <p className="mt-1 text-xs font-semibold text-yellow-300/80">{event.ubicacion}</p>}<p className="mt-2 text-xs text-white/35">{dateTime.format(new Date(event.fechaEvento))}</p></div></div>) : <p className="text-sm text-white/45">Aún no hay eventos adicionales de seguimiento.</p>}</div></section></div><section className="mt-5 rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.035] p-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">Entrega</p><p className="mt-2 text-sm leading-6 text-white/70">{order.direccionEntrega}</p></section></section>;
}
