import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Eye,
  Filter,
  ListChecks,
  Search,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils';
import type { AnaliseRiscoPedido, RiskLevel } from '../../types/AnaliseRisco';

// TODO: substituir por dados reais do endpoint de análise de risco quando integrado ao backend.
const pedidosRisco: AnaliseRiscoPedido[] = [
  {
    pedidoId: '1',
    numeroPedido: 'PED-1024',
    cliente: 'O nome',
    total: 'R$ 145,00',
    statusPedido: 'ABERTO',
    nivelRisco: 'BAIXO',
    score: 18,
    motivo: 'Cliente possui saldo suficiente e itens com estoque disponível.',
    recomendacao: 'Pedido apto para seguir para reserva.',
    fatores: ['Saldo suficiente', 'Estoque disponível'],
    dataAnalise: '09/05/2026',
  },
  {
    pedidoId: '2',
    numeroPedido: 'PED-1025',
    cliente: 'Maria Silva',
    total: 'R$ 890,00',
    statusPedido: 'RESERVADO',
    nivelRisco: 'MEDIO',
    score: 54,
    motivo: 'Pedido com valor acima da média e estoque próximo do limite.',
    recomendacao: 'Revisar estoque antes de confirmar pagamento.',
    fatores: ['Valor acima da média', 'Estoque próximo do limite'],
    dataAnalise: '09/05/2026',
  },
  {
    pedidoId: '3',
    numeroPedido: 'PED-1026',
    cliente: 'João Pedro',
    total: 'R$ 1.450,00',
    statusPedido: 'ABERTO',
    nivelRisco: 'ALTO',
    score: 86,
    motivo: 'Saldo insuficiente na conta do cliente e produto com estoque crítico.',
    recomendacao: 'Bloquear pagamento até regularização do saldo ou estoque.',
    fatores: ['Saldo insuficiente', 'Estoque crítico', 'Valor acima da média'],
    dataAnalise: '08/05/2026',
  },
];

const riskStyles: Record<RiskLevel, { label: string; badge: string; dot: string; text: string }> = {
  BAIXO: {
    label: 'Baixo risco',
    badge: 'bg-[#a100ff]/10 text-[#d8b4fe] border-[#a100ff]/20',
    dot: 'bg-[#a100ff]',
    text: 'text-[#d8b4fe]',
  },
  MEDIO: {
    label: 'Médio risco',
    badge: 'bg-[#7c3aed]/10 text-[#c4b5fd] border-[#7c3aed]/20',
    dot: 'bg-[#7c3aed]',
    text: 'text-[#c4b5fd]',
  },
  ALTO: {
    label: 'Alto risco',
    badge: 'bg-[#2a1118] text-[#d6a2b0] border-[#5a1f35]/40',
    dot: 'bg-[#8b5cf6]',
    text: 'text-[#d6a2b0]',
  },
};

const filterOptions: Array<{ label: string; value: 'TODOS' | RiskLevel }> = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Baixo', value: 'BAIXO' },
  { label: 'Médio', value: 'MEDIO' },
  { label: 'Alto', value: 'ALTO' },
];

function getAttentionLabel(score: number) {
  if (score >= 75) return 'Atenção crítica';
  if (score >= 50) return 'Atenção moderada';
  return 'Operação saudável';
}

