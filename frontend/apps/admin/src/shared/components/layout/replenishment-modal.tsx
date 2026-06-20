import React, { useState, useEffect } from "react";
import { useERPStore } from "../../stores/erp.store";
import { useAuthStore } from "../../stores/auth.store";
import { cn } from "@marweld/ui/lib/utils";

export function ReplenishmentModal() {
  const { replenishmentModal, closeReplenishmentModal, addReplenishment } = useERPStore();
  const { user } = useAuthStore();
  const { isOpen, product } = replenishmentModal;

  const [qty, setQty] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (product) {
      const minStock = product.minStock ?? 5;
      const suggested = Math.max(1, minStock * 3 - product.stock);
      setQty(suggested);
      setReason("");
      setIsSubmitted(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleCancel = () => {
    closeReplenishmentModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) return;

    addReplenishment({
      date: new Date().toISOString().split("T")[0] ?? "2026-06-17",
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      currentStock: product.stock,
      minStock: product.minStock ?? 5,
      requestedQty: qty,
      supplier: product.suggestedSupplier ?? "Proveedor General",
      requestedBy: user?.name ?? "Jennifer Reyes",
      reason: reason,
    });

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleCancel}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--foreground)]/10 bg-[var(--background)] p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {isSubmitted ? (
          /* Confirmation View */
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full shadow-lg shadow-emerald-500/5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">¡Solicitud Enviada!</h3>
            <p className="text-sm text-[var(--foreground)]/70 max-w-sm leading-relaxed">
              Solicitud de reposición enviada correctamente. Queda pendiente de revisión por el jefe.
            </p>
            <button
              onClick={handleCancel}
              className="mt-6 w-full bg-[var(--primary)] text-zinc-950 font-bold py-2.5 rounded-xl text-xs hover:brightness-95 hover:scale-[1.01] transition-all duration-200"
            >
              Entendido
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--foreground)]/10 pb-3">
              <h3 className="text-base font-bold text-[var(--foreground)]">Solicitud de Reposición</h3>
              <button 
                type="button"
                onClick={handleCancel}
                className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4.5 w-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Read-Only Product Info Grid */}
            <div className="grid grid-cols-2 gap-3 bg-[var(--foreground)]/3 rounded-xl p-3 border border-[var(--foreground)]/5 text-xs">
              <div>
                <span className="text-[var(--foreground)]/40 block font-medium">Producto</span>
                <span className="text-[var(--foreground)] font-semibold">{product.name}</span>
              </div>
              <div>
                <span className="text-[var(--foreground)]/40 block font-medium">Código</span>
                <span className="text-[var(--foreground)] font-mono font-semibold">{product.code}</span>
              </div>
              <div>
                <span className="text-[var(--foreground)]/40 block font-medium">Stock Actual / Mínimo</span>
                <span className="text-[var(--foreground)] font-semibold">{product.stock} / {product.minStock ?? 5} uds.</span>
              </div>
              <div>
                <span className="text-[var(--foreground)]/40 block font-medium">Proveedor Sugerido</span>
                <span className="text-[var(--foreground)] font-semibold">{product.suggestedSupplier ?? "General"}</span>
              </div>
              <div>
                <span className="text-[var(--foreground)]/40 block font-medium">Solicitante</span>
                <span className="text-[var(--foreground)] font-semibold">{user?.name ?? "Jennifer Reyes"}</span>
              </div>
              <div>
                <span className="text-[var(--foreground)]/40 block font-medium">Fecha</span>
                <span className="text-[var(--foreground)] font-semibold">{new Date().toISOString().split("T")[0]}</span>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Cantidad a Reponer</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Motivo de la reposición</label>
                <textarea
                  required
                  placeholder="Ingrese el motivo detallado de la reposición..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-3 border-t border-[var(--foreground)]/10">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--foreground)]/10 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-[var(--primary)] text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs hover:brightness-95 hover:scale-[1.01] transition-all duration-200 cursor-pointer shadow-md shadow-[var(--primary)]/10"
              >
                Enviar solicitud
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
