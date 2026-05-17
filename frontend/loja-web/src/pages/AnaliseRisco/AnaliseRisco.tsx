import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { pedidoService } from '../../services/pedidoService';
import { analiseRiscoService } from '../../services/analiseRiscoService';

type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO';

interface AnaliseRisco {
  pedidoId: string;
  numeroPedido: string;
  statusPedido: string;
  nivelRisco: RiskLevel;
  score: number;
  motivos: string[];
  recomendacao: string;
  dataAnalise: string;
}

const riskStyles: Record<RiskLevel, { label: string; badge: string; dot: string }> = {
  BAIXO: {
    label: 'Baixo risco',
    badge: 'bg-[#a100ff]/10 text-[#d8b4fe] border-[#a100ff]/20',
    dot: 'bg-[#a100ff]',
  },
  MEDIO: {
    label: 'Médio risco',
    badge: 'bg-[#7c3aed]/10 text-[#c4b5fd] border-[#7c3aed]/20',
    dot: 'bg-[#7c3aed]',
  },
  ALTO: {
    label: 'Alto risco',
    badge: 'bg-[#2a1118] text-[#d6a2b0] border-[#5a1f35]/40',
    dot: 'bg-[#8b5cf6]',
  },
};

function melhorarRecomendacao(
  recomendacaoOriginal: string,
  motivos: string[] | undefined,
  valorTotal: number | undefined,
  nivelRisco: string | undefined
): string {
  if (!motivos || motivos.length === 0) {
    return recomendacaoOriginal;
  }

  const motivosLower = motivos.map(m => m.toLowerCase()).join(' ');

  if (motivosLower.includes('saldo') || motivosLower.includes('crédito')) {
    return 'Alto risco identificado. Verifique o saldo do cliente antes de reservar ou pagar o pedido.';
  }

  if (valorTotal && valorTotal > 10000) {
    return 'Pedido de alto valor. Recomenda-se validação manual e análise adicional antes de prosseguir com a operação.';
  }

  if (motivosLower.includes('criado') || motivosLower.includes('novo')) {
    return 'Pedido ainda não reservado. A próxima etapa operacional é reservar o estoque para garantir a disponibilidade.';
  }

  if (nivelRisco === 'ALTO') {
    return 'Nível de risco elevado identificado. Recomenda-se análise manual antes de prosseguir com a operação.';
  }

  return recomendacaoOriginal;
}

