import { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { pedidoService } from '../../services/pedidoService';
import { analiseRiscoService } from '../../services/analiseRiscoService';

// ─── Types and Mapping ────────────────────────────────────────────────────────

type UI_RiskLevel = 'low' | 'medium' | 'high';

interface RiskItem {
  label: string;
  sublabel: string;
  value: number;
  level: UI_RiskLevel;
}

type NivelRisco = "BAIXO" | "MEDIO" | "ALTO";

function normalizarNivelRisco(nivel?: string): NivelRisco {
  if (nivel === "BAIXO" || nivel === "MEDIO" || nivel === "ALTO") {
    return nivel as NivelRisco;
  }
  return "ALTO";
}

interface RiskDashboardMetrics {
  totalAnalises: number;
  scoreMedio: number;
  baixo: number;
  medio: number;
  alto: number;
}

// ─── Style map ────────────────────────────────────────────────────────────────

interface RiskStyle {
  barGradient: string;
  valueClass: string;
  dotClass: string;
  pillClass: string;
  arcColor: string;
  arcTrack: string;
}

const riskStyles: Record<UI_RiskLevel, RiskStyle> = {
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

function ArcRing({ pct, color, track }: { pct: number; color: string; track: string }) {
  const filled = (pct / 100) * CIRC;

  return (
    <svg width="38" height="38" viewBox="0 0 38 38" className="shrink-0 -rotate-90">
      <circle cx="19" cy="19" r={R} fill="none" stroke={track} strokeWidth="3.5" />
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
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<RiskDashboardMetrics>({
    totalAnalises: 0,
    scoreMedio: 0,
    baixo: 0,
    medio: 0,
    alto: 0
  });

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const pedidos = await pedidoService.listar();
        if (!pedidos || pedidos.length === 0) {
          if (mounted) {
            setMetrics({ totalAnalises: 0, scoreMedio: 0, baixo: 0, medio: 0, alto: 0 });
            setLoading(false);
          }
          return;
        }

        const analisesPromise = pedidos.map(async (pedido) => {
          try {
            return await analiseRiscoService.buscarPorPedido(pedido.idPedido);
          } catch (err: any) {
            if (err?.response?.status === 404 || err?.status === 404 || err?.message?.includes("404")) {
              return await analiseRiscoService.analisarPedido(pedido.idPedido);
            }
            // Tenta forçar analisar caso o backend tenha retornado algo estranho (como 500) que o usuário pediu GET
            try {
              return await analiseRiscoService.analisarPedido(pedido.idPedido);
            } catch {
               return null;
            }
          }
        });

        const results = await Promise.all(analisesPromise);
        const analises = results.filter(Boolean) as any[];

        if (mounted) {
          const totalAnalises = analises.length;
          const scoreMedio = totalAnalises > 0 
            ? Math.round(analises.reduce((acc, cur) => acc + (cur.score || 0), 0) / totalAnalises)
            : 0;

          const baixo = analises.filter(a => normalizarNivelRisco(a.nivelRisco) === "BAIXO").length;
          const medio = analises.filter(a => normalizarNivelRisco(a.nivelRisco) === "MEDIO").length;
          const alto = analises.filter(a => normalizarNivelRisco(a.nivelRisco) === "ALTO").length;

          setMetrics({
            totalAnalises,
            scoreMedio,
            baixo,
            medio,
            alto
          });
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Não foi possível carregar o score de risco.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Card className="overflow-hidden flex flex-col justify-center items-center min-h-[300px] bg-[#0d0d0d] border border-[#2a2a2a]">
        <Loader2 className="w-8 h-8 text-[#a100ff] animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Carregando score de risco...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden flex flex-col justify-center items-center min-h-[300px] bg-[#0d0d0d] gap-4 border border-[#2a2a2a]">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <p className="text-sm font-medium text-[#d6a2b0]">{error}</p>
      </Card>
    );
  }

  if (metrics.totalAnalises === 0) {
    return (
      <Card className="overflow-hidden flex flex-col justify-center items-center min-h-[300px] bg-[#0d0d0d] gap-4 border border-[#2a2a2a]">
        <ShieldCheck className="w-8 h-8 text-slate-600" />
        <p className="text-sm font-medium text-slate-400">Nenhum pedido disponível para análise.</p>
      </Card>
    );
  }

  const { totalAnalises, scoreMedio, baixo, medio, alto } = metrics;
  
  const riskItems: RiskItem[] = [
    { label: 'Baixo risco', sublabel: 'Pedidos aprovados sem restrição', value: baixo, level: 'low' },
    { label: 'Médio risco', sublabel: 'Requerem atenção manual', value: medio, level: 'medium' },
    { label: 'Alto risco', sublabel: 'Possível fraude ou inconsistência', value: alto, level: 'high' }
  ];

  const maxVal = Math.max(...riskItems.map((risk) => risk.value));
  const hasItems = totalAnalises > 0;

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
            {totalAnalises} analisados
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
          <div className="flex items-center gap-2">
            <p className="text-xs font-black text-white uppercase tracking-tight">
              Score Médio: {scoreMedio}
            </p>
          </div>
          <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-tighter opacity-70">
            Saúde da operação baseada nos scores
          </p>
        </div>
      </div>

      {/* Stacked overview bar */}
      {hasItems && (
        <div className="px-6 pb-4">
          <div className="relative h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden flex">
            {riskItems[0].value > 0 && (
               <div
                  className="h-full rounded-full transition-all duration-700 mr-0.5"
                  style={{
                    width: `${(riskItems[0].value / totalAnalises) * 100}%`,
                    background: 'linear-gradient(to right, #a100ff, #7c3aed)',
                  }}
                />
            )}
            {riskItems[1].value > 0 && (
              <div
                className="h-full rounded-full transition-all duration-700 mr-0.5"
                style={{
                  width: `${(riskItems[1].value / totalAnalises) * 100}%`,
                  background: 'rgba(124,58,237,0.6)',
                }}
              />
            )}
            {riskItems[2].value > 0 && (
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(riskItems[2].value / totalAnalises) * 100}%`,
                  background: 'rgba(91,33,182,0.4)',
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Risk rows */}
      <div className="px-4 pb-4 flex flex-col gap-1">
        {riskItems.map((item, index) => {
          const style = riskStyles[item.level];
          const pct = Math.round((item.value / (totalAnalises || 1)) * 100);
          const barPct = (item.value / (maxVal || 1)) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-default transition-colors duration-200 border ${
                isHovered
                  ? 'bg-[#a100ff]/[0.04] border-[#a100ff]/15'
                  : 'border-transparent'
              }`}
            >
              {/* Arc ring */}
              <ArcRing pct={pct} color={style.arcColor} track={style.arcTrack} />

              {/* Label + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <div className="min-w-0">
                    <span className="block text-sm font-medium text-white">
                      {item.label}
                    </span>

                    <span
                      className={`block text-[11px] text-slate-600 mt-0.5 transition-all duration-300 ${
                        isHovered ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-0'
                      }`}
                    >
                      {item.sublabel}
                    </span>
                  </div>

                  {/* Quantity + percentage */}
                  <div className="w-[72px] shrink-0 text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className={`text-lg font-bold leading-none ${style.valueClass}`}>
                        {item.value}
                      </span>
                      <span className="text-[11px] text-slate-600">
                        ped.
                      </span>
                    </div>

                    <div className="h-5 mt-1 flex justify-end">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 ease-out ${
                          isHovered
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
          Protocolos de segurança ativos. O score médio atual é {scoreMedio} num total de {totalAnalises} avaliações.
        </p>
      </div>
    </Card>
  );
}