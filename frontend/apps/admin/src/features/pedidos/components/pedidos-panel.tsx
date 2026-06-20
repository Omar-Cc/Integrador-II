import React, { useState } from "react";
import { cn } from "@marweld/ui/lib/utils";
import { useERPStore } from "../../../shared/stores/erp.store";
import type { Order } from "../../../shared/stores/erp.store";

export function PedidosPanel() {
  const { orders, updateOrder, deleteOrder } = useERPStore();
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter(
    (o) =>
      (filterStatus === "todos" || o.status === filterStatus) &&
      (o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.items.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    pending: orders.filter((o) => o.status === "pendiente").length,
    processing: orders.filter((o) => o.status === "procesando").length,
    completed: orders.filter((o) => o.status === "completado").length,
    canceled: orders.filter((o) => o.status === "cancelado").length,
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editOrder) {
      updateOrder(editOrder);
      setEditOrder(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteOrderId) {
      deleteOrder(deleteOrderId);
      setDeleteOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] m-0">Gestión de Pedidos</h1>
          <p className="text-sm text-[var(--foreground)]/60">Controla y procesa las compras y envíos de tus clientes.</p>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Pendientes */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-4 transition-all duration-300 hover:bg-amber-500/10">
          <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500 border border-amber-500/20 shadow-sm shadow-amber-500/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Pendientes</p>
            <p className="mt-1 text-2xl font-bold text-amber-500">
              {stats.pending}
            </p>
          </div>
        </div>

        {/* Procesando */}
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 flex items-center gap-4 transition-all duration-300 hover:bg-sky-500/10">
          <div className="rounded-lg bg-sky-500/10 p-2.5 text-sky-500 border border-sky-500/20 shadow-sm shadow-sky-500/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-sky-500/80 uppercase tracking-wider">Procesando</p>
            <p className="mt-1 text-2xl font-bold text-sky-500">
              {stats.processing}
            </p>
          </div>
        </div>

        {/* Completados */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-4 transition-all duration-300 hover:bg-emerald-500/10">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-500/80 uppercase tracking-wider">Completados</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {stats.completed}
            </p>
          </div>
        </div>

        {/* Cancelados */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center gap-4 transition-all duration-300 hover:bg-rose-500/10">
          <div className="rounded-lg bg-rose-500/10 p-2.5 text-rose-500 border border-rose-500/20 shadow-sm shadow-rose-500/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-500/80 uppercase tracking-wider">Cancelados</p>
            <p className="mt-1 text-2xl font-bold text-rose-500">
              {stats.canceled}
            </p>
          </div>
        </div>
      </div>

      {/* Orders Container */}
      <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm overflow-hidden">
        {/* Table Filters */}
        <div className="flex flex-col gap-4 border-b border-[var(--foreground)]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/40"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por ID, cliente o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] py-2 pl-9 pr-4 text-xs text-[var(--foreground)] placeholder-[var(--foreground)]/40 focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["todos", "pendiente", "procesando", "completado", "cancelado"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-medium capitalize transition-all border",
                  filterStatus === status
                    ? "bg-[var(--primary)] text-zinc-950 font-semibold border-transparent"
                    : "bg-[var(--foreground)]/5 text-[var(--foreground)]/60 border border-[var(--foreground)]/10 hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                <th className="p-4">Pedido ID</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Items</th>
                <th className="p-4 text-right">Total (S/.)</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--foreground)]/10 text-xs">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-[var(--foreground)]/2 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-mono font-semibold text-[var(--foreground)]">{order.id}</td>
                    <td className="p-4 font-medium text-[var(--foreground)]/80">{order.customer}</td>
                    <td className="p-4 text-[var(--foreground)]/60">{order.date}</td>
                    <td className="p-4 text-[var(--foreground)]/80 truncate max-w-xs">{order.items}</td>
                    <td className="p-4 text-right font-medium text-[var(--foreground)]">S/. {order.total.toFixed(2)}</td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrder({ ...order, status: e.target.value as any })}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-bold border outline-none cursor-pointer transition-all w-28 text-center",
                          order.status === "completado" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 focus:border-emerald-500/50",
                          order.status === "pendiente" && "bg-amber-500/10 text-amber-400 border-amber-500/20 focus:border-amber-500/50",
                          order.status === "procesando" && "bg-sky-500/10 text-sky-400 border-sky-500/20 focus:border-sky-500/50",
                          order.status === "cancelado" && "bg-rose-500/10 text-rose-400 border-rose-500/20 focus:border-rose-500/50"
                        )}
                      >
                        <option value="pendiente" className="bg-zinc-900 text-amber-400 font-semibold">Pendiente</option>
                        <option value="procesando" className="bg-zinc-900 text-sky-400 font-semibold">Procesando</option>
                        <option value="completado" className="bg-zinc-900 text-emerald-400 font-semibold">Completado</option>
                        <option value="cancelado" className="bg-zinc-900 text-rose-400 font-semibold">Cancelado</option>
                      </select>
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setEditOrder(order)}
                          className="text-[var(--foreground)]/60 hover:text-[var(--primary)] hover:scale-110 transition-all duration-200 cursor-pointer"
                          title="Editar pedido"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" className="h-4.5 w-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteOrderId(order.id)}
                          className="text-[var(--foreground)]/60 hover:text-rose-500 hover:scale-110 transition-all duration-200 cursor-pointer"
                          title="Borrar pedido"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" className="h-4.5 w-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--foreground)]/40">
                    No se encontraron pedidos en esta categoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900/95 p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest block mb-0.5">Orden de Venta</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Detalle del Pedido</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-white/40 hover:text-white hover:rotate-90 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Pedido ID</span>
                  <span className="text-white font-mono font-bold text-sm block">{selectedOrder.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Fecha de Compra</span>
                  <span className="text-white/90 font-semibold block">{selectedOrder.date}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Cliente</span>
                <span className="text-white font-bold text-sm block">{selectedOrder.customer}</span>
              </div>

              <div className="border-t border-white/5 pt-3">
                <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-1">Detalle de Productos (Factura)</span>
                <div className="bg-zinc-950/50 p-3 rounded-2xl border border-white/5 font-mono text-[11px] text-white/85 leading-relaxed">
                  {selectedOrder.items}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Monto Total</span>
                  <span className="text-lg font-extrabold text-[var(--primary)] block">S/. {selectedOrder.total.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-1">Estado de Entrega</span>
                  <div className="mt-0.5">
                    {selectedOrder.status === "completado" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        Completado
                      </span>
                    )}
                    {selectedOrder.status === "pendiente" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                        Pendiente
                      </span>
                    )}
                    {selectedOrder.status === "procesando" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 border border-sky-500/30 px-2.5 py-0.5 text-[10px] font-bold text-sky-400">
                        Procesando
                      </span>
                    )}
                    {selectedOrder.status === "cancelado" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold text-rose-400">
                        Cancelado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/5 pt-4 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="bg-[var(--primary)] text-zinc-950 px-5 py-2 rounded-xl text-xs font-bold hover:brightness-95 hover:scale-[1.02] transition-all cursor-pointer shadow-md shadow-[var(--primary)]/10"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setEditOrder(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--foreground)]/10 bg-[var(--background)] p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--foreground)]/10 pb-3">
                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Editar Pedido {editOrder.id}</h3>
                <button type="button" onClick={() => setEditOrder(null)} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Cliente</label>
                  <input
                    type="text"
                    required
                    value={editOrder.customer}
                    onChange={(e) => setEditOrder({ ...editOrder, customer: e.target.value })}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      value={editOrder.date}
                      onChange={(e) => setEditOrder({ ...editOrder, date: e.target.value })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Estado</label>
                    <select
                      value={editOrder.status}
                      onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value as any })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="procesando">Procesando</option>
                      <option value="completado">Completado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Monto Total (S/.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editOrder.total}
                    onChange={(e) => setEditOrder({ ...editOrder, total: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Items / Productos</label>
                  <textarea
                    required
                    value={editOrder.items}
                    onChange={(e) => setEditOrder({ ...editOrder, items: e.target.value })}
                    rows={2}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3 border-t border-[var(--foreground)]/10">
                <button type="button" onClick={() => setEditOrder(null)} className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--foreground)]/10 transition-all">
                  Cancelar
                </button>
                <button type="submit" className="bg-[var(--primary)] text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs hover:brightness-95 transition-all">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setDeleteOrderId(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-rose-500/20 bg-[var(--background)] p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">¿Eliminar Pedido?</h3>
              <p className="text-xs text-[var(--foreground)]/60 max-w-xs leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente este registro de pedido? Esta acción es definitiva.
              </p>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button onClick={() => setDeleteOrderId(null)} className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--foreground)]/10 transition-all">
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm} className="bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-rose-500 transition-all">
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
