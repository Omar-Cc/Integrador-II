import type { OrderSummary } from "../services/order.service";

const styles: Record<string, string> = {
  PENDIENTE: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200",
  PAGADO: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  ENVIADO: "border-violet-400/25 bg-violet-400/10 text-violet-200",
  ENTREGADO: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  CANCELADO: "border-red-400/25 bg-red-400/10 text-red-200",
};

export function OrderStatus({ code, label }: Readonly<{ code: OrderSummary["estadoCodigo"]; label: string }>) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${styles[code] ?? "border-white/15 bg-white/5 text-white/70"}`}>{label}</span>;
}