export default function AnaliseRisco() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'TODOS' | RiskLevel>('TODOS');
  const [focusedPedidoId, setFocusedPedidoId] = useState(pedidosRisco[0]?.pedidoId ?? '');

  const totalAnalisados = pedidosRisco.length;
  const scoreMedio =
    totalAnalisados > 0
      ? Math.round(pedidosRisco.reduce((acc, pedido) => acc + pedido.score, 0) / totalAnalisados)
      : 0;
  const altoRisco = pedidosRisco.filter((pedido) => pedido.nivelRisco === 'ALTO').length;
  const revisaoNecessaria = pedidosRisco.filter((pedido) => pedido.score >= 50).length;

  const filteredPedidos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return pedidosRisco.filter((pedido) => {
      const matchesRisk = riskFilter === 'TODOS' || pedido.nivelRisco === riskFilter;
      const matchesSearch =
        term.length === 0 ||
        pedido.numeroPedido.toLowerCase().includes(term) ||
        pedido.cliente.toLowerCase().includes(term) ||
        pedido.statusPedido.toLowerCase().includes(term) ||
        pedido.motivo.toLowerCase().includes(term) ||
        pedido.recomendacao.toLowerCase().includes(term);

      return matchesRisk && matchesSearch;
    });
  }, [riskFilter, searchTerm]);

  const activeFilterIndex = filterOptions.findIndex((option) => option.value === riskFilter);

  const pedidosOrdenados = useMemo(
    () => [...filteredPedidos].sort((a, b) => b.score - a.score),
    [filteredPedidos]
  );

  const pedidosPorRisco = useMemo(
    () => ({
      BAIXO: filteredPedidos.filter((pedido) => pedido.nivelRisco === 'BAIXO'),
      MEDIO: filteredPedidos.filter((pedido) => pedido.nivelRisco === 'MEDIO'),
      ALTO: filteredPedidos.filter((pedido) => pedido.nivelRisco === 'ALTO'),
    }),
    [filteredPedidos]
  );

  const fatoresRecorrentes = useMemo(() => {
    const counts = new Map<string, number>();

    filteredPedidos.forEach((pedido) => {
      pedido.fatores.forEach((fator) => {
        counts.set(fator, (counts.get(fator) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([fator, total]) => ({ fator, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredPedidos]);

  const pedidoEmFoco =
    filteredPedidos.find((pedido) => pedido.pedidoId === focusedPedidoId) ??
    filteredPedidos[0] ??
    null;

  const insightOperacional = useMemo(() => {
    if (altoRisco > 0) {
      return `Existe ${altoRisco} pedido${altoRisco > 1 ? 's' : ''} de alto risco. Recomenda-se revisar saldo, estoque e status antes de avançar no fluxo financeiro.`;
    }

    if (revisaoNecessaria > 0) {
      return `Há ${revisaoNecessaria} pedido${revisaoNecessaria > 1 ? 's' : ''} que pedem revisão. A operação está sob controle, mas vale acompanhar os fatores de risco mais recorrentes.`;
    }

    return 'A operação está saudável. Os pedidos analisados não apresentam sinais críticos no momento.';
  }, [altoRisco, revisaoNecessaria]);

  const limparFiltros = () => {
    setSearchTerm('');
    setRiskFilter('TODOS');
  };

  return (
    <PageLayout>
      <PageHeader
        title="Análise de Risco"
        subtitle="Monitore pedidos com possíveis inconsistências operacionais"
        icon={<ShieldCheck className="w-5 h-5" />}
        action={
          <Button
            type="button"
            onClick={() => navigate('/pedidos')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#111111] border border-[#a100ff]/20 text-[#d8b4fe] hover:bg-[#161616] hover:border-[#a100ff]/40 hover:text-white transition-colors outline-none focus:outline-none focus:ring-0"
          >
            Voltar para pedidos
            <ArrowRight className="w-4 h-4" />
          </Button>
        }
      />

      <Card className="border-[#2a2a2a] bg-[#0b0b0b] p-6 overflow-hidden">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">
              Score geral da operação
            </p>
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-5xl font-black text-white tracking-tight">{scoreMedio}</span>
              <span className="text-sm font-bold text-slate-500 mb-2">/ 100</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-[#d8b4fe]">{getAttentionLabel(scoreMedio)}</p>
            <p className="mt-1 text-[11px] text-slate-500 uppercase tracking-widest">
              {totalAnalisados} pedidos analisados
            </p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 w-full xl:w-auto">
            {[
              { label: 'Pedidos analisados', value: totalAnalisados, icon: ListChecks },
              { label: 'Score médio', value: `${scoreMedio}`, icon: Activity },
              { label: 'Risco alto', value: altoRisco, icon: AlertTriangle },
              { label: 'Revisão necessária', value: revisaoNecessaria, icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">
                      {item.label}
                    </p>
                    <Icon className="w-4 h-4 text-[#a100ff]/60 shrink-0" />
                  </div>
                  <div className="mt-3 text-2xl font-black text-white tracking-tight">
                    {item.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="mt-6 rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] overflow-hidden">
        <div className="p-6 border-b border-[#1a1a1a] flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">
              Centro analítico
            </p>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Pedidos analisados
              <span className="w-1.5 h-1.5 rounded-full bg-[#a100ff] animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Matriz de risco, ranking de prioridade e pedido em foco
            </p>
          </div>

          {(searchTerm || riskFilter !== 'TODOS') && (
            <button
              type="button"
              onClick={limparFiltros}
              className="text-xs text-slate-400 hover:text-white transition-colors self-start xl:self-auto"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por pedido, cliente, status, motivo ou recomendação"
                className="w-full h-11 rounded-xl bg-[#111111] border border-[#2a2a2a] pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:outline-none focus:ring-0 focus:border-[#a100ff] transition-colors duration-200"
              />
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-2">
              <div className="relative grid grid-cols-4 gap-1">
                <div
                  className="pointer-events-none absolute top-0 bottom-0 left-0 rounded-xl bg-[#a100ff] shadow-[0_0_18px_rgba(161,0,255,0.28)] transition-transform duration-300 ease-out"
                  style={{
                    width: `${100 / filterOptions.length}%`,
                    transform: `translateX(${activeFilterIndex * 100}%)`,
                  }}
                />

                {filterOptions.map((option) => {
                  const isActive = riskFilter === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRiskFilter(option.value)}
                      className={cn(
                        'relative z-10 h-10 w-full rounded-xl px-3 text-[11px] font-bold tracking-[0.16em] transition-colors duration-300',
                        isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-5">
            <div className="space-y-5">
              <Card className="border-[#2a2a2a] bg-[#111111] p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Matriz de risco</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Pedidos agrupados por nível de risco</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-[#a100ff]" />
                    Foco inteligente
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(['BAIXO', 'MEDIO', 'ALTO'] as RiskLevel[]).map((nivel) => {
                    const items = pedidosPorRisco[nivel];
                    const meta = riskStyles[nivel];

                    return (
                      <div key={nivel} className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <span className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-tighter', meta.badge)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', meta.dot)} />
                            {meta.label}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            {items.length} pedidos
                          </span>
                        </div>

                        <div className="space-y-2">
                          {items.length > 0 ? (
                            items.map((pedido) => (
                              <button
                                key={pedido.pedidoId}
                                type="button"
                                onClick={() => setFocusedPedidoId(pedido.pedidoId)}
                                className="w-full text-left rounded-xl border border-[#2a2a2a] bg-[#151515] px-3 py-3 hover:border-[#a100ff]/30 hover:bg-[#161616] transition-colors"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-sm font-black text-white tracking-tight">{pedido.numeroPedido}</div>
                                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">{pedido.cliente}</div>
                                  </div>
                                  <div className={cn('text-[10px] font-bold uppercase tracking-widest', meta.text)}>
                                    Score {pedido.score}
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#111111] px-3 py-6 text-center text-[11px] text-slate-500">
                              Nenhum pedido nesta faixa
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="border-[#2a2a2a] bg-[#111111] p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Ranking de prioridade</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Pedidos ordenados por score de risco</p>
                  </div>
                  <ListChecks className="w-4 h-4 text-[#a100ff]" />
                </div>

                <div className="space-y-2">
                  {pedidosOrdenados.map((pedido, index) => {
                    const meta = riskStyles[pedido.nivelRisco];
                    const isFocused = pedido.pedidoId === pedidoEmFoco?.pedidoId;

                    return (
                      <button
                        key={pedido.pedidoId}
                        type="button"
                        onClick={() => setFocusedPedidoId(pedido.pedidoId)}
                        className={cn(
                          'w-full rounded-2xl border px-4 py-3 text-left transition-colors',
                          isFocused
                            ? 'border-[#a100ff]/30 bg-[#151515]'
                            : 'border-[#2a2a2a] bg-[#0f0f0f] hover:border-[#a100ff]/20 hover:bg-[#111111]'
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">#{index + 1}</div>
                            <div className="text-sm font-black text-white tracking-tight truncate">{pedido.numeroPedido}</div>
                            <div className="text-[11px] text-slate-500 truncate">{pedido.cliente}</div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className={cn('text-sm font-black tracking-tight', meta.text)}>
                              Score {pedido.score}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                              {meta.label}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="border-[#2a2a2a] bg-[#111111] p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Pedido em foco</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Clique na matriz ou ranking para mudar o foco</p>
                  </div>
                  <Eye className="w-4 h-4 text-[#a100ff]" />
                </div>

                {pedidoEmFoco ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-lg font-black text-white tracking-tight">{pedidoEmFoco.numeroPedido}</h4>
                      <span className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tighter', riskStyles[pedidoEmFoco.nivelRisco].badge)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', riskStyles[pedidoEmFoco.nivelRisco].dot)} />
                        {riskStyles[pedidoEmFoco.nivelRisco].label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4">
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <User className="w-3 h-3" />
                          Cliente
                        </div>
                        <div className="font-semibold text-white">{pedidoEmFoco.cliente}</div>
                      </div>
                      <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4">
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Score</div>
                        <div className="font-black text-white">{pedidoEmFoco.score} / 100</div>
                      </div>
                      <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4">
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Total</div>
                        <div className="font-semibold text-white">{pedidoEmFoco.total}</div>
                      </div>
                      <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4">
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Status</div>
                        <div className="font-semibold text-white">{pedidoEmFoco.statusPedido}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Motivo</p>
                        <p className="text-sm text-slate-300 leading-relaxed">{pedidoEmFoco.motivo}</p>
                      </div>
                      <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Recomendação</p>
                        <p className="text-sm text-slate-300 leading-relaxed">{pedidoEmFoco.recomendacao}</p>
                      </div>
                      <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-4">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Fatores</p>
                        <div className="flex flex-wrap gap-2">
                          {pedidoEmFoco.fatores.map((fator) => (
                            <span key={fator} className="inline-flex items-center px-2.5 py-1 rounded-full border border-[#2a2a2a] bg-[#151515] text-[10px] text-slate-400">
                              {fator}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => navigate('/pedidos')}
                      className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#111111] border border-[#a100ff]/20 text-[#d8b4fe] hover:bg-[#161616] hover:border-[#a100ff]/40 hover:text-white transition-colors outline-none focus:outline-none focus:ring-0"
                    >
                      <Eye className="w-4 h-4" />
                      Abrir em Pedidos
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] p-8 text-center text-sm text-slate-500">
                    Nenhum pedido em foco.
                  </div>
                )}
              </Card>

              <Card className="border-[#2a2a2a] bg-[#111111] p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Fatores mais recorrentes</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Sinais que mais aparecem na operação</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#a100ff]" />
                </div>

                <div className="space-y-2">
                  {fatoresRecorrentes.length > 0 ? (
                    fatoresRecorrentes.map((item) => (
                      <div key={item.fator} className="flex items-center justify-between gap-4 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3">
                        <span className="text-sm text-slate-300">{item.fator}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {item.total} ocorrências
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] px-4 py-6 text-center text-[11px] text-slate-500">
                      Sem fatores para exibir.
                    </div>
                  )}
                </div>
              </Card>

              <Card className="border-[#2a2a2a] bg-[#111111] p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Insight operacional</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Leitura rápida da operação</p>
                  </div>
                  <Activity className="w-4 h-4 text-[#a100ff]" />
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{insightOperacional}</p>
              </Card>
            </div>
          </div>

          {filteredPedidos.length === 0 && (
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-slate-600 mb-4">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Nenhum pedido encontrado</h3>
              <p className="text-slate-500 text-sm">Tente ajustar a busca ou o filtro de risco.</p>
              <Button
                type="button"
                onClick={limparFiltros}
                className="mt-6 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#111111] border border-[#a100ff]/20 text-[#d8b4fe] hover:bg-[#161616] hover:border-[#a100ff]/40 hover:text-white transition-colors outline-none focus:outline-none focus:ring-0"
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
