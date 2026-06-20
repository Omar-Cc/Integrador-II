import React, { useState } from "react";
import { cn } from "@marweld/ui/lib/utils";
import { useERPStore } from "../../../shared/stores/erp.store";

interface MetricDataPoint {
  label: string;
  val: number;
  display: string;
  growth: string;
  stats: {
    pending: number;
    processing: number;
    completed: number;
    canceled: number;
  };
}

interface MetricGroup {
  label: string;
  title: string;
  prefix: string;
  suffix: string;
  color: string;
  data: MetricDataPoint[];
}

const CHART_METRICS: Record<"ventas" | "pedidos" | "productos", MetricGroup> = {
  ventas: {
    label: "Ventas del Mes",
    title: "Ventas Totales",
    prefix: "S/. ",
    suffix: "",
    color: "var(--primary)",
    data: [
      { label: "Enero", val: 1200.00, display: "S/. 1,200.00", growth: "+8.4%", stats: { pending: 4, processing: 2, completed: 18, canceled: 1 } },
      { label: "Febrero", val: 1850.50, display: "S/. 1,850.50", growth: "+54.2%", stats: { pending: 6, processing: 4, completed: 25, canceled: 2 } },
      { label: "Marzo", val: 2400.00, display: "S/. 2,400.00", growth: "+29.7%", stats: { pending: 5, processing: 3, completed: 32, canceled: 1 } },
      { label: "Abril", val: 3800.00, display: "S/. 3,800.00", growth: "+58.3%", stats: { pending: 9, processing: 6, completed: 38, canceled: 3 } },
      { label: "Mayo", val: 2950.20, display: "S/. 2,950.20", growth: "-22.4%", stats: { pending: 8, processing: 5, completed: 40, canceled: 2 } },
      { label: "Junio", val: 4520.40, display: "S/. 4,520.40", growth: "+53.2%", stats: { pending: 12, processing: 8, completed: 45, canceled: 3 } },
    ]
  },
  pedidos: {
    label: "Pedidos del Mes",
    title: "Pedidos Realizados",
    prefix: "",
    suffix: " pedidos",
    color: "var(--primary)",
    data: [
      { label: "Enero", val: 25, display: "25 pedidos", growth: "+4.1%", stats: { pending: 3, processing: 2, completed: 19, canceled: 1 } },
      { label: "Febrero", val: 37, display: "37 pedidos", growth: "+48.0%", stats: { pending: 4, processing: 3, completed: 28, canceled: 2 } },
      { label: "Marzo", val: 41, display: "41 pedidos", growth: "+10.8%", stats: { pending: 5, processing: 4, completed: 31, canceled: 1 } },
      { label: "Abril", val: 56, display: "56 pedidos", growth: "+36.5%", stats: { pending: 7, processing: 5, completed: 41, canceled: 3 } },
      { label: "Mayo", val: 55, display: "55 pedidos", growth: "-1.8%", stats: { pending: 6, processing: 5, completed: 42, canceled: 2 } },
      { label: "Junio", val: 68, display: "68 pedidos", growth: "+23.6%", stats: { pending: 10, processing: 7, completed: 48, canceled: 3 } },
    ]
  },
  productos: {
    label: "Stock de Inventario",
    title: "Unidades en Stock",
    prefix: "",
    suffix: " uds.",
    color: "var(--primary)",
    data: [
      { label: "Enero", val: 95, display: "95 unidades", growth: "+2.1%", stats: { pending: 2, processing: 1, completed: 12, canceled: 0 } },
      { label: "Febrero", val: 110, display: "110 unidades", growth: "+15.7%", stats: { pending: 3, processing: 2, completed: 16, canceled: 1 } },
      { label: "Marzo", val: 105, display: "105 unidades", growth: "-4.5%", stats: { pending: 4, processing: 2, completed: 20, canceled: 1 } },
      { label: "Abril", val: 140, display: "140 unidades", growth: "+33.3%", stats: { pending: 5, processing: 3, completed: 26, canceled: 2 } },
      { label: "Mayo", val: 135, display: "135 unidades", growth: "-3.5%", stats: { pending: 5, processing: 4, completed: 30, canceled: 1 } },
      { label: "Junio", val: 154, display: "154 unidades", growth: "+14.0%", stats: { pending: 7, processing: 5, completed: 38, canceled: 2 } },
    ]
  }
};

