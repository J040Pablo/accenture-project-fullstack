import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { pedidoService } from '../../services/pedidoService';
import type { Pedido } from '../../types/Pedido';

// ─── Types & Constants ────────────────────────────────────────────────────────

type PeriodoVenda = '1d' | '1w' | '1m' | '6m' | '1y';

type RevenuePoint = {
  label: string;
  value: number;
  orders: number;
};

type PedidoComCamposPossiveis = Pedido & {
  valorTotal?: number;
  valorFinal?: number;
  total?: number;
  totalFinal?: number;
  dataCriacao?: string;
  dataPedido?: string;
  dataAtualizacao?: string;
  criadoEm?: string;
};

const TIME_FILTERS: PeriodoVenda[] = ['1d', '1w', '1m', '6m', '1y'];

const VIEW_W = 720;
const VIEW_H = 260;
const PAD = { top: 20, right: 20, bottom: 34, left: 52 };
const CHART_W = VIEW_W - PAD.left - PAD.right;
const CHART_H = VIEW_H - PAD.top - PAD.bottom;
const MIN_VAL = 0;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

function isPedidoPago(status?: string): boolean {
  return status?.toUpperCase() === 'PAGO';
}

function getValorPedido(pedido: PedidoComCamposPossiveis): number {
  return Number(
    pedido.totalFinal ??
    pedido.valorTotal ??
    pedido.valorFinal ??
    pedido.total ??
    0
  );
}

