import React, { useState } from "react";
import { cn } from "@marweld/ui/lib/utils";
import { useERPStore } from "../../../shared/stores/erp.store";
import type { Product } from "../../../shared/stores/erp.store";

const getProductImage = (code: string) => {
  const images: Record<string, string> = {
    "SLD-200": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=500&auto=format&fit=crop",
    "CRT-FOTO": "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?q=80&w=500&auto=format&fit=crop",
    "ELC-6011": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500&auto=format&fit=crop",
    "GNT-CR": "https://images.unsplash.com/photo-1590786276557-11c5d4629934?q=80&w=500&auto=format&fit=crop",
    "PLS-50": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=500&auto=format&fit=crop",
    "ANT-TIG": "https://images.unsplash.com/photo-1535813547-99c456a41d4a?q=80&w=500&auto=format&fit=crop",
  };
  return images[code] || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=500&auto=format&fit=crop";
};

export function InventarioPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const { products, addProduct, updateProduct, deleteProduct, openReplenishmentModal } = useERPStore();

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form states
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPrice, setNewPrice] = useState("0");
  const [newStock, setNewStock] = useState("0");
  const [newMinStock, setNewMinStock] = useState("5");
  const [newSupplier, setNewSupplier] = useState("");

  // Filtered list
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalItems: products.reduce((acc, p) => acc + p.stock, 0),
    uniqueProducts: products.length,
    lowStock: products.filter((p) => p.status === "low").length,
    outOfStock: products.filter((p) => p.status === "out").length,
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProduct) {
      updateProduct(editProduct);
      setEditProduct(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteProductId) {
      deleteProduct(deleteProductId);
      setDeleteProductId(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice) || 0;
    const stockNum = parseInt(newStock) || 0;
    const minStockNum = parseInt(newMinStock) || 5;
    
    let calculatedStatus: "ok" | "low" | "out" = "ok";
    if (stockNum === 0) {
      calculatedStatus = "out";
    } else if (stockNum <= minStockNum) {
      calculatedStatus = "low";
    }

    addProduct({
      name: newName,
      code: newCode,
      category: newCategory,
      price: priceNum,
      stock: stockNum,
      minStock: minStockNum,
      suggestedSupplier: newSupplier || "Proveedor General",
      status: calculatedStatus,
    });

    // Reset fields
    setNewName("");
    setNewCode("");
    setNewCategory("");
    setNewPrice("0");
    setNewStock("0");
    setNewMinStock("5");
    setNewSupplier("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] m-0">Gestión de Inventario</h1>
          <p className="text-sm text-[var(--foreground)]/60">Administra tus productos, stock y categorías de la tienda.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[var(--primary)] text-zinc-950 hover:brightness-95 hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-md shadow-[var(--primary)]/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4.5 w-4.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar Producto
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm p-4">
          <p className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Stock Total</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.totalItems} uds.</p>
        </div>
        <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm p-4">
          <p className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Productos Únicos</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.uniqueProducts}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Stock Bajo</p>
          <p className="mt-1 text-2xl font-bold text-amber-500">{stats.lowStock}</p>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-semibold text-rose-500/80 uppercase tracking-wider">Agotados</p>
          <p className="mt-1 text-2xl font-bold text-rose-500">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm overflow-hidden">
        {/* Table Filters */}
        <div className="flex flex-col gap-4 border-b border-[var(--foreground)]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3 w-full">
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
                placeholder="Buscar por nombre, código o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] py-2 pl-9 pr-4 text-xs text-[var(--foreground)] placeholder-[var(--foreground)]/40 focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all"
              />
            </div>
            
            <button className="flex items-center gap-2 rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] px-3.5 py-2 text-xs font-semibold text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.24 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              <span>Filtrar</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                <th className="p-4">Código</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4 text-right">Precio (S/.)</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--foreground)]/10 text-xs">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    onClick={() => setSelectedProduct(product)}
                    className="hover:bg-[var(--foreground)]/2 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-mono text-[var(--foreground)]/40">{product.code}</td>
                    <td className="p-4 font-medium text-[var(--foreground)]">{product.name}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-[var(--foreground)]/5 px-2 py-0.5 text-[10px] font-medium text-[var(--foreground)]/80 border border-[var(--foreground)]/10">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-[var(--foreground)]">S/. {product.price.toFixed(2)}</td>
                    <td className="p-4 text-center font-semibold text-[var(--foreground)]">{product.stock}</td>
                    <td className="p-4 text-center">
                      {product.status === "ok" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                          <span className="h-1 w-1 rounded-full bg-emerald-400" />
                          Disponible
                        </span>
                      )}
                      {product.status === "low" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                          <span className="h-1 w-1 rounded-full bg-amber-400" />
                          Stock Bajo
                        </span>
                      )}
                      {product.status === "out" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20">
                          <span className="h-1 w-1 rounded-full bg-rose-400" />
                          Agotado
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-3">
                        {(product.status === "low" || product.status === "out") && (
                          <button
                            onClick={() => openReplenishmentModal(product)}
                            className="text-[var(--foreground)]/60 hover:text-[var(--primary)] hover:scale-110 transition-all duration-200 cursor-pointer"
                            title="Pedir reposición"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" className="h-4.5 w-4.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => setEditProduct(product)}
                          className="text-[var(--foreground)]/60 hover:text-[var(--primary)] hover:scale-110 transition-all duration-200 cursor-pointer"
                          title="Editar producto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" className="h-4.5 w-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteProductId(product.id)}
                          className="text-[var(--foreground)]/60 hover:text-rose-500 hover:scale-110 transition-all duration-200 cursor-pointer"
                          title="Desactivar producto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" className="h-4.5 w-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--foreground)]/40">
                    No se encontraron productos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-900/95 p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest block mb-0.5">Ficha Técnica</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Detalle del Producto</h3>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-white/40 hover:text-white hover:rotate-90 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Product Image Section */}
              <div className="md:col-span-5 relative group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 aspect-square">
                <img 
                  src={getProductImage(selectedProduct.code)} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                  <span className="rounded-md bg-zinc-900/90 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90">
                    {selectedProduct.code}
                  </span>
                  <div>
                    {selectedProduct.status === "ok" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Activo
                      </span>
                    )}
                    {selectedProduct.status === "low" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Bajo Stock
                      </span>
                    )}
                    {selectedProduct.status === "out" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[9px] font-bold text-rose-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                        Agotado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Info Section */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Nombre del Producto</span>
                    <h4 className="text-lg font-bold text-white leading-tight">{selectedProduct.name}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                    <div>
                      <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-1">Categoría</span>
                      <span className="inline-block rounded-lg bg-white/5 px-2.5 py-1 font-semibold border border-white/10 text-[10px] text-white/90">
                        {selectedProduct.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-1">Precio Unitario</span>
                      <span className="text-base font-extrabold text-[var(--primary)] block">S/. {selectedProduct.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                    <div>
                      <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Stock Disponible</span>
                      <span className="text-sm font-extrabold text-white block">{selectedProduct.stock} unidades</span>
                      {/* Mini stock progress bar */}
                      <div className="w-full bg-white/5 h-1.5 rounded-full mt-1.5 overflow-hidden border border-white/5">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            selectedProduct.status === "ok" && "bg-emerald-500",
                            selectedProduct.status === "low" && "bg-amber-500",
                            selectedProduct.status === "out" && "bg-rose-500"
                          )}
                          style={{ width: `${Math.min(100, (selectedProduct.stock / ((selectedProduct.minStock ?? 5) * 2.5)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Stock Mínimo Alerta</span>
                      <span className="text-sm font-semibold text-white/80 block">{selectedProduct.minStock ?? 5} unidades</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Proveedor Sugerido</span>
                    <span className="text-xs font-semibold text-white/95">{selectedProduct.suggestedSupplier ?? "Proveedor General"}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-end">
                  <button 
                    onClick={() => setSelectedProduct(null)} 
                    className="bg-[var(--primary)] text-zinc-950 px-5 py-2 rounded-xl text-xs font-bold hover:brightness-95 hover:scale-[1.02] transition-all cursor-pointer shadow-md shadow-[var(--primary)]/10"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setEditProduct(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--foreground)]/10 bg-[var(--background)] p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--foreground)]/10 pb-3">
                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Editar Producto</h3>
                <button type="button" onClick={() => setEditProduct(null)} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Código</label>
                    <input
                      type="text"
                      required
                      value={editProduct.code}
                      onChange={(e) => setEditProduct({ ...editProduct, code: e.target.value })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Categoría</label>
                    <input
                      type="text"
                      required
                      value={editProduct.category}
                      onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Precio (S/.)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editProduct.price}
                      onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Stock</label>
                    <input
                      type="number"
                      required
                      value={editProduct.stock}
                      onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Stock Mínimo</label>
                    <input
                      type="number"
                      required
                      value={editProduct.minStock ?? 5}
                      onChange={(e) => setEditProduct({ ...editProduct, minStock: parseInt(e.target.value) || 5 })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Proveedor Sugerido</label>
                    <input
                      type="text"
                      required
                      value={editProduct.suggestedSupplier ?? ""}
                      onChange={(e) => setEditProduct({ ...editProduct, suggestedSupplier: e.target.value })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3 border-t border-[var(--foreground)]/10">
                <button type="button" onClick={() => setEditProduct(null)} className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--foreground)]/10 transition-all">
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

      {/* DEACTIVATE CONFIRMATION MODAL */}
      {deleteProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={() => setDeleteProductId(null)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-rose-500/20 bg-zinc-900/95 p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 backdrop-blur-xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">¿Desactivar Producto?</h3>
              <p className="text-xs text-white/60 max-w-xs leading-relaxed">
                ¿Estás seguro de que deseas desactivar este producto del inventario? Esta acción limitará de manera temporal su venta y reabastecimiento en el ERP.
              </p>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button 
                onClick={() => setDeleteProductId(null)} 
                className="bg-white/5 border border-white/10 text-white/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                className="bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-rose-500 transition-all cursor-pointer"
              >
                Sí, Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--foreground)]/10 bg-[var(--background)] p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--foreground)]/10 pb-3">
                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Agregar Nuevo Producto</h3>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Soldadora Inverter Arc 200"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Código</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. SLD-200"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Categoría</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Equipos"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Precio (S/.)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Stock Inicial</label>
                    <input
                      type="number"
                      required
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Stock Mínimo Alerta</label>
                    <input
                      type="number"
                      required
                      value={newMinStock}
                      onChange={(e) => setNewMinStock(e.target.value)}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Proveedor Sugerido</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Marweld Corp"
                      value={newSupplier}
                      onChange={(e) => setNewSupplier(e.target.value)}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3 border-t border-[var(--foreground)]/10">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--foreground)]/10 transition-all cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="bg-[var(--primary)] text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs hover:brightness-95 transition-all cursor-pointer">
                  Agregar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
