import { useState } from 'react';

// ─── Data & Constants ─────────────────────────────────────────────────────────

const revenueData = [
  { label: 'Seg', value: 2800, orders: 6 },
  { label: 'Ter', value: 3500, orders: 8 },
  { label: 'Qua', value: 1900, orders: 4 },
  { label: 'Qui', value: 4200, orders: 9 },
  { label: 'Sex', value: 3100, orders: 7 },
  { label: 'Sáb', value: 1500, orders: 3 },
  { label: 'Dom', value: 4600, orders: 10 },
];

const TIME_FILTERS = ['1d', '1w', '1m', '6m', '1y'];
const Y_TICKS = [0, 1000, 2000, 3000, 4000, 5000];

const VIEW_W = 720;
const VIEW_H = 260;
const PAD = { top: 20, right: 20, bottom: 34, left: 52 };
const CHART_W = VIEW_W - PAD.left - PAD.right;
const CHART_H = VIEW_H - PAD.top - PAD.bottom;
const MIN_VAL = 0;
const MAX_VAL = 5000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getX = (index: number): number =>
  PAD.left + (index / (revenueData.length - 1)) * CHART_W;

const getY = (value: number): number =>
  PAD.top + CHART_H - ((value - MIN_VAL) / (MAX_VAL - MIN_VAL)) * CHART_H;

