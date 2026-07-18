"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "../../../components/layout/navbar";
import Footer from "../../../components/layout/footer";
import { Chatbot } from "../../../components/chatbot/chatbot";
import { useAuthStore } from "../../../shared/stores/auth.store";

type NavigationItem = {
  href: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
};

const navigation: NavigationItem[] = [
  { href: "/cuenta", label: "Resumen", icon: <path d="M4.5 10.5 12 4l7.5 6.5v8.25a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V10.5Zm5.25 9V14.25h4.5v5.25" /> },
  { href: "/cuenta/pedidos", label: "Pedidos", hint: "Próximamente", icon: <path d="M5.25 3.75A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H17.5V3a.75.75 0 0 0-1.5 0v.75h-8.5V3A.75.75 0 0 0 6 3v.75H5.25ZM7.5 9.5h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1 0-1.5Zm0 4h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1 0-1.5Z" /> },
  { href: "/cuenta/direcciones", label: "Direcciones", hint: "Próximamente", icon: <path fillRule="evenodd" d="M12 1.5A8.25 8.25 0 0 0 3.75 9.75c0 5.272 5.12 10.14 7.19 11.884a1.64 1.64 0 0 0 2.12 0c2.07-1.745 7.19-6.612 7.19-11.884A8.25 8.25 0 0 0 12 1.5Zm0 11.25a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" clipRule="evenodd" /> },
  { href: "/cuenta/seguridad", label: "Seguridad", icon: <path fillRule="evenodd" d="M12 1.5 4.5 5.25v5.59c0 4.74 3.21 9.15 7.5 10.66 4.29-1.51 7.5-5.92 7.5-10.66V5.25L12 1.5Zm0 5.25a2.25 2.25 0 0 0-2.25 2.25v1.5h4.5V9A2.25 2.25 0 0 0 12 6.75Z" clipRule="evenodd" /> },
];

function AccountNav({ compact = false }: Readonly<{ compact?: boolean }>) {
  const pathname = usePathname();
  return <nav aria-label="Navegación de cuenta" className={compact ? "flex gap-2 overflow-x-auto pb-1" : "space-y-1"}>
    {navigation.map((item) => {
      const active = item.href === "/cuenta" ? pathname === item.href : pathname.startsWith(item.href);
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={compact
        ? `flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${active ? "border-yellow-400/50 bg-yellow-400 text-black" : "border-white/10 bg-white/[0.035] text-white/60 hover:border-white/25 hover:text-white"}`
        : `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-yellow-400 text-black shadow-[0_8px_24px_rgba(250,204,21,0.15)]" : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4 shrink-0" aria-hidden="true">{item.icon}</svg>
        <span>{item.label}</span>{!compact && item.hint && <span className={`ml-auto text-[9px] font-bold uppercase tracking-wide ${active ? "text-black/55" : "text-white/30"}`}>{item.hint}</span>}
      </Link>;
    })}
  </nav>;
}

export function AccountLayoutShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = useAuthStore((state) => state.user);
  const initials = user?.nombre ? user.nombre.split(" ").map((item) => item[0]).slice(0, 2).join("").toUpperCase() : "M";

  return <div className="flex min-h-screen flex-col bg-zinc-950"><Navbar /><main className="flex-1 bg-[radial-gradient(circle_at_88%_8%,rgba(250,204,21,0.07),transparent_22rem)] px-4 py-6 sm:py-8"><div className="mx-auto max-w-7xl"><div className="mb-5 md:hidden"><AccountNav compact /></div><div className="grid gap-6 md:grid-cols-[232px_minmax(0,1fr)]"><aside className="hidden h-fit rounded-2xl border border-white/10 bg-zinc-900/65 p-3 md:block"><div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400 text-xs font-black text-black">{initials}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{user?.nombre ?? "Mi cuenta"}</p><p className="truncate text-xs text-white/40">{user?.correo ?? ""}</p></div></div><p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Área personal</p><AccountNav /></aside><div className="min-w-0">{children}</div></div></div></main><Footer /><Chatbot /></div>;
}