function getDataPedido(pedido: PedidoComCamposPossiveis): Date | null {
  const rawDate =
    pedido.dataCriacao ??
    pedido.dataPedido ??
    pedido.dataAtualizacao ??
    pedido.criadoEm;

  if (!rawDate) return null;

  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function getRange(periodo: PeriodoVenda, referenceDate = new Date()) {
  const end = new Date(referenceDate);

  if (periodo === '1d') {
    const dayStart = startOfDay(referenceDate);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    return {
      start: dayStart,
      end: dayEnd,
      previousStart: addDays(dayStart, -1),
      previousEnd: addDays(dayEnd, -1),
    };
  }

  if (periodo === '1w') {
    const currentEnd = new Date(end);
    const currentStart = addDays(startOfDay(currentEnd), -6);

    const previousEnd = addDays(currentStart, -1);
    previousEnd.setHours(23, 59, 59, 999);

    const previousStart = addDays(startOfDay(previousEnd), -6);

    return {
      start: currentStart,
      end: currentEnd,
      previousStart,
      previousEnd,
    };
  }

  if (periodo === '1m') {
    const currentEnd = new Date(end);
    const currentStart = addDays(startOfDay(currentEnd), -29);

    const previousEnd = addDays(currentStart, -1);
    previousEnd.setHours(23, 59, 59, 999);

    const previousStart = addDays(startOfDay(previousEnd), -29);

    return {
      start: currentStart,
      end: currentEnd,
      previousStart,
      previousEnd,
    };
  }

  if (periodo === '6m') {
    const currentEnd = new Date(end);
    const currentStart = addMonths(startOfDay(currentEnd), -6);

    const previousEnd = addDays(currentStart, -1);
    previousEnd.setHours(23, 59, 59, 999);

    const previousStart = addMonths(startOfDay(previousEnd), -6);

    return {
      start: currentStart,
      end: currentEnd,
      previousStart,
      previousEnd,
    };
  }

  const currentEnd = new Date(end);
  const currentStart = addMonths(startOfDay(currentEnd), -12);

  const previousEnd = addDays(currentStart, -1);
  previousEnd.setHours(23, 59, 59, 999);

  const previousStart = addMonths(startOfDay(previousEnd), -12);

  return {
    start: currentStart,
    end: currentEnd,
    previousStart,
    previousEnd,
  };
}

function isBetween(date: Date | null, start: Date, end: Date): boolean {
  if (!date) return false;
  return date >= start && date <= end;
}

function calcularVariacaoPercentual(atual: number, anterior: number): number | null {
  if (anterior === 0) {
    return atual > 0 ? 100 : null;
  }

  return ((atual - anterior) / anterior) * 100;
}

function getMesLabel(date: Date): string {
  const meses = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  return `${meses[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;
}

function getBucketInfo(date: Date, periodo: PeriodoVenda): { key: string; label: string } {
  if (periodo === '1d') {
    const hora = date.getHours();
    return {
      key: String(hora).padStart(2, '0'),
      label: `${hora}h`,
    };
  }

  if (periodo === '1w') {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return {
      key: startOfDay(date).getTime().toString(),
      label: dias[date.getDay()],
    };
  }

  if (periodo === '1m') {
    return {
      key: startOfDay(date).getTime().toString(),
      label: String(date.getDate()),
    };
  }

  return {
    key: `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`,
    label: getMesLabel(date),
  };
}

function gerarRevenueData(pedidos: PedidoComCamposPossiveis[], periodo: PeriodoVenda): RevenuePoint[] {
  const { start, end } = getRange(periodo);
  const map = new Map<string, RevenuePoint>();

  pedidos
    .filter((pedido) => isPedidoPago(pedido.status))
    .forEach((pedido) => {
      const data = getDataPedido(pedido);

      if (!isBetween(data, start, end) || !data) {
        return;
      }

      const { key, label } = getBucketInfo(data, periodo);

      if (!map.has(key)) {
        map.set(key, {
          label,
          value: 0,
          orders: 0,
        });
      }

      const bucket = map.get(key);

      if (!bucket) {
        return;
      }

      bucket.value += getValorPedido(pedido);
      bucket.orders += 1;
    });

  return Array.from(map.entries())
    .sort(([keyA], [keyB]) => {
      const numberA = Number(keyA);
      const numberB = Number(keyB);

      if (!Number.isNaN(numberA) && !Number.isNaN(numberB)) {
        return numberA - numberB;
      }

      return keyA.localeCompare(keyB);
    })
    .map(([, value]) => value);
}

/** Cardinal spline: smooth bezier through all points */
const createSmoothPath = (pts: { x: number; y: number }[]): string => {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;

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
  const [activeFilter, setActiveFilter] = useState<PeriodoVenda>('1w');
  const [pedidos, setPedidos] = useState<PedidoComCamposPossiveis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPedidos() {
      setLoading(true);
      setError(null);

      try {
        const data = await pedidoService.listar();

        if (mounted) {
          setPedidos((data ?? []) as PedidoComCamposPossiveis[]);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar performance de vendas';

        if (mounted) {
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPedidos();

    return () => {
      mounted = false;
    };
  }, []);

  const { start, end, previousStart, previousEnd } = useMemo(
    () => getRange(activeFilter),
    [activeFilter]
  );

  const pedidosPagos = useMemo(
    () => pedidos.filter((pedido) => isPedidoPago(pedido.status)),
    [pedidos]
  );

  const pedidosAtuais = useMemo(
    () =>
      pedidosPagos.filter((pedido) =>
        isBetween(getDataPedido(pedido), start, end)
      ),
    [pedidosPagos, start, end]
  );

  const pedidosAnteriores = useMemo(
    () =>
      pedidosPagos.filter((pedido) =>
        isBetween(getDataPedido(pedido), previousStart, previousEnd)
      ),
    [pedidosPagos, previousStart, previousEnd]
  );

  const totalVendasAtuais = useMemo(
    () => pedidosAtuais.reduce((total, pedido) => total + getValorPedido(pedido), 0),
    [pedidosAtuais]
  );

  const totalVendasAnteriores = useMemo(
    () => pedidosAnteriores.reduce((total, pedido) => total + getValorPedido(pedido), 0),
    [pedidosAnteriores]
  );

  const variacao = useMemo(
    () => calcularVariacaoPercentual(totalVendasAtuais, totalVendasAnteriores),
    [totalVendasAtuais, totalVendasAnteriores]
  );

  const revenueData = useMemo(() => {
    const data = gerarRevenueData(pedidos, activeFilter);

    if (data.length === 1) {
      return [{ label: '', value: 0, orders: 0 }, ...data];
    }

    return data;
  }, [pedidos, activeFilter]);

  const maxVal = Math.max(...revenueData.map((item) => item.value), 100);
  const yTicks = Array.from({ length: 6 }, (_, index) => (maxVal / 5) * index);

  const getX = (index: number): number => {
    if (revenueData.length <= 1) return PAD.left + CHART_W / 2;
    return PAD.left + (index / (revenueData.length - 1)) * CHART_W;
  };

  const getY = (value: number): number => {
    if (maxVal === MIN_VAL) return PAD.top + CHART_H / 2;
    return PAD.top + CHART_H - ((value - MIN_VAL) / (maxVal - MIN_VAL)) * CHART_H;
  };

  const points = revenueData.map((item, index) => ({
    x: getX(index),
    y: getY(item.value),
  }));

  const linePath = createSmoothPath(points);

  const areaPath =
    revenueData.length > 0
      ? [
        linePath,
        `L ${(PAD.left + CHART_W).toFixed(2)},${(PAD.top + CHART_H).toFixed(2)}`,
        `L ${PAD.left.toFixed(2)},${(PAD.top + CHART_H).toFixed(2)}`,
        'Z',
      ].join(' ')
      : '';

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;
  const activeItem = hoveredIndex !== null ? revenueData[hoveredIndex] : null;

  const isVisible = hoveredIndex !== null;

  const activeXPct = activePoint ? (activePoint.x / VIEW_W) * 100 : 0;
  const activeYPct = activePoint ? (activePoint.y / VIEW_H) * 100 : 0;
  const chartTopPct = (PAD.top / VIEW_H) * 100;
  const chartHeightPct = (CHART_H / VIEW_H) * 100;

  const tooltipOnLeft = hoveredIndex !== null && hoveredIndex > revenueData.length / 2;

  const hoverZones = revenueData.map((_, index) => {
    const startX =
      index > 0 ? (getX(index - 1) + getX(index)) / 2 : PAD.left;

    const endX =
      index < revenueData.length - 1
        ? (getX(index) + getX(index + 1)) / 2
        : PAD.left + CHART_W;

    return {
      startX,
      width: Math.max(0, endX - startX),
    };
  });

  if (loading) {
    return (
      <Card className="overflow-hidden transition-all duration-300 min-h-[360px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 text-[#a100ff] animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest">
            Carregando performance de vendas...
          </p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden transition-all duration-300 min-h-[360px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <AlertCircle className="w-7 h-7 text-rose-400" />
          <p className="text-sm font-bold text-rose-200">
            Não foi possível carregar a performance de vendas.
          </p>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transition-all duration-300">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-[#0d0d0d]/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#a100ff]/10 border border-[#a100ff]/20 flex items-center justify-center text-[#a100ff] shadow-inner">
            <TrendingUp className="w-5 h-5" />
          </div>

          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              Performance de Vendas
            </p>

            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-white tracking-tight">
                {formatCurrency(totalVendasAtuais)}
              </span>

              {variacao !== null ? (
                <span
                  className={`text-[10px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${variacao > 0
                    ? 'text-[#a1ffdb] bg-[#a1ffdb]/10'
                    : variacao < 0
                      ? 'text-rose-400 bg-rose-400/10'
                      : 'text-slate-400 bg-slate-400/10'
                    }`}
                >
                  {variacao > 0 ? '+' : ''}
                  {variacao.toFixed(1)}%
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter bg-slate-500/10 px-1.5 py-0.5 rounded-md">
                  Sem comparação
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-500 font-medium mt-1">
              {pedidosAtuais.length > 0
                ? `${pedidosAtuais.length} pedido${pedidosAtuais.length !== 1 ? 's' : ''} pago${pedidosAtuais.length !== 1 ? 's' : ''} no período`
                : 'Nenhuma venda paga no período'}
            </p>
          </div>
        </div>

        {/* Time filter buttons */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/5 rounded-2xl p-1 shadow-inner">
          {TIME_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setHoveredIndex(null);
              }}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${activeFilter === filter
                ? 'bg-[#a100ff] text-white shadow-[0_0_15px_-5px_#a100ff]'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ── SVG Chart Area ─────────────────────────────────────────────────── */}
      <div className="relative min-h-[260px]" onMouseLeave={() => setHoveredIndex(null)}>
        {revenueData.length > 0 ? (
          <>
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
              {yTicks.map((tick, index) => {
                const y = getY(tick);

                return (
                  <g key={`yt-${index}`}>
                    <line
                      x1={PAD.left}
                      y1={y}
                      x2={PAD.left + CHART_W}
                      y2={y}
                      stroke="#1e1e1e"
                      strokeWidth="1"
                    />
                    <text
                      x={PAD.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#374151"
                    >
                      {tick === 0
                        ? '0'
                        : tick >= 1000
                          ? `${(tick / 1000).toFixed(1).replace('.0', '')}k`
                          : Math.round(tick)}
                    </text>
                  </g>
                );
              })}

              {/* Vertical grid lines */}
              {revenueData.map((_, index) => (
                <line
                  key={`vg-${index}`}
                  x1={getX(index)}
                  y1={PAD.top}
                  x2={getX(index)}
                  y2={PAD.top + CHART_H}
                  stroke="#161616"
                  strokeWidth="1"
                />
              ))}

              {/* Paths */}
              <path d={areaPath} fill="url(#revGradient)" clipPath="url(#chartClip)" />
              <path
                d={linePath}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                clipPath="url(#chartClip)"
              />

              {/* X-axis labels */}
              {revenueData.map((item, index) => {
                if (!item.label) return null;

                if (revenueData.length > 15 && index % 2 !== 0 && hoveredIndex !== index) {
                  return null;
                }

                return (
                  <text
                    key={`xl-${item.label}-${index}`}
                    x={getX(index)}
                    y={PAD.top + CHART_H + 22}
                    textAnchor="middle"
                    fontSize="11"
                    fill={hoveredIndex === index ? '#a78bfa' : '#4b5563'}
                    fontWeight={hoveredIndex === index ? '700' : '400'}
                    className="transition-all duration-300"
                  >
                    {item.label}
                  </text>
                );
              })}

              {/* Hover zones */}
              {hoverZones.map((zone, index) => (
                <rect
                  key={`hz-${index}`}
                  x={zone.startX}
                  y={0}
                  width={zone.width}
                  height={VIEW_H}
                  fill="transparent"
                  className="cursor-default"
                  onMouseEnter={() => setHoveredIndex(index)}
                />
              ))}
            </svg>

            {/* Vertical Line */}
            {activePoint && activeItem?.label !== '' && (
              <div
                className={`pointer-events-none absolute w-px border-l border-dashed border-[#6d4aff]/70 transition-all duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                style={{
                  left: `${activeXPct}%`,
                  top: `${chartTopPct}%`,
                  height: `${chartHeightPct}%`,
                }}
              />
            )}

            {/* Point Marker */}
            {activePoint && activeItem?.label !== '' && (
              <div
                className={`pointer-events-none absolute z-10 transition-all duration-300 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
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
            {activePoint && activeItem && activeItem.label !== '' && (
              <div
                className={`absolute pointer-events-none z-20 transition-all duration-300 ease-out ${isVisible
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 translate-y-2'
                  }`}
                style={{
                  left: `${activeXPct}%`,
                  top: `${activeYPct}%`,
                  transform: `translate(${tooltipOnLeft ? 'calc(-100% - 14px)' : '14px'}, -50%)`,
                }}
              >
                <div className="glass border-white/10 rounded-2xl px-5 py-4 shadow-2xl min-w-[170px] glossy">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#a100ff] shrink-0 shadow-[0_0_8px_rgba(161,0,255,0.7)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {activeItem.label}
                    </span>
                  </div>

                  <p className="text-xl font-black text-white leading-tight tracking-tight">
                    {formatCurrency(activeItem.value)}
                  </p>

                  <div className="flex items-center gap-2 mt-2 opacity-60">
                    <Calendar className="w-3 h-3 text-[#a100ff]" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {activeItem.orders} pedido{activeItem.orders !== 1 ? 's' : ''} registrado{activeItem.orders !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-700 mb-4 shadow-inner">
              <TrendingUp className="w-6 h-6 opacity-50" />
            </div>

            <p className="text-sm font-bold text-slate-300 mb-1">
              Nenhum histórico
            </p>

            <p className="text-xs text-slate-500 max-w-[240px]">
              O gráfico será populado conforme pedidos pagos forem registrados no período selecionado.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}