/** Cardinal spline: smooth bezier through all points */
const createSmoothPath = (pts: { x: number; y: number }[]): string => {
  if (pts.length < 2) return '';
  const d: string[] = [`M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(
      `C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`
    );
  }
  return d.join(' ');
};

// ─── Component ────────────────────────────────────────────────────────────────

export function RevenueChartCard() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('1w');

  // Compute SVG points
  const points = revenueData.map((_, i) => ({ x: getX(i), y: getY(_.value) }));
  const linePath = createSmoothPath(points);

  // Close into an area shape
  const areaPath = [
    linePath,
    `L ${(PAD.left + CHART_W).toFixed(2)},${(PAD.top + CHART_H).toFixed(2)}`,
    `L ${PAD.left.toFixed(2)},${(PAD.top + CHART_H).toFixed(2)}`,
    'Z',
  ].join(' ');

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;
  const activeItem = hoveredIndex !== null ? revenueData[hoveredIndex] : null;

  const isVisible = hoveredIndex !== null;

  // Percentage-based coordinates for HTML overlays
  const activeXPct = activePoint ? (activePoint.x / VIEW_W) * 100 : 0;
  const activeYPct = activePoint ? (activePoint.y / VIEW_H) * 100 : 0;
  const chartTopPct = (PAD.top / VIEW_H) * 100;
  const chartHeightPct = (CHART_H / VIEW_H) * 100;

  // tooltip left/right flip
  const tooltipOnLeft = hoveredIndex !== null && hoveredIndex > revenueData.length / 2;

  // Contiguous hover zones
  const hoverZones = revenueData.map((_, i) => {
    const startX = i > 0 ? (getX(i - 1) + getX(i)) / 2 : PAD.left;
    const endX = i < revenueData.length - 1 ? (getX(i) + getX(i + 1)) / 2 : PAD.left + CHART_W;
    return { startX, width: endX - startX };
  });

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] overflow-hidden transition-all duration-300 hover:border-[#3a3a3a]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-[#1f1f1f] flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-500 mb-0.5 uppercase tracking-wide font-medium">
            Receita dos pedidos pagos
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm text-slate-400">Faturamento da Semana:</span>
            <span className="text-2xl font-bold text-white tracking-tight">R$ 8.940,00</span>
          </div>
        </div>

        {/* Time filter buttons */}
        <div className="flex items-center gap-0.5 bg-[#131313] border border-[#2a2a2a] rounded-xl p-1">
          {TIME_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeFilter === f
                  ? 'bg-[#222222] border border-[#3a3a3a] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── SVG Chart Area ─────────────────────────────────────────────────── */}
      <div className="relative" onMouseLeave={() => setHoveredIndex(null)}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full block cursor-default"
        >
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.45" />
              <stop offset="75%" stopColor="#7c3aed" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
            <clipPath id="chartClip">
              <rect x={PAD.left} y={PAD.top} width={CHART_W} height={CHART_H} />
            </clipPath>
          </defs>

          {/* Grid lines */}
          {Y_TICKS.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line x1={PAD.left} y1={y} x2={PAD.left + CHART_W} y2={y} stroke="#1e1e1e" strokeWidth="1" />
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#374151">
                  {tick === 0 ? '0' : `${tick / 1000}k`}
                </text>
              </g>
            );
          })}

          {/* Vertical grid lines */}
          {revenueData.map((_, i) => (
            <line key={`vg-${i}`} x1={getX(i)} y1={PAD.top} x2={getX(i)} y2={PAD.top + CHART_H} stroke="#161616" strokeWidth="1" />
          ))}

          {/* Paths */}
          <path d={areaPath} fill="url(#revGradient)" clipPath="url(#chartClip)" />
          <path d={linePath} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#chartClip)" />

          {/* X-axis labels */}
          {revenueData.map((d, i) => (
            <text
              key={`xl-${d.label}`}
              x={getX(i)}
              y={PAD.top + CHART_H + 22}
              textAnchor="middle"
              fontSize="11"
              fill={hoveredIndex === i ? '#a78bfa' : '#4b5563'}
              fontWeight={hoveredIndex === i ? '700' : '400'}
              className="transition-all duration-300"
            >
              {d.label}
            </text>
          ))}

          {/* Hover zones */}
          {hoverZones.map((zone, i) => (
            <rect
              key={`hz-${i}`}
              x={zone.startX}
              y={0}
              width={zone.width}
              height={VIEW_H}
              fill="transparent"
              className="cursor-default"
              onMouseEnter={() => setHoveredIndex(i)}
            />
          ))}
        </svg>

        {/* ── Animated HTML Overlays (Smoother than SVG transitions) ────────── */}

        {/* Vertical Line */}
        {activePoint && (
          <div
            className={`pointer-events-none absolute w-px border-l border-dashed border-[#6d4aff]/70 transition-all duration-300 ease-out ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              left: `${activeXPct}%`,
              top: `${chartTopPct}%`,
              height: `${chartHeightPct}%`,
            }}
          />
        )}

        {/* Point Marker */}
        {activePoint && (
          <div
            className={`pointer-events-none absolute z-10 transition-all duration-300 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{
              left: `${activeXPct}%`,
              top: `${activeYPct}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <div className="absolute w-5 h-5 rounded-full bg-[#7c3aed]/15 animate-ping" />
              <div className="absolute w-5 h-5 rounded-full bg-[#7c3aed]/20" />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#a100ff] shadow-[0_0_10px_rgba(161,0,255,0.8)]" />
              <div className="absolute w-1 h-1 rounded-full bg-white" />
            </div>
          </div>
        )}

        {/* Tooltip */}
        {activePoint && activeItem && (
          <div
            className={`absolute pointer-events-none z-20 transition-all duration-300 ease-out ${
              isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
            }`}
            style={{
              left: `${activeXPct}%`,
              top: `${activeYPct}%`,
              transform: `translate(${tooltipOnLeft ? 'calc(-100% - 14px)' : '14px'}, -50%)`,
            }}
          >
            <div className="bg-[#111111]/95 backdrop-blur-md border border-[#2a2a2a] rounded-xl px-4 py-3 shadow-2xl min-w-[155px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#a100ff] shrink-0 shadow-[0_0_8px_rgba(161,0,255,0.7)]" />
                <span className="text-xs font-semibold text-slate-300">{activeItem.label}</span>
              </div>
              <p className="text-base font-bold text-white leading-tight">
                {formatCurrency(activeItem.value)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {activeItem.orders} pedidos pagos
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
