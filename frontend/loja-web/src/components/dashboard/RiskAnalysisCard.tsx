import { useState } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOTAL = 24;

type RiskLevel = 'low' | 'medium' | 'high';

interface RiskItem {
  label: string;
  sublabel: string;
  value: number;
  level: RiskLevel;
}

const riskItems: RiskItem[] = [
  {
    label: 'Baixo risco',
    sublabel: 'Pedidos aprovados sem restrição',
    value: 18,
    level: 'low',
  },
  {
    label: 'Médio risco',
    sublabel: 'Requerem atenção manual',
    value: 4,
    level: 'medium',
  },
  {
    label: 'Alto risco',
    sublabel: 'Possível fraude ou inconsistência',
    value: 2,
    level: 'high',
  },
];

// ─── Purple-only style map ────────────────────────────────────────────────────

interface RiskStyle {
  barGradient: string;
  valueClass: string;
  dotClass: string;
  pillClass: string;
  arcColor: string;
  arcTrack: string;
}

const riskStyles: Record<RiskLevel, RiskStyle> = {
  low: {
    barGradient: 'linear-gradient(to right, #a100ff, #7c3aed)',
    valueClass: 'text-[#d8b4fe]',
    dotClass: 'bg-[#a100ff]',
    pillClass: 'bg-[#a100ff]/10 text-[#d8b4fe] border-[#a100ff]/20',
    arcColor: '#a100ff',
    arcTrack: '#1e1533',
  },
  medium: {
    barGradient:
      'linear-gradient(to right, rgba(124,58,237,0.65), rgba(91,33,182,0.65))',
    valueClass: 'text-[#c4b5fd]',
    dotClass: 'bg-[#7c3aed]',
    pillClass: 'bg-[#7c3aed]/10 text-[#c4b5fd] border-[#7c3aed]/20',
    arcColor: '#7c3aed',
    arcTrack: '#1a153d',
  },
  high: {
    barGradient:
      'linear-gradient(to right, rgba(91,33,182,0.45), rgba(88,28,135,0.45))',
    valueClass: 'text-[#a78bfa]',
    dotClass: 'bg-[#5b21b6]',
    pillClass: 'bg-[#5b21b6]/10 text-[#a78bfa] border-[#5b21b6]/20',
    arcColor: '#5b21b6',
    arcTrack: '#160f2e',
  },
};

// ─── Mini SVG arc ─────────────────────────────────────────────────────────────

const R = 15;
const CIRC = 2 * Math.PI * R;

function ArcRing({
  pct,
  color,
  track,
}: {
  pct: number;
  color: string;
  track: string;
}) {
  const filled = (pct / 100) * CIRC;

  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      className="shrink-0 -rotate-90"
    >
      <circle
        cx="19"
        cy="19"
        r={R}
        fill="none"
        stroke={track}
        strokeWidth="3.5"
      />

      <circle
        cx="19"
        cy="19"
        r={R}
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${CIRC - filled}`}
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RiskAnalysisCard() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxVal = Math.max(...riskItems.map((risk) => risk.value));

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4 bg-[#0d0d0d]/80 backdrop-blur-sm">
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-0.5">
            Monitoramento de Segurança
          </p>

          <h2 className="text-base font-black text-white tracking-tight">
            Score de Risco
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-tighter text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a100ff] animate-pulse shadow-[0_0_8px_#a100ff]" />
            {TOTAL} analisados
          </span>

          <div className="w-10 h-10 rounded-2xl bg-[#a100ff]/10 border border-[#a100ff]/20 flex items-center justify-center text-[#a100ff] shrink-0 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Highlight banner */}
      <div className="mx-6 mt-5 mb-4 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4 relative overflow-hidden group/banner">
        <div className="absolute inset-0 bg-gradient-to-r from-[#a100ff]/5 to-transparent opacity-0 group-hover/banner:opacity-100 transition-opacity duration-500" />
        <div className="w-9 h-9 rounded-xl bg-[#a100ff]/10 border border-[#a100ff]/20 flex items-center justify-center shrink-0 relative z-10">
          <ShieldCheck className="w-4 h-4 text-[#d8b4fe]" />
        </div>

        <div className="relative z-10">
          <p className="text-xs font-black text-white uppercase tracking-tight">
            Operação Blindada
          </p>

          <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-tighter opacity-70">
            Integridade de 92% nas transações recentes
          </p>
        </div>
      </div>

      {/* Stacked overview bar */}
      <div className="px-6 pb-4">
        <div className="relative h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden flex">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(riskItems[0].value / TOTAL) * 100}%`,
              background: 'linear-gradient(to right, #a100ff, #7c3aed)',
            }}
          />

          <div
            className="h-full rounded-full transition-all duration-700 ml-0.5"
            style={{
              width: `${(riskItems[1].value / TOTAL) * 100}%`,
              background: 'rgba(124,58,237,0.6)',
            }}
          />

          <div
            className="h-full rounded-full transition-all duration-700 ml-0.5"
            style={{
              width: `${(riskItems[2].value / TOTAL) * 100}%`,
              background: 'rgba(91,33,182,0.4)',
            }}
          />
        </div>
      </div>

      {/* Risk rows */}
      <div className="px-4 pb-4 flex flex-col gap-1">
        {riskItems.map((item, index) => {
          const style = riskStyles[item.level];
          const pct = Math.round((item.value / TOTAL) * 100);
          const barPct = (item.value / maxVal) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-default transition-colors duration-200 border ${isHovered
                  ? 'bg-[#a100ff]/[0.04] border-[#a100ff]/15'
                  : 'border-transparent'
                }`}
            >
              {/* Arc ring */}
              <ArcRing
                pct={pct}
                color={style.arcColor}
                track={style.arcTrack}
              />

              {/* Label + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <div className="min-w-0">
                    <span className="block text-sm font-medium text-white">
                      {item.label}
                    </span>

                    <span
                      className={`block text-[11px] text-slate-600 mt-0.5 transition-all duration-300 ${isHovered
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-60 translate-y-0'
                        }`}
                    >
                      {item.sublabel}
                    </span>
                  </div>

                  {/* Quantity + percentage */}
                  <div className="w-[72px] shrink-0 text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span
                        className={`text-lg font-bold leading-none ${style.valueClass}`}
                      >
                        {item.value}
                      </span>

                      <span className="text-[11px] text-slate-600">
                        ped.
                      </span>
                    </div>

                    <div className="h-5 mt-1 flex justify-end">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 ease-out ${isHovered
                            ? `opacity-100 translate-y-0 scale-100 ${style.pillClass}`
                            : 'opacity-0 translate-y-1 scale-95 border-transparent bg-transparent text-transparent'
                          }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bar track */}
                <div className="h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${barPct}%`,
                      background: style.barGradient,
                    }}
                  />

                  {barPct > 4 && (
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${style.dotClass} border border-[#0b0b0b] shadow-sm transition-all duration-700`}
                      style={{ left: `calc(${barPct}% - 4px)` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto px-6 py-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-2 mb-1.5">
           <AlertCircle className="w-3 h-3 text-[#a100ff]" />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Status Operacional
           </p>
        </div>
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter leading-relaxed">
          Protocolos de segurança ativos. A maioria dos pedidos apresenta baixo risco no sistema.
        </p>
      </div>
    </Card>
  );
}