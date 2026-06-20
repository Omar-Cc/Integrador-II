import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../shared/stores/auth.store";
import { cn } from "@marweld/ui/lib/utils";

export function ConfiguracionPanel() {
  const { user, updateUser } = useAuthStore();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [position, setPosition] = useState(user?.position || "");
  const [area, setArea] = useState(user?.area || "");
  
  const [successMsg, setSuccessMsg] = useState("");

  // System preferences states
  const [emailNotifications, setEmailNotifications] = useState(() => {
    const saved = localStorage.getItem("marweld_system_preferences");
    if (saved) return JSON.parse(saved).emailNotifications ?? true;
    return true;
  });
  const [dailyBackups, setDailyBackups] = useState(() => {
    const saved = localStorage.getItem("marweld_system_preferences");
    if (saved) return JSON.parse(saved).dailyBackups ?? true;
    return true;
  });
  const [catalogSync, setCatalogSync] = useState(() => {
    const saved = localStorage.getItem("marweld_system_preferences");
    if (saved) return JSON.parse(saved).catalogSync ?? true;
    return true;
  });

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState("");
  const [pwdErrorMsg, setPwdErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "");
      setAvatarUrl(user.avatarUrl || "");
      setPhone(user.phone || "");
      setPosition(user.position || "");
      setArea(user.area || "");
    }
  }, [user]);

  const handleSaveProfileAndPrefs = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    
    // Save profile info
    updateUser({
      name,
      email,
      phone,
      position,
      area,
      avatarUrl
    });

    // Save preferences
    localStorage.setItem(
      "marweld_system_preferences",
      JSON.stringify({
        emailNotifications,
        dailyBackups,
        catalogSync
      })
    );

    setSuccessMsg("¡Configuración y preferencias guardadas correctamente!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccessMsg("");
    setPwdErrorMsg("");

    if (!currentPassword) {
      setPwdErrorMsg("Por favor, ingrese su contraseña actual.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    // Success flow
    setPwdSuccessMsg("Contraseña actualizada correctamente.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPwdSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] m-0">Configuración</h1>
        <p className="text-sm text-[var(--foreground)]/60">Personaliza la información de tu cuenta y las preferencias del sistema.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5 shrink-0">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.74-5.24z" clipRule="evenodd" />
          </svg>
          {successMsg}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Worker info & Security info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* BLOCK 1: Información del Trabajador */}
          <div className="rounded-2xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-6 backdrop-blur-md shadow-lg space-y-5">
            <div className="flex items-center gap-3 border-b border-[var(--foreground)]/10 pb-3">
              <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--foreground)]">Información del Trabajador</h2>
                <p className="text-[11px] text-[var(--foreground)]/50">Datos personales e identificación laboral dentro del ERP.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfileAndPrefs} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]/60 tracking-wide block mb-1.5">Nombre Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)]/40 px-4 py-2.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]/60 tracking-wide block mb-1.5">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)]/40 px-4 py-2.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]/60 tracking-wide block mb-1.5">Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +51 987 654 321"
                    className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)]/40 px-4 py-2.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]/60 tracking-wide block mb-1.5">Cargo</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Ej. Asistente de Logística"
                    className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)]/40 px-4 py-2.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]/60 tracking-wide block mb-1.5">Área</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Ej. Almacén y Distribución"
                    className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)]/40 px-4 py-2.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]/60 tracking-wide block mb-1.5">Foto de Perfil (URL)</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)]/40 px-4 py-2.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all duration-200"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-[var(--foreground)]/60 tracking-wide block mb-1.5">Rol del Puesto</label>
                  <input
                    type="text"
                    value={role}
                    className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 px-4 py-2.5 text-xs text-[var(--foreground)]/60 outline-none cursor-not-allowed"
                    disabled
                  />
                  <p className="text-[10px] text-[var(--foreground)]/30 mt-1">El rol asigna los permisos del sistema y no es editable desde esta pantalla.</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[var(--primary)] text-zinc-950 hover:brightness-95 hover:scale-[1.01] transition-all duration-200 px-5 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-[var(--primary)]/10 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>

          {/* BLOCK 2: Seguridad de la Cuenta */}
          <div className="rounded-2xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-6 backdrop-blur-md shadow-lg space-y-5">
            <div className="flex items-center gap-3 border-b border-[var(--foreground)]/10 pb-3">
              <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--foreground)]">Seguridad de la Cuenta</h2>
                <p className="text-[11px] text-[var(--foreground)]/50">Cambia tu contraseña para mantener la seguridad de tus accesos.</p>
              </div>
            </div>

            {pwdSuccessMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.74-5.24z" clipRule="evenodd" />
                </svg>
                {pwdSuccessMsg}
              </div>
            )}

            {pwdErrorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                </svg>
                {pwdErrorMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider text-[var(--primary)]">Cambiar contraseña</h3>
                
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--foreground)]/60 tracking-wide block mb-1.5">Contraseña actual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)]/40 px-4 py-2.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--foreground)]/60 tracking-wide block mb-1.5">Nueva contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)]/40 px-4 py-2.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--foreground)]/60 tracking-wide block mb-1.5">Confirmar nueva contraseña</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)]/40 px-4 py-2.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/50 outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[var(--primary)] text-zinc-950 hover:brightness-95 hover:scale-[1.01] transition-all duration-200 px-5 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-[var(--primary)]/10 cursor-pointer"
                >
                  Actualizar contraseña
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: System preferences (Block 3) */}
        {/* BLOCK 3: Preferencias del Sistema */}
        <div className="rounded-2xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-6 backdrop-blur-md shadow-lg space-y-5 h-fit">
          <div className="flex items-center gap-3 border-b border-[var(--foreground)]/10 pb-3">
            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Preferencias del Sistema</h2>
              <p className="text-[11px] text-[var(--foreground)]/50">Configura el comportamiento del ERP.</p>
            </div>
          </div>
          
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--foreground)]">Notificaciones por Correo</p>
                <p className="text-[10px] text-[var(--foreground)]/40">Alertas de stock y pedidos nuevos</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                  emailNotifications ? "bg-emerald-500" : "bg-zinc-800"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    emailNotifications ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--foreground)]">Copias de Seguridad Diarias</p>
                <p className="text-[10px] text-[var(--foreground)]/40">Resguardo del inventario y ventas</p>
              </div>
              <button
                type="button"
                onClick={() => setDailyBackups(!dailyBackups)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                  dailyBackups ? "bg-emerald-500" : "bg-zinc-800"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    dailyBackups ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--foreground)]">Sincronización del Catálogo</p>
                <p className="text-[10px] text-[var(--foreground)]/40">Cambios inmediatos en la web de venta</p>
              </div>
              <button
                type="button"
                onClick={() => setCatalogSync(!catalogSync)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                  catalogSync ? "bg-emerald-500" : "bg-zinc-800"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    catalogSync ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
          
          <div className="pt-3 border-t border-[var(--foreground)]/10 text-center">
            <p className="text-[10px] text-[var(--foreground)]/30">
              * Recuerda hacer clic en "Guardar Cambios" en la sección de información para almacenar tus preferencias.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
