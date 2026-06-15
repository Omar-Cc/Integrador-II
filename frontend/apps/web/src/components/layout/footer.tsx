import { cn } from "@marweld/ui/lib/utils";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-black text-white">
      {/* Franja principal */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3">
        {/* Marca */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 text-black"
                aria-hidden="true"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-1.56-1.561V5.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v2.116L12 3.53 2.47 11.47a.75.75 0 001.06 1.06l1.061-1.06V19.5a2.25 2.25 0 002.25 2.25H9a.75.75 0 00.75-.75v-4.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21a.75.75 0 00.75.75h3.418a2.25 2.25 0 002.25-2.25V11.47l1.061 1.06a.75.75 0 101.06-1.06l-8.69-8.69z" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">Marweld Perú</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                S.A.C.
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-white/40">
            Soluciones en construcción y materiales de calidad para proyectos en
            todo el Perú.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Navegación
          </p>
          <nav className="flex flex-col gap-2">
            {[
              { label: "Inicio", href: "/" },
              { label: "Productos", href: "/productos" },
              { label: "Nosotros", href: "/nosotros" },
              { label: "Contacto", href: "/contacto" },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="hover:text-primary w-fit text-xs text-white/40 transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Contacto */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Contacto
          </p>
          <div className="flex flex-col gap-2">
            {[
              {
                icon: "M2.25 6.338c0 3.866 3.125 7.516 8.563 11.193.398.26.888.26 1.286 0C17.625 13.854 20.75 10.204 20.75 6.338 20.75 2.96 17.68.25 13.969.25c-1.917 0-3.693.82-5.026 2.157L9 2.354l-.943-.947A6.849 6.849 0 0 0 2.25 6.338Z",
                label: "Lima, Perú",
                href: "#",
              },
              {
                icon: "M1.5 8.25a.75.75 0 0 1 .75-.75h19.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1-.75-.75V8.25ZM3.75 4.5h16.5a.75.75 0 0 1 .75.75V6H3v-.75a.75.75 0 0 1 .75-.75Z",
                label: "contacto@marweld.pe",
                href: "mailto:contacto@marweld.pe",
              },
            ].map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                className={cn(
                  "hover:text-primary flex w-fit items-center gap-2 text-xs text-white/40 transition-colors duration-200",
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                >
                  <path d={icon} />
                </svg>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Franja inferior */}
      <div className="border-white/8 border-t px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-white/25">
            © {year} Marweld Perú S.A.C. — Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/20">Hecho con</span>
            <span className="text-primary text-xs">♥</span>
            <span className="text-xs text-white/20">en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
