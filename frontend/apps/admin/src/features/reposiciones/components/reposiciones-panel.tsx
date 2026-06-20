import React, { useState } from "react";
import { useERPStore } from "../../../shared/stores/erp.store";
import type { ReplenishmentRequest } from "../../../shared/stores/erp.store";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { cn } from "@marweld/ui/lib/utils";

export function ReposicionesPanel() {
  const { user } = useAuthStore();
  const { 
    replenishments, 
    approveReplenishment, 
    rejectReplenishment, 
    receiveReplenishment,
    updateReplenishment,
    deleteReplenishment
  } = useERPStore();

  const isBoss = user?.role === "Administrador de Sistemas";

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchProduct, setSearchProduct] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [searchRequester, setSearchRequester] = useState("");

  // Rejection modal state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionInputReason, setRejectionInputReason] = useState("");

  // Modal states
  const [selectedReplenishment, setSelectedReplenishment] = useState<ReplenishmentRequest | null>(null);
  const [editReplenishment, setEditReplenishment] = useState<ReplenishmentRequest | null>(null);
  const [deleteReplenishmentId, setDeleteReplenishmentId] = useState<string | null>(null);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editReplenishment) {
      updateReplenishment(editReplenishment);
      setEditReplenishment(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteReplenishmentId) {
      deleteReplenishment(deleteReplenishmentId);
      setDeleteReplenishmentId(null);
    }
  };

  // Stats calculation
  const stats = {
    pending: replenishments.filter((r) => r.status === "Pendiente de aprobación").length,
    approved: replenishments.filter((r) => r.status === "Aprobado").length,
    rejected: replenishments.filter((r) => r.status === "Rechazado").length,
    received: replenishments.filter((r) => r.status === "Recibido").length,
  };

  // Filter logic
  const filteredReplenishments = replenishments.filter((r) => {
    const matchesStatus = filterStatus === "todos" || r.status === filterStatus;
    const matchesProduct = r.productName.toLowerCase().includes(searchProduct.toLowerCase()) || 
                          r.productCode.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesDate = !filterDate || r.date === filterDate;
    const matchesRequester = r.requestedBy.toLowerCase().includes(searchRequester.toLowerCase());
    
    return matchesStatus && matchesProduct && matchesDate && matchesRequester;
  });

  const handleOpenRejectModal = (id: string) => {
    setRejectingRequestId(id);
    setRejectionInputReason("");
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequestId || !rejectionInputReason.trim()) return;

    rejectReplenishment(rejectingRequestId, rejectionInputReason);
    setRejectingRequestId(null);
    setRejectionInputReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] m-0">Reposición de Productos</h1>
          <p className="text-sm text-[var(--foreground)]/60">Gestiona y aprueba las solicitudes de reabastecimiento del inventario.</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Pendientes */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-4 transition-all duration-300 hover:bg-amber-500/10">
          <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500 border border-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Pendientes</p>
            <p className="mt-1 text-2xl font-bold text-amber-500">{stats.pending}</p>
          </div>
        </div>

        {/* Aprobadas */}
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 flex items-center gap-4 transition-all duration-300 hover:bg-sky-500/10">
          <div className="rounded-lg bg-sky-500/10 p-2.5 text-sky-500 border border-sky-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-sky-500/80 uppercase tracking-wider">Aprobadas</p>
            <p className="mt-1 text-2xl font-bold text-sky-500">{stats.approved}</p>
          </div>
        </div>

        {/* Rechazadas */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center gap-4 transition-all duration-300 hover:bg-rose-500/10">
          <div className="rounded-lg bg-rose-500/10 p-2.5 text-rose-500 border border-rose-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-500/80 uppercase tracking-wider">Rechazadas</p>
            <p className="mt-1 text-2xl font-bold text-rose-500">{stats.rejected}</p>
          </div>
        </div>

        {/* Recibidas */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-4 transition-all duration-300 hover:bg-emerald-500/10">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500 border border-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-500/80 uppercase tracking-wider">Recibidas</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.received}</p>
          </div>
        </div>
      </div>

      {/* Replenishments Container */}
      <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm overflow-hidden">
        
        {/* Table Filters Grid */}
        <div className="p-4 border-b border-[var(--foreground)]/10 bg-[var(--foreground)]/2">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Filter by Product */}
            <div className="relative">
              <span className="text-[10px] font-bold text-[var(--foreground)]/40 block mb-1 uppercase tracking-wider">Producto</span>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--foreground)]/40">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
                <input
                  type="text"
                  placeholder="Nombre o código..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] py-1.5 pl-8 pr-3 text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Filter by Status */}
            <div>
              <span className="text-[10px] font-bold text-[var(--foreground)]/40 block mb-1 uppercase tracking-wider">Estado</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] py-1.5 px-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all"
              >
                <option value="todos">Todos los Estados</option>
                <option value="Pendiente de aprobación">Pendiente de aprobación</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
                <option value="Recibido">Recibido</option>
              </select>
            </div>

            {/* Filter by Date */}
            <div>
              <span className="text-[10px] font-bold text-[var(--foreground)]/40 block mb-1 uppercase tracking-wider">Fecha</span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] py-1.5 px-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all"
              />
            </div>

            {/* Filter by Requester */}
            <div>
              <span className="text-[10px] font-bold text-[var(--foreground)]/40 block mb-1 uppercase tracking-wider">Solicitado Por</span>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--foreground)]/40">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <input
                  type="text"
                  placeholder="Nombre del usuario..."
                  value={searchRequester}
                  onChange={(e) => setSearchRequester(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] py-1.5 pl-8 pr-3 text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                <th className="p-4">Fecha</th>
                <th className="p-4">Producto</th>
                <th className="p-4 text-center">Stock Actual</th>
                <th className="p-4 text-center">Cantidad Solicitada</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4">Solicitado Por</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--foreground)]/10 text-xs">
              {filteredReplenishments.length > 0 ? (
                filteredReplenishments.map((rep) => (
                  <tr 
                    key={rep.id} 
                    onClick={() => setSelectedReplenishment(rep)}
                    className="hover:bg-[var(--foreground)]/2 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-mono text-[var(--foreground)]/60">{rep.date}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{rep.productName}</p>
                        <p className="text-[10px] text-[var(--foreground)]/40 font-mono mt-0.5">{rep.productCode}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center font-medium text-[var(--foreground)]">{rep.currentStock} uds.</td>
                    <td className="p-4 text-center font-bold text-[var(--foreground)]">{rep.requestedQty} uds.</td>
                    <td className="p-4 text-[var(--foreground)]/80 font-medium">{rep.supplier}</td>
                    <td className="p-4 font-medium text-[var(--foreground)]/80">{rep.requestedBy}</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium border",
                          rep.status === "Pendiente de aprobación" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                          rep.status === "Aprobado" && "bg-sky-500/10 text-sky-400 border-sky-500/20",
                          rep.status === "Rechazado" && "bg-rose-500/10 text-rose-400 border-rose-500/20",
                          rep.status === "Recibido" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        )}>
                          {rep.status}
                        </span>
                        {rep.rejectionReason && (
                          <span className="text-[10px] text-rose-400/80 max-w-[150px] truncate mt-1" title={rep.rejectionReason}>
                            Motivo: {rep.rejectionReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-3">
                        {isBoss && rep.status === "Pendiente de aprobación" && (
                          <>
                            <button
                              onClick={() => approveReplenishment(rep.id)}
                              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-emerald-500/20 hover:text-emerald-300 transition-all cursor-pointer"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(rep.id)}
                              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {isBoss && rep.status === "Aprobado" && (
                          <button
                            onClick={() => receiveReplenishment(rep.id)}
                            className="bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-sky-500/20 hover:text-sky-300 transition-all cursor-pointer"
                            title="Marcar ingreso de mercadería a stock"
                          >
                            Recibido
                          </button>
                        )}
                        {rep.status === "Pendiente de aprobación" && (
                          <button
                            onClick={() => setEditReplenishment(rep)}
                            className="text-[var(--foreground)]/60 hover:text-[var(--primary)] hover:scale-110 transition-all duration-200 cursor-pointer"
                            title="Editar solicitud"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" className="h-4.5 w-4.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteReplenishmentId(rep.id)}
                          className="text-[var(--foreground)]/60 hover:text-rose-500 hover:scale-110 transition-all duration-200 cursor-pointer"
                          title="Eliminar solicitud"
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
                  <td colSpan={8} className="p-8 text-center text-[var(--foreground)]/40">
                    No se encontraron solicitudes de reposición.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Inline Rejection Dialog Modal */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            onClick={() => setRejectingRequestId(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--foreground)]/10 bg-[var(--background)] p-5 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--foreground)]">Rechazar Solicitud {rejectingRequestId}</h4>
                <p className="text-xs text-[var(--foreground)]/60 mt-1">Por favor ingrese el motivo del rechazo para informar al empleado.</p>
              </div>

              <div>
                <textarea
                  required
                  placeholder="Ej. Contamos con stock suficiente en el almacén alterno..."
                  value={rejectionInputReason}
                  onChange={(e) => setRejectionInputReason(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-[var(--foreground)]/5">
                <button
                  type="button"
                  onClick={() => setRejectingRequestId(null)}
                  className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-[var(--foreground)]/10 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-rose-500 transition-all cursor-pointer"
                >
                  Rechazar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedReplenishment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md" onClick={() => setSelectedReplenishment(null)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900/95 p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest block mb-0.5">Operación de Inventario</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Detalle de Reposición</h3>
              </div>
              <button onClick={() => setSelectedReplenishment(null)} className="text-white/40 hover:text-white hover:rotate-90 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Solicitud ID</span>
                  <span className="text-white font-mono font-bold text-sm block">{selectedReplenishment.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Fecha de Emisión</span>
                  <span className="text-white/90 font-semibold block">{selectedReplenishment.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Producto</span>
                  <span className="text-white font-bold text-sm block">{selectedReplenishment.productName}</span>
                  <span className="text-[10px] text-white/45 font-mono block mt-0.5">{selectedReplenishment.productCode}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Proveedor Sugerido</span>
                  <span className="text-white/90 font-semibold block">{selectedReplenishment.supplier}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Stock en Almacén</span>
                  <span className="text-white/90 font-semibold block">{selectedReplenishment.currentStock} unidades</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Cantidad Requerida</span>
                  <span className="text-sm font-extrabold text-[var(--primary)] block">{selectedReplenishment.requestedQty} unidades</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Solicitado Por</span>
                  <span className="text-white/90 font-semibold block">{selectedReplenishment.requestedBy}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-1">Estado de Aprobación</span>
                  <div>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold border",
                      selectedReplenishment.status === "Pendiente de aprobación" && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                      selectedReplenishment.status === "Aprobado" && "bg-sky-500/20 text-sky-400 border-sky-500/30",
                      selectedReplenishment.status === "Rechazado" && "bg-rose-500/20 text-rose-400 border-rose-500/30",
                      selectedReplenishment.status === "Recibido" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    )}>
                      {selectedReplenishment.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedReplenishment.reason && (
                <div className="border-t border-white/5 pt-3">
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-1">Motivo / Justificación</span>
                  <p className="text-white/80 leading-relaxed bg-zinc-950/40 p-3 rounded-2xl border border-white/5">{selectedReplenishment.reason}</p>
                </div>
              )}

              {selectedReplenishment.rejectionReason && (
                <div className="border-t border-rose-500/10 pt-3 bg-rose-500/5 p-3 rounded-2xl border border-rose-500/25">
                  <span className="text-[10px] font-bold text-rose-400 block uppercase tracking-wider mb-1">Motivo de Rechazo (Administrador)</span>
                  <p className="text-rose-200 leading-relaxed">{selectedReplenishment.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-white/5 pt-4 flex justify-end">
              <button 
                onClick={() => setSelectedReplenishment(null)} 
                className="bg-[var(--primary)] text-zinc-950 px-5 py-2 rounded-xl text-xs font-bold hover:brightness-95 hover:scale-[1.02] transition-all cursor-pointer shadow-md shadow-[var(--primary)]/10"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editReplenishment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setEditReplenishment(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--foreground)]/10 bg-[var(--background)] p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--foreground)]/10 pb-3">
                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Editar Solicitud</h3>
                <button type="button" onClick={() => setEditReplenishment(null)} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[var(--foreground)]/40 block font-medium">Producto</span>
                    <span className="text-[var(--foreground)] font-semibold">{editReplenishment.productName}</span>
                  </div>
                  <div>
                    <span className="text-[var(--foreground)]/40 block font-medium">Stock Actual</span>
                    <span className="text-[var(--foreground)] font-semibold">{editReplenishment.currentStock} uds.</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Cantidad a Reponer</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editReplenishment.requestedQty}
                    onChange={(e) => setEditReplenishment({ ...editReplenishment, requestedQty: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Motivo de Reposición</label>
                  <textarea
                    required
                    value={editReplenishment.reason}
                    onChange={(e) => setEditReplenishment({ ...editReplenishment, reason: e.target.value })}
                    rows={3}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3 border-t border-[var(--foreground)]/10">
                <button type="button" onClick={() => setEditReplenishment(null)} className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--foreground)]/10 transition-all cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="bg-[var(--primary)] text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs hover:brightness-95 transition-all cursor-pointer">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteReplenishmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setDeleteReplenishmentId(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-rose-500/20 bg-[var(--background)] p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">¿Eliminar Solicitud?</h3>
              <p className="text-xs text-[var(--foreground)]/60 max-w-xs leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente esta solicitud de reposición? Esta acción es definitiva.
              </p>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button onClick={() => setDeleteReplenishmentId(null)} className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--foreground)]/10 transition-all cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm} className="bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-rose-500 transition-all cursor-pointer">
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