const RECENT_ORDERS = [
  { id: "PED-8201", customer: "Carlos Mendoza", date: "2026-06-16", items: "1x Soldadora Inverter Arc 200", total: 799.99, status: "pendiente" },
  { id: "PED-8202", customer: "Marta Rodríguez", date: "2026-06-15", items: "2x Careta de Soldar Fotosensible", total: 299.80, status: "completado" },
  { id: "PED-8203", customer: "Constructora H&M S.A.", date: "2026-06-15", items: "10x Electrodos Cellocord E6011", total: 450.00, status: "completado" },
  { id: "PED-8207", customer: "Miguel Ángel", date: "2026-06-11", items: "1x Antorcha TIG WP-26 4m", total: 189.50, status: "procesando" },
];

const BEST_SELLERS = [
  { name: "Careta de Soldar Fotosensible", sales: 45, percentage: 85, color: "bg-emerald-500" },
  { name: "Soldadora Inverter Arc 200", sales: 18, percentage: 65, color: "bg-[var(--primary)]" },
  { name: "Electrodos Cellocord E6011", sales: 120, percentage: 50, color: "bg-amber-500" },
  { name: "Cortadora de Plasma Cut 50", sales: 8, percentage: 40, color: "bg-rose-500" },
];

export function DashboardPanel() {
  const { products, openReplenishmentModal } = useERPStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5); // June
  const [activeMetric, setActiveMetric] = useState<"ventas" | "pedidos" | "productos">("ventas");

  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedMonthIndex;
  const metricInfo = CHART_METRICS[activeMetric];
  const activePoint = (metricInfo.data[activeIndex] ?? metricInfo.data[0]) as MetricDataPoint;

  // Chart coordinates
  const paddingLeft = 40;
  const paddingRight = 40;
  const width = 500;
  const innerWidth = width - paddingLeft - paddingRight;

  const vals = metricInfo.data.map((d) => d.val);
  const minVal = Math.min(...vals) * 0.95;
  const maxVal = Math.max(...vals) * 1.05;
  const range = maxVal - minVal;

  const points = metricInfo.data.map((d, i) => {
    const x = paddingLeft + (i / (metricInfo.data.length - 1)) * innerWidth;
    const y = 150 - ((d.val - minVal) / (range || 1)) * 120;
    return { x, y, label: d.label, val: d.val, display: d.display, growth: d.growth };
  });

  const activeChartPoint = points[activeIndex] ?? points[0];

  const getBezierPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    const pStart = pts[0];
    if (!pStart) return "";
    let d = `M ${pStart.x.toFixed(1)} ${pStart.y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      if (!p0 || !p1) continue;
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  };

  const pathD = getBezierPath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaD = pathD && firstPoint && lastPoint
    ? `${pathD} L ${lastPoint.x.toFixed(1)} 170 L ${firstPoint.x.toFixed(1)} 170 Z`
    : "";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const svgX = (x / rect.width) * 500;
    const index = Math.max(0, Math.min(5, Math.round((svgX - paddingLeft) / (innerWidth / 5))));
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleSvgClick = () => {
    if (hoveredIndex !== null) {
      setSelectedMonthIndex(hoveredIndex);
    }
  };

  const isGrowthPositive = activePoint.growth.startsWith("+");
  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : undefined;
  const hoveredData = hoveredIndex !== null ? metricInfo.data[hoveredIndex] : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] m-0">Panel de Control</h1>
        <p className="text-sm text-[var(--foreground)]/60">Resumen y analíticas clave de Marweld Perú para la toma de decisiones.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm p-4">
          <p className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Ventas del Mes</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">S/. {CHART_METRICS.ventas.data[selectedMonthIndex]?.val.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="h-2.5 w-2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            {CHART_METRICS.ventas.data[selectedMonthIndex]?.growth} vs mes anterior
          </span>
        </div>
        <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm p-4">
          <p className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Pedidos Nuevos</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{CHART_METRICS.pedidos.data[selectedMonthIndex]?.val} pedidos</p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="h-2.5 w-2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            {CHART_METRICS.pedidos.data[selectedMonthIndex]?.growth} vs mes anterior
          </span>
        </div>
        <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm p-4">
          <p className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Stock Disponible</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{CHART_METRICS.productos.data[selectedMonthIndex]?.val} uds.</p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="h-2.5 w-2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            {CHART_METRICS.productos.data[selectedMonthIndex]?.growth} vs mes anterior
          </span>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-semibold text-rose-500/80 uppercase tracking-wider">Alerta de Stock Bajo</p>
          <p className="mt-1 text-2xl font-bold text-rose-500">2 productos</p>
          <span className="text-[10px] text-rose-400 font-semibold mt-1 block">Requieren reabastecimiento</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Interactive Line Chart (takes 2 columns) */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">{metricInfo.title}</p>
                  <span className="text-[10px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 px-1.5 py-0.5 rounded text-[var(--foreground)]/60 uppercase font-bold tracking-wider font-mono">
                    {activeMetric}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mt-1 transition-all duration-300">
                  {activePoint.display}
                </h3>
                <p className="text-[10px] text-[var(--foreground)]/40 mt-1">
                  {hoveredIndex !== null ? (
                    <span className="text-[var(--primary)] font-semibold animate-pulse">
                      Previsualizando {activePoint.label}
                    </span>
                  ) : (
                    <span>
                      Mostrando {activePoint.label} <span className="text-[var(--primary)]/70 font-bold">(Fijado)</span>
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 rounded-lg bg-[var(--foreground)]/5 p-0.5 border border-[var(--foreground)]/10 text-[10px]">
                  <button
                    onClick={() => setActiveMetric("ventas")}
                    className={cn(
                      "px-2.5 py-0.5 rounded-md font-bold transition-all duration-200 cursor-pointer",
                      activeMetric === "ventas"
                        ? "bg-[var(--primary)] text-zinc-950 shadow-sm"
                        : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                    )}
                  >
                    Ventas
                  </button>
                  <button
                    onClick={() => setActiveMetric("pedidos")}
                    className={cn(
                      "px-2.5 py-0.5 rounded-md font-bold transition-all duration-200 cursor-pointer",
                      activeMetric === "pedidos"
                        ? "bg-[var(--primary)] text-zinc-950 shadow-sm"
                        : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                    )}
                  >
                    Pedidos
                  </button>
                  <button
                    onClick={() => setActiveMetric("productos")}
                    className={cn(
                      "px-2.5 py-0.5 rounded-md font-bold transition-all duration-200 cursor-pointer",
                      activeMetric === "productos"
                        ? "bg-[var(--primary)] text-zinc-950 shadow-sm"
                        : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                    )}
                  >
                    Stock
                  </button>
                </div>

                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-all duration-300",
                  isGrowthPositive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3 w-3">
                    {isGrowthPositive ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
                    )}
                  </svg>
                  {activePoint.growth}
                </span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="mt-6 h-48 w-full relative">
            {hoveredPoint && hoveredData && (
              <div
                className="absolute z-10 bg-[var(--background)] border border-[var(--foreground)]/10 text-[var(--foreground)] text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-[0_4px_20px_-2px_rgba(0,0,0,0.15)] pointer-events-none transform -translate-x-1/2 -translate-y-12 transition-all duration-150 backdrop-blur-md"
                style={{
                  left: `${(hoveredPoint.x / 500) * 100}%`,
                  top: `${(hoveredPoint.y / 180) * 100}%`
                }}
              >
                <p className="text-[9px] text-[var(--foreground)]/40 leading-none uppercase font-bold tracking-wider">{hoveredData.label}</p>
                <p className="mt-0.5 text-xs text-[var(--primary)] font-bold leading-none">{hoveredPoint.display}</p>
                <p className={cn(
                  "mt-1 text-[9px] font-bold leading-none",
                  hoveredPoint.growth.startsWith("+") ? "text-emerald-400" : "text-rose-400"
                )}>
                  {hoveredPoint.growth} MoM
                </p>
              </div>
            )}

            <svg
              viewBox="0 0 500 180"
              className="w-full h-full overflow-visible select-none cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleSvgClick}
            >
              <defs>
                <linearGradient id="chartGradientDashboard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="500" y2="30" stroke="var(--foreground)" strokeOpacity="0.05" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="var(--foreground)" strokeOpacity="0.05" strokeDasharray="3 3" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="var(--foreground)" strokeOpacity="0.05" strokeDasharray="3 3" />
              
              {areaD && (
                <path
                  d={areaD}
                  fill="url(#chartGradientDashboard)"
                  className="transition-all duration-300"
                />
              )}

              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              )}

              {activeChartPoint && (
                <>
                  <line
                    x1={activeChartPoint.x}
                    y1="10"
                    x2={activeChartPoint.x}
                    y2="170"
                    stroke="var(--primary)"
                    strokeOpacity="0.25"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                    className="transition-all duration-150"
                  />
                  <line
                    x1="30"
                    y1={activeChartPoint.y}
                    x2="470"
                    y2={activeChartPoint.y}
                    stroke="var(--primary)"
                    strokeOpacity="0.15"
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                    className="transition-all duration-150"
                  />
                </>
              )}
              
              {points.map((point, index) => {
                const isHovered = hoveredIndex === index;
                const isSelected = selectedMonthIndex === index && hoveredIndex === null;
                const isActive = isHovered || isSelected;
                return (
                  <g key={index} className="transition-all duration-200">
                    {isActive && (
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="10"
                        fill="var(--primary)"
                        fillOpacity="0.2"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? "6.5" : "4.5"}
                      fill="var(--background)"
                      stroke="var(--primary)"
                      strokeWidth={isActive ? "3" : "2.5"}
                      className="transition-all duration-200 cursor-pointer"
                    />
                  </g>
                );
              })}
            </svg>
            
            <div className="flex justify-between mt-2 text-[10px] text-[var(--foreground)]/40 font-bold px-4">
              {metricInfo.data.map((d, i) => (
                <span
                  key={i}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    i === activeIndex ? "text-[var(--primary)] scale-110 font-bold" : "hover:text-[var(--foreground)]/60"
                  )}
                  onClick={() => setSelectedMonthIndex(i)}
                >
                  {d.label.substring(0, 3)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Top-Selling Products (takes 1 column) */}
        <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Productos más vendidos</h3>
            <p className="text-xs text-[var(--foreground)]/40 mt-1">Top demanda de herramientas.</p>
          </div>

          <div className="mt-6 flex-1 space-y-4">
            {BEST_SELLERS.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--foreground)] truncate max-w-[150px]">{item.name}</span>
                  <span className="text-[var(--foreground)]/60">{item.sales} ventas</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--foreground)]/5 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", item.color)}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/2 backdrop-blur-sm p-6">
          <div className="border-b border-[var(--foreground)]/10 pb-4">
            <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Pedidos Recientes</h3>
            <p className="text-xs text-[var(--foreground)]/40 mt-0.5">Últimas transacciones realizadas en la tienda.</p>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--foreground)]/10 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                  <th className="pb-3">ID Pedido</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3 text-right">Total</th>
                  <th className="pb-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--foreground)]/5 text-xs">
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--foreground)]/2 transition-colors">
                    <td className="py-3 font-mono font-semibold text-[var(--foreground)]">{order.id}</td>
                    <td className="py-3 font-medium text-[var(--foreground)]/80">{order.customer}</td>
                    <td className="py-3 text-[var(--foreground)]/60 truncate max-w-[150px]" title={order.items}>{order.items}</td>
                    <td className="py-3 text-right font-semibold text-[var(--foreground)]">S/. {order.total.toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border",
                        order.status === "completado" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        order.status === "pendiente" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                        order.status === "procesando" && "bg-sky-500/10 text-sky-400 border-sky-500/20"
                      )}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick business tip */}
        <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 p-2 w-max text-[var(--primary)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Consejo del Día</h3>
            <p className="text-xs text-[var(--foreground)]/70 leading-relaxed">
              El stock de <strong>Careta de Soldar Fotosensible</strong> está bajando rápidamente (4 unidades restantes). Te recomendamos emitir una solicitud de reposición al proveedor Arc & Safety S.A. antes del fin de semana para evitar quiebres de stock.
            </p>
          </div>
          <button 
            onClick={() => {
              const product = products.find((p) => p.id === "2");
              if (product) openReplenishmentModal(product);
            }}
            className="w-full bg-[var(--primary)] text-zinc-950 font-bold py-2 rounded-lg text-xs mt-6 hover:brightness-95 hover:scale-[1.01] transition-all cursor-pointer"
          >
            Pedir reposición
          </button>
        </div>
      </div>
    </div>
  );
}
