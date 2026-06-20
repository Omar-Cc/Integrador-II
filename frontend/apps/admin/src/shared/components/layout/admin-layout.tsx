import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { cn } from "@marweld/ui/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: "dashboard" | "inventario" | "pedidos" | "usuarios" | "configuracion" | "reposiciones";
  onTabChange: (tab: "dashboard" | "inventario" | "pedidos" | "usuarios" | "configuracion" | "reposiciones") => void;
}

export function AdminLayout({
  children,
  activeTab,
  onTabChange,
}: AdminLayoutProps) {
  const { user, logout, updateUser } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Stock Crítico",
      desc: "Careta de Soldar Fotosensible está por debajo del stock mínimo (4 uds).",
      time: "Hace 5m",
      unread: true,
      type: "alert"
    },
    {
      id: "2",
      title: "Nuevo Pedido",
      desc: "Carlos Mendoza ha solicitado Soldadora Inverter Arc 200 (PED-8201).",
      time: "Hace 15m",
      unread: true,
      type: "order"
    },
    {
      id: "3",
      title: "Reposición Aprobada",
      desc: "Solicitud REP-002 de Guantes de Cuero ha sido aprobada por Omar Ccora.",
      time: "Hace 1h",
      unread: false,
      type: "replenishment"
    },
    {
      id: "4",
      title: "Acceso Exitoso",
      desc: "Inicio de sesión registrado correctamente en Lima, Perú.",
      time: "Hace 2h",
      unread: false,
      type: "system"
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("admin_theme", "light");
    }
  }, [isDarkMode]);

  const activeName = user ? user.name : "Jennifer Reyes";
  const activeRole = user ? user.role : "Administrador";
  const avatarUrl = user ? user.avatarUrl : "";

  const initials = activeName
    ? activeName
        .split(" ")
        .filter(Boolean)
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "JR";

  // Handlers for closing mobile menu when clicking
  const handleNavClick = (tab: "dashboard" | "inventario" | "pedidos" | "usuarios" | "configuracion" | "reposiciones") => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const isAdmin = user?.role === "Administrador" || user?.role === "Administrador de Sistemas";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.75"
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
          />
        </svg>
      ),
    },
    {
      id: "inventario",
      label: "Inventario",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.75"
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      ),
    },
    {
      id: "pedidos",
      label: "Pedidos",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.75"
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.375M9 18h3.375m-6.43-16.5H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 3.75H6.75a1.5 1.5 0 00-1.5 1.5v3.75A1.5 1.5 0 006.75 10.5h10.5a1.5 1.5 0 001.5-1.5V5.25A1.5 1.5 0 0017.25 3.75H15M9 3.75a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5M9 3.75v1.5a1.5 1.5 0 001.5 1.5h3a1.5 1.5 0 001.5-1.5v-1.5"
          />
        </svg>
      ),
    },
    isAdmin && {
      id: "reposiciones",
      label: "Reposiciones",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.75"
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
          />
        </svg>
      ),
    },
    isAdmin && {
      id: "usuarios",
      label: "Usuarios",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.75"
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.081 21c-3 0-5.724-1.157-7.794-3.047v-.009a6 6 0 0110.828-5.48M15 7.5a3 3 0 11-6 0 3 3 0 016 0zm6.308 1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          />
        </svg>
      ),
    },
  ].filter(Boolean) as any[];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-6">
      {/* Top Section: Logo & Profile */}
      <div className="space-y-8">
        {/* ── Logo ── */}
        <div className="flex items-center gap-3">
          <div className="bg-[var(--primary)] flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg shadow-[var(--primary)]/15">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-[var(--foreground)]"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-1.56-1.561V5.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v2.116L12 3.53 2.47 11.47a.75.75 0 001.06 1.06l1.061-1.06V19.5a2.25 2.25 0 002.25 2.25H9a.75.75 0 00.75-.75v-4.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21a.75.75 0 00.75.75h3.418a2.25 2.25 0 002.25-2.25V11.47l1.061 1.06a.75.75 0 101.06-1.06l-8.69-8.69z" />
            </svg>
          </div>
          <div className="leading-none">
            <span className="block text-base font-bold tracking-tight text-[var(--foreground)]">
              Marweld Perú
            </span>
            <span className="text-[var(--primary)]/80 text-[10px] font-bold uppercase tracking-[0.2em]">
              Panel Admin
            </span>
          </div>
        </div>

        {/* ── User Profile Card ── */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-4 backdrop-blur-md">
          {/* Decorative background gradient glow */}
          <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-[var(--primary)]/5 blur-xl" />
          <div className="flex flex-col items-center text-center">
            {/* Avatar and Notification Bell Container */}
            <div className="flex items-center justify-center gap-3 relative">
              {/* Left dummy spacing to balance the layout since bell is on the right */}
              <div className="w-8 h-8" />
              
              {/* Avatar container with status indicator */}
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={activeName}
                    className="h-16 w-16 rounded-full border-2 border-[var(--foreground)]/20 object-cover shadow-md transition-all duration-300 hover:border-[var(--primary)]"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--foreground)]/20 bg-[var(--foreground)]/10 text-lg font-bold text-[var(--foreground)] shadow-md">
                    {initials}
                  </div>
                )}
                {/* Online indicator */}
                <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 rounded-full border-2 border-[var(--background)] bg-emerald-500 shadow-sm">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                </span>
              </div>

              {/* Notification bell button */}
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  "h-8 w-8 rounded-full border flex items-center justify-center transition-all cursor-pointer hover:scale-105 relative",
                  isNotificationsOpen 
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm"
                    : "border-white/10 bg-white/5 text-white/80 hover:text-white"
                )}
                title="Notificaciones"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4.5 w-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {/* Ping dot */}
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                )}
              </button>
            </div>
 
            {/* User Details */}
            <div className="mt-3 w-full">
              <h3 className="truncate text-sm font-semibold text-[var(--foreground)]">
                {activeName}
              </h3>
              <p className="mt-0.5 truncate text-[11px] font-medium text-[var(--foreground)]/60">
                {activeRole}
              </p>
            </div>

            {/* Expandable Notification Panel */}
            {isNotificationsOpen && (
              <div className="mt-3.5 w-full border-t border-[var(--foreground)]/10 pt-3 text-left space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between text-[9px] font-bold text-[var(--foreground)]/45 uppercase tracking-wider">
                  <span>Alertas ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      className="hover:text-[var(--primary)] text-[8px] transition-colors cursor-pointer capitalize font-semibold"
                    >
                      Marcar leídos
                    </button>
                  )}
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => setNotifications(notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n))}
                        className={cn(
                          "p-2.5 rounded-xl text-[10px] leading-tight border transition-all cursor-pointer hover:border-white/10 relative",
                          notif.unread 
                            ? "bg-[var(--primary)]/5 border-[var(--primary)]/20 text-[var(--foreground)]" 
                            : "bg-white/2 border-white/5 text-[var(--foreground)]/70 hover:bg-white/5"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1 gap-1">
                          <span className={cn("font-bold tracking-wide", notif.unread ? "text-[var(--primary)]" : "text-[var(--foreground)]/80")}>
                            {notif.title}
                          </span>
                          <span className="text-[8px] text-[var(--foreground)]/30 shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[9px] text-[var(--foreground)]/60 leading-normal">{notif.desc}</p>
                        {notif.unread && (
                          <span className="absolute top-2.5 right-2 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-[10px] text-[var(--foreground)]/40 py-4">No tienes notificaciones.</p>
                  )}
                </div>
              </div>
            )}
          </div>

            {/* Quick Actions (Cerrar sesión, Tema & Configuración) */}
            <div className="mt-4 flex w-full gap-1.5 border-t border-[var(--foreground)]/10 pt-3">
              <button
                onClick={() => handleNavClick("configuracion")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-all duration-200",
                  activeTab === "configuracion"
                    ? "border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--foreground)]/10 bg-[var(--background)]/40 text-[var(--foreground)]/60 hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                )}
                title="Configuración"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.75"
                  stroke="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.83a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Config</span>
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)]/40 px-2 py-1.5 text-[11px] font-medium text-[var(--foreground)]/60 hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)] transition-all duration-200"
                title={isDarkMode ? "Cambiar a modo Día" : "Cambiar a modo Noche"}
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-3.5 w-3.5 text-amber-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M5.25 5.25l1.5 1.5m10.5 10.5l1.5 1.5M3 12h2.25m13.5 0H21M5.25 19.5l1.5-1.5m10.5-10.5l1.5-1.5M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-3.5 w-3.5 text-indigo-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
                <span>{isDarkMode ? "Día" : "Noche"}</span>
              </button>

              <button
                onClick={logout}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-red-500/10 px-2 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                title="Cerrar sesión"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.75"
                  stroke="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Navigation ── */}
        <nav className="space-y-1.5">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as any)}
                  className={cn(
                    "group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[var(--primary)] text-zinc-950 font-semibold shadow-md shadow-[var(--primary)]/10"
                      : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]"
                  )}
                >
                  <span
                    className={cn(
                      "transition-transform duration-200 group-hover:scale-110",
                      isActive ? "text-zinc-950" : "text-[var(--foreground)]/40 group-hover:text-[var(--foreground)]"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-zinc-950" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

      {/* Bottom Section: Volver a la tienda */}
      <div className="border-t border-[var(--foreground)]/10 pt-6">
        <a
          href="http://localhost:3000"
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)] py-3 text-xs font-semibold text-[var(--foreground)]/60 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          <span>Volver a la tienda</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-3.5 w-3.5 text-[var(--foreground)]/40 group-hover:text-[var(--primary)]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
      {/* ── Desktop Sidebar (lg and up) ── */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[var(--foreground)]/10 bg-[var(--background)]/80 backdrop-blur-xl lg:block">
        {sidebarContent}
      </aside>

      {/* ── Layout Outer Container ── */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* ── Mobile Top Header (less than lg) ── */}
        <header className="flex h-16 w-full items-center justify-between border-b border-[var(--foreground)]/10 bg-[var(--background)]/90 px-6 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--primary)] flex h-8 w-8 items-center justify-center rounded-lg shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4.5 w-4.5 text-[var(--foreground)]"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-1.56-1.561V5.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v2.116L12 3.53 2.47 11.47a.75.75 0 001.06 1.06l1.061-1.06V19.5a2.25 2.25 0 002.25 2.25H9a.75.75 0 00.75-.75v-4.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21a.75.75 0 00.75.75h3.418a2.25 2.25 0 002.25-2.25V11.47l1.061 1.06a.75.75 0 101.06-1.06l-8.69-8.69z" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-[var(--foreground)]">
              Marweld Panel
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-5.5 w-5.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </header>

        {/* ── Mobile Sidebar Drawer Slide-over (Portal/Overlay) ── */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-[var(--foreground)]/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer Content */}
            <div className="relative flex w-80 max-w-[85vw] flex-col bg-[var(--background)] border-r border-[var(--foreground)]/10 shadow-2xl transition-transform duration-300 animate-slide-in">
              {/* Close Button inside Drawer */}
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="h-4.5 w-4.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}

        {/* ── Main Content Area ── */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 bg-[var(--foreground)]/5">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
