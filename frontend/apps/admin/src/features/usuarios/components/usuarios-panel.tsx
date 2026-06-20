import React, { useState } from "react";
import { useERPStore } from "../../../shared/stores/erp.store";
import type { User } from "../../../shared/stores/erp.store";
import { cn } from "@marweld/ui/lib/utils";

export function UsuariosPanel() {
  const { users, addUser, updateUser, suspendUser, deleteUser } = useERPStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterRole, setFilterRole] = useState<string>("todos");

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [suspendUserId, setSuspendUserId] = useState<string | null>(null);
  const [suspendConfirmInput, setSuspendConfirmInput] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states for creating new user
  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    name: "",
    email: "",
    role: "Cliente Registrado",
    status: "activo",
    joinedDate: new Date().toISOString().substring(0, 10),
    lastActive: "Nunca"
  });

  const filteredUsers = users.filter(
    (u) =>
      (filterStatus === "todos" || u.status === filterStatus) &&
      (filterRole === "todos" || u.email.endsWith(filterRole)) &&
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: users.length,
    staff: users.filter((u) => u.email.endsWith("@marweld.pe")).length,
    active: users.filter((u) => u.status === "activo").length,
    suspended: users.filter((u) => u.status === "suspendido").length,
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(newUser);
    setIsCreateModalOpen(false);
    // Reset state
    setNewUser({
      name: "",
      email: "",
      role: "Cliente Registrado",
      status: "activo",
      joinedDate: new Date().toISOString().substring(0, 10),
      lastActive: "Nunca"
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser) {
      updateUser(editUser);
      setEditUser(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteUserId) {
      deleteUser(deleteUserId);
      setDeleteUserId(null);
    }
  };

  const handleSuspendConfirm = () => {
    if (suspendUserId && suspendConfirmInput === "SUSPENDER") {
      suspendUser(suspendUserId);
      setSuspendUserId(null);
      setSuspendConfirmInput("");
    }
  };

  const toggleUserStatus = (userToToggle: User) => {
    if (userToToggle.status === "suspendido") {
      // Re-activate directly
      updateUser({ ...userToToggle, status: "activo" });
    } else {
      // Open double verification suspension modal
      setSuspendUserId(userToToggle.id);
      setSuspendConfirmInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] m-0">Gestión de Usuarios</h1>
          <p className="text-sm text-[var(--foreground)]/60">Administra los accesos de tus trabajadores y clientes del sistema.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[var(--primary)] text-zinc-950 hover:brightness-95 hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-md shadow-[var(--primary)]/10 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4.5 w-4.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.3 21c-2.33 0-4.517-.639-6.3-1.765z" />
          </svg>
          Registrar Usuario
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm p-4">
          <p className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Usuarios Totales</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm p-4">
          <p className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Personal Autorizado</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.staff}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs font-semibold text-emerald-500/80 uppercase tracking-wider">Usuarios Activos</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-semibold text-rose-500/80 uppercase tracking-wider">Suspendidos</p>
          <p className="mt-1 text-2xl font-bold text-rose-500">{stats.suspended}</p>
        </div>
      </div>

      {/* Users Container */}
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
                placeholder="Buscar usuario por nombre, email o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] py-2 pl-9 pr-4 text-xs text-[var(--foreground)] placeholder-[var(--foreground)]/40 focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all"
              />
            </div>
            
            {/* Botón de Filtro para Personal */}
            <button
              onClick={() => {
                setFilterRole(filterRole === "todos" ? "@marweld.pe" : "todos");
              }}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                filterRole !== "todos"
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border border-[var(--foreground)]/10 bg-[var(--background)] text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.24 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              <span>{filterRole === "todos" ? "Filtrar Personal" : "Mostrar Todos"}</span>
            </button>

            {/* Selector de Estado */}
            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--foreground)]/5 p-0.5 border border-[var(--foreground)]/10 ml-auto">
              {["todos", "activo", "suspendido"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                    filterStatus === status
                      ? "bg-[var(--primary)] text-zinc-950 shadow-sm"
                      : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                <th className="p-4">Nombre</th>
                <th className="p-4">Correo Electrónico</th>
                <th className="p-4">Rol / Permisos</th>
                <th className="p-4 text-center">Fecha de Ingreso</th>
                <th className="p-4 text-center">Último Acceso</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--foreground)]/10 text-xs">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-[var(--foreground)]/2 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-semibold text-[var(--foreground)]">{user.name}</td>
                    <td className="p-4 text-[var(--foreground)]/80 font-mono">{user.email}</td>
                    <td className="p-4">
                      <span className={`rounded-lg px-2.5 py-1 text-[11px] font-medium border ${
                        user.email.endsWith("@marweld.pe")
                          ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20"
                          : "bg-[var(--foreground)]/5 text-[var(--foreground)]/80 border-[var(--foreground)]/10"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-center text-[var(--foreground)]/60 font-mono">{user.joinedDate}</td>
                    <td className="p-4 text-center text-[var(--foreground)]/60 font-mono">{user.lastActive}</td>
                    <td className="p-4 text-center">
                      {user.status === "activo" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--foreground)]/10 px-2.5 py-0.5 text-[10px] font-medium text-[var(--foreground)]/60 border border-[var(--foreground)]/20">
                          Suspendido
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setEditUser(user)}
                          className="rounded bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)] hover:border-[var(--foreground)]/30 hover:bg-[var(--foreground)]/10 transition-all cursor-pointer"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => toggleUserStatus(user)}
                          className={cn(
                            "rounded border border-transparent px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer",
                            user.status === "activo" 
                              ? "text-rose-400 hover:bg-rose-500/10" 
                              : "text-emerald-400 hover:bg-emerald-500/10"
                          )}
                        >
                          {user.status === "activo" ? "Suspender" : "Reactivar"}
                        </button>
                        <button 
                          onClick={() => setDeleteUserId(user.id)}
                          className="rounded border border-transparent px-2.5 py-1 text-[11px] font-medium text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--foreground)]/40">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/95 p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest block mb-0.5">Perfil de Acceso</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Detalle del Usuario</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white hover:rotate-90 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-6 flex flex-col items-center text-center space-y-4 pb-4">
              {/* Profile Initials Avatar */}
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[var(--primary)]/30 to-[var(--primary)]/10 border border-[var(--primary)]/40 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-[var(--primary)]/10">
                {selectedUser.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              
              <div>
                <h4 className="text-base font-bold text-white leading-tight">{selectedUser.name}</h4>
                <p className="text-[11px] text-white/50 font-mono mt-0.5">{selectedUser.email}</p>
              </div>

              <div>
                <span className={cn(
                  "inline-block rounded-lg px-2.5 py-1 text-[11px] font-semibold border",
                  selectedUser.email.endsWith("@marweld.pe")
                    ? "bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/30"
                    : "bg-white/5 text-white/90 border-white/10"
                )}>
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="mt-2 space-y-3.5 text-xs border-t border-white/5 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Estado de Cuenta</span>
                  <span className="block mt-0.5">
                    {selectedUser.status === "activo" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-[9px] font-bold text-rose-400">
                        Suspendido
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Tipo de Permisos</span>
                  <span className="text-white/80 font-semibold block mt-0.5">
                    {selectedUser.email.endsWith("@marweld.pe") ? "Interno / Staff" : "Cliente / Externo"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Fecha de Registro</span>
                  <span className="text-white font-mono font-semibold block">{selectedUser.joinedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider mb-0.5">Última Actividad</span>
                  <span className="text-white font-mono font-semibold block">{selectedUser.lastActive}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/5 pt-4 flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)} 
                className="bg-[var(--primary)] text-zinc-950 px-5 py-2 rounded-xl text-xs font-bold hover:brightness-95 hover:scale-[1.02] transition-all cursor-pointer shadow-md shadow-[var(--primary)]/10"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setEditUser(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--foreground)]/10 bg-[var(--background)] p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--foreground)]/10 pb-3">
                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Editar Usuario</h3>
                <button type="button" onClick={() => setEditUser(null)} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Rol / Cargo</label>
                    <select
                      value={editUser.role}
                      onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    >
                      <option value="Administrador de Sistemas">Administrador de Sistemas</option>
                      <option value="Super Admin / Desarrollador">Super Admin / Desarrollador</option>
                      <option value="Cliente Premium">Cliente Premium</option>
                      <option value="Vendedor / Almacenero">Vendedor / Almacenero</option>
                      <option value="Soporte Técnico">Soporte Técnico</option>
                      <option value="Cliente Registrado">Cliente Registrado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Estado</label>
                    <select
                      value={editUser.status}
                      onChange={(e) => setEditUser({ ...editUser, status: e.target.value as any })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    >
                      <option value="activo">Activo</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Fecha de Ingreso</label>
                    <input
                      type="date"
                      required
                      value={editUser.joinedDate}
                      onChange={(e) => setEditUser({ ...editUser, joinedDate: e.target.value })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Último Acceso</label>
                    <input
                      type="text"
                      required
                      value={editUser.lastActive}
                      onChange={(e) => setEditUser({ ...editUser, lastActive: e.target.value })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3 border-t border-[var(--foreground)]/10">
                <button type="button" onClick={() => setEditUser(null)} className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--foreground)]/10 transition-all cursor-pointer">
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

      {/* DELETE USER CONFIRMATION MODAL */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setDeleteUserId(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-rose-500/20 bg-[var(--background)] p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">¿Eliminar Usuario?</h3>
              <p className="text-xs text-[var(--foreground)]/60 max-w-xs leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente a este usuario? Esta acción es definitiva y le quitará el acceso al sistema.
              </p>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button onClick={() => setDeleteUserId(null)} className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--foreground)]/10 transition-all cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm} className="bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-rose-500 transition-all cursor-pointer">
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOUBLE-VERIFICATION SUSPENSION MODAL */}
      {suspendUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => { setSuspendUserId(null); setSuspendConfirmInput(""); }} />
          <div className="relative w-full max-w-sm rounded-2xl border border-amber-500/20 bg-[var(--background)] p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Doble Verificación de Suspensión</h3>
              <p className="text-xs text-[var(--foreground)]/60 max-w-xs leading-relaxed">
                Estás a punto de suspender al usuario. Para confirmar esta acción, por favor escribe <strong className="text-amber-500 select-all font-mono font-bold">SUSPENDER</strong> en el recuadro inferior.
              </p>
            </div>
            
            <div className="mt-4">
              <input
                type="text"
                value={suspendConfirmInput}
                onChange={(e) => setSuspendConfirmInput(e.target.value)}
                placeholder="Escribe SUSPENDER aquí..."
                className="w-full text-center text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all font-mono font-bold"
              />
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <button 
                onClick={() => { setSuspendUserId(null); setSuspendConfirmInput(""); }} 
                className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--foreground)]/10 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSuspendConfirm}
                disabled={suspendConfirmInput !== "SUSPENDER"}
                className={cn(
                  "font-bold px-4 py-2 rounded-xl text-xs transition-all",
                  suspendConfirmInput === "SUSPENDER"
                    ? "bg-amber-500 text-zinc-950 hover:bg-amber-400 cursor-pointer shadow-md shadow-amber-500/10"
                    : "bg-[var(--foreground)]/5 text-[var(--foreground)]/30 cursor-not-allowed border border-[var(--foreground)]/5"
                )}
              >
                Confirmar Suspensión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--foreground)]/10 bg-[var(--background)] p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--foreground)]/10 pb-3">
                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Registrar Nuevo Usuario</h3>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@marweld.pe o gmail..."
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Rol / Cargo</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    >
                      <option value="Administrador de Sistemas">Administrador de Sistemas</option>
                      <option value="Super Admin / Desarrollador">Super Admin / Desarrollador</option>
                      <option value="Cliente Premium">Cliente Premium</option>
                      <option value="Vendedor / Almacenero">Vendedor / Almacenero</option>
                      <option value="Soporte Técnico">Soporte Técnico</option>
                      <option value="Cliente Registrado">Cliente Registrado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)]/80 block mb-1">Estado</label>
                    <select
                      value={newUser.status}
                      onChange={(e) => setNewUser({ ...newUser, status: e.target.value as any })}
                      className="w-full text-xs rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-2.5 text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all"
                    >
                      <option value="activo">Activo</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3 border-t border-[var(--foreground)]/10">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/80 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[var(--foreground)]/10 transition-all cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="bg-[var(--primary)] text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs hover:brightness-95 transition-all cursor-pointer">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
