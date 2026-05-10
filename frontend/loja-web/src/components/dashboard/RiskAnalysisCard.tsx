import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

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
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-500 mb-0.5 uppercase tracking-wide font-medium">
            Resumo dos pedidos avaliados
          </p>

          <h2 className="text-base font-semibold text-white">
            Análise de Risco
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2a2a2a] bg-[#131313] text-[11px] text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a100ff]" />
            {TOTAL} pedidos
          </span>

          <div className="w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#131313] flex items-center justify-center text-[#a100ff] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Highlight banner */}
      <div className="mx-6 mt-5 mb-4 px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#a100ff]/5 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#a100ff]/10 border border-[#a100ff]/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#d8b4fe]" />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#d8b4fe]">
            Operação controlada
          </p>

          <p className="text-[11px] text-slate-500 mt-0.5">
            Baixo risco predominante nos pedidos
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
      <div className="mt-auto px-6 py-4 border-t border-[#1f1f1f]">
        <p className="text-xs text-slate-500 mb-0.5">
          A maioria dos pedidos apresenta{' '}
          <span className="text-[#d8b4fe] font-medium">
            baixo risco operacional
          </span>
          .
        </p>

        <p className="text-[11px] text-slate-600">
          {TOTAL} pedidos analisados no período
        </p>
      </div>
    </div>
  );
}