export default function AnaliseRiscoProposta() {
  const navigate = useNavigate();
  const [analises, setAnalises] = useState<AnaliseRisco[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const pedidos = await pedidoService.listar();
        const analisesPromises = pedidos.map(async (p: any) => {
          try {
            const resultado = await analiseRiscoService.analisarPedido(p.idPedido);
            return {
              pedidoId: String(p.idPedido),
              numeroPedido: `PED-${p.idPedido}`,
              statusPedido: p.status,
              nivelRisco: resultado.nivelRisco as RiskLevel,
              score: resultado.score ?? 0,
              motivos: resultado.motivos ?? [],
              recomendacao: resultado.recomendacao ?? 'Avaliar antes de prosseguir',
              dataAnalise: new Date(p.dataCriacao).toLocaleDateString('pt-BR'),
            };
          } catch {
            return null;
          }
        });

        const resultados = await Promise.all(analisesPromises);
        if (mounted) {
          setAnalises(resultados.filter((r) => r !== null) as AnaliseRisco[]);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Erro ao carregar análises de risco');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const countByRisk = useMemo(() => ({
    BAIXO: analises.filter((a) => a.nivelRisco === 'BAIXO').length,
    MEDIO: analises.filter((a) => a.nivelRisco === 'MEDIO').length,
    ALTO: analises.filter((a) => a.nivelRisco === 'ALTO').length,
  }), [analises]);

  const scoreMedio = analises.length > 0 ? Math.round(analises.reduce((s, a) => s + a.score, 0) / analises.length) : 0;

  if (loading) {
    return (
      <PageLayout>
        <PageHeader title="Análise de Risco" subtitle="Carregando..." icon={<ShieldCheck className="w-5 h-5" />} />
        <Card className="p-12 text-center"><p className="text-slate-500">Analisando pedidos...</p></Card>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Análise de Risco" subtitle="Erro ao carregar" icon={<ShieldCheck className="w-5 h-5" />} />
        <Card className="border-[#5a1f35]/40 bg-[#2a1118] p-6">
          <p className="text-[#d6a2b0]">{error}</p>
        </Card>
      </PageLayout>
    );
  }

  if (analises.length === 0) {
    return (
      <PageLayout>
        <PageHeader title="Análise de Risco" subtitle="Nenhum pedido analisado ainda" icon={<ShieldCheck className="w-5 h-5" />} />
        <Card className="border-[#a100ff]/10 bg-[#a100ff]/5 p-12 text-center space-y-6">
          <div className="space-y-2">
            <p className="text-slate-300 font-medium">Nenhum pedido foi analisado ainda.</p>
            <p className="text-slate-500 text-sm">A análise de risco é gerada a partir da tela de pedidos quando você clica em "Analisar risco" no detalhe do pedido.</p>
          </div>
          <Button
            onClick={() => navigate('/pedidos')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#a100ff] text-white hover:bg-[#a100ff]/90 transition-colors font-semibold"
          >
            Ir para Pedidos
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Análise de Risco"
        subtitle="Análise em tempo real de risco dos pedidos"
        icon={<ShieldCheck className="w-5 h-5" />}
        action={
          <Button
            onClick={() => navigate('/pedidos')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#111111] border border-[#a100ff]/20 text-[#d8b4fe] hover:bg-[#161616] hover:border-[#a100ff]/40 hover:text-white transition-colors"
          >
            Voltar
            <ArrowRight className="w-4 h-4" />
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="p-5"><div className="text-sm text-slate-500">Analisados</div><div className="text-2xl font-bold text-white mt-2">{analises.length}</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">Score Médio</div><div className="text-2xl font-bold text-white mt-2">{scoreMedio}</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">Baixo Risco</div><div className="text-2xl font-bold text-[#d8b4fe] mt-2">{countByRisk.BAIXO}</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">Alto Risco</div><div className="text-2xl font-bold text-[#d6a2b0] mt-2">{countByRisk.ALTO}</div></Card>
      </div>

      <div className="space-y-4">
        {analises.map((a) => {
          const style = riskStyles[a.nivelRisco];
          return (
            <Card key={a.pedidoId} className="border-[#2a2a2a] bg-[#0b0b0b] p-6">
              {/* Cabeçalho do Card */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#1a1a1a]">
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Pedido</p>
                  <h3 className="text-xl font-bold text-white mt-1">{a.numeroPedido}</h3>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-tighter ${style.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                    {style.label}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Score</p>
                    <p className="text-2xl font-black text-white">{a.score}</p>
                  </div>
                </div>
              </div>

              {/* Dados Principais */}
              <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Status</p>
                  <p className="text-sm text-slate-200 mt-2">{a.statusPedido}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Nível de Risco</p>
                  <p className="text-sm text-slate-200 mt-2">{style.label}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Data Análise</p>
                  <p className="text-sm text-slate-200 mt-2">{a.dataAnalise}</p>
                </div>
              </div>

              {/* Motivos */}
              <div className="mt-5">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Motivos da Análise</p>
                <div className="space-y-2">
                  {a.motivos && a.motivos.length > 0 ? (
                    a.motivos.map((motivo: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-slate-400 shrink-0">•</span>
                        <p className="text-sm leading-relaxed text-slate-200 whitespace-normal break-words">{motivo}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">Nenhum motivo informado.</p>
                  )}
                </div>
              </div>

              {/* Recomendação */}
              <div className="mt-5 rounded-xl border border-[#a100ff]/20 bg-[#a100ff]/5 p-4">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Recomendação</p>
                <p className="text-sm leading-relaxed text-slate-100 whitespace-normal break-words">
                  {melhorarRecomendacao(
                    a.recomendacao,
                    a.motivos,
                    undefined,
                    a.nivelRisco
                  )}
                </p>
              </div>

              {/* Ação */}
              <div className="mt-5 flex items-center gap-3">
                <Button
                  onClick={() => navigate(`/pedidos?pedidoId=${a.pedidoId}`)}
                  className="flex-1 h-10 px-4 rounded-xl bg-[#a100ff]/10 border border-[#a100ff]/30 text-[#d8b4fe] hover:bg-[#a100ff]/20 hover:border-[#a100ff]/50 transition-colors font-semibold text-sm"
                >
                  Ver Pedido
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}

