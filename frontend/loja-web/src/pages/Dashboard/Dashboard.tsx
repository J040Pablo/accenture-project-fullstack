import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCcw,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import { RevenueChartCard } from '../../components/dashboard/RevenueChartCard';
import { RiskAnalysisCard } from '../../components/dashboard/RiskAnalysisCard';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageToolbar } from '../../components/ui/PageToolbar';
import { PrimaryActionButton } from '../../components/ui/PrimaryActionButton';
import { cn } from '../../utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { contaService } from '../../services/contaService';
import { movimentacaoService } from '../../services/movimentacaoService';
import { pedidoService } from '../../services/pedidoService';
import { produtoService } from '../../services/produtoService';
import { clienteService } from '../../services/clienteService';
import { analiseRiscoService } from '../../services/analiseRiscoService';

import type { Conta } from '../../types/Conta';
import type { Movimentacao } from '../../types/Movimentacao';
import type { Pedido } from '../../types/Pedido';
import type { Produto } from '../../types/Produto';
import type { Cliente } from '../../types/Cliente';
import type { AnaliseRiscoPedido } from '../../types/AnaliseRisco';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'Pago' | 'Reservado' | 'Cancelado' | 'Pendente';

function useDashboardData() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [analises, setAnalises] = useState<AnaliseRiscoPedido[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMap, setErrorMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function carregarDados() {
      setIsLoading(true);
      setErrorMap({});

      const [contasRes, movsRes, pedidosRes, produtosRes, clientesRes] = await Promise.allSettled([
        contaService.listar().catch(() => null),
        movimentacaoService.listar().catch(() => null),
        pedidoService.listar().catch(() => null),
        produtoService.listar().catch(() => null),
        clienteService.listar().catch(() => null),
      ]);

      const updatedErrors: Record<string, boolean> = {};
      let fetchedPedidos: Pedido[] = [];

      // Resolvers
      if (contasRes.status === 'fulfilled' && contasRes.value) {
        setContas(contasRes.value.data ?? contasRes.value ?? []);
      } else {
        updatedErrors.contas = true;
      }

      if (movsRes.status === 'fulfilled' && movsRes.value) {
        setMovimentacoes(movsRes.value.data ?? movsRes.value ?? []);
      } else {
        updatedErrors.movimentacoes = true;
      }

      if (pedidosRes.status === 'fulfilled' && pedidosRes.value) {
        fetchedPedidos = (pedidosRes.value as any).data ?? pedidosRes.value ?? [];
        setPedidos(fetchedPedidos);
      } else {
        updatedErrors.pedidos = true;
      }

      if (produtosRes.status === 'fulfilled' && produtosRes.value) {
        setProdutos((produtosRes.value as any).data ?? produtosRes.value ?? []);
      } else {
        updatedErrors.produtos = true;
      }

      if (clientesRes.status === 'fulfilled' && clientesRes.value) {
        setClientes((clientesRes.value as any).data ?? clientesRes.value ?? []);
      } else {
        updatedErrors.clientes = true;
      }

      // Analises de Risco fallback
      if (fetchedPedidos.length > 0) {
        try {
          const analisesProm = fetchedPedidos.map(async (p) => {
            try {
              return await analiseRiscoService.buscarPorPedido(p.idPedido!);
            } catch (err: any) {
              if (err?.response?.status === 404 || err?.status === 404 || err?.message?.includes("404")) {
                return await analiseRiscoService.analisarPedido(p.idPedido!);
              }
              try {
                return await analiseRiscoService.analisarPedido(p.idPedido!);
              } catch {
                 return null;
              }
            }
          });
          const results = await Promise.all(analisesProm);
          setAnalises(results.filter(Boolean) as AnaliseRiscoPedido[]);
        } catch {
          updatedErrors.analises = true;
        }
      }

      setErrorMap(updatedErrors);
      setIsLoading(false);
    }

    carregarDados();
  }, []);

  return { contas, movimentacoes, pedidos, produtos, clientes, analises, isLoading, errorMap };
}

// ─── Style helpers ────────────────────────────────────────────────────────────

/** Returns [dot-class, badge-class] — badges are always dark; only the tiny
 *  dot carries semantic colour (green/amber/rose), which is acceptable. */
const statusStyle: Record<OrderStatus, { dot: string; badge: string }> = {
  Pago:      { dot: 'bg-[#a100ff]',   badge: 'bg-[#a100ff]/[0.07] text-[#d8b4fe] border-[#a100ff]/20'  },
  Reservado: { dot: 'bg-[#7c3aed]',   badge: 'bg-[#7c3aed]/[0.05] text-[#c4b5fd] border-[#7c3aed]/15'  },
  Pendente:  { dot: 'bg-amber-400/40', badge: 'bg-[#111111] text-slate-400 border-[#2a2a2a]'            },
  Cancelado: { dot: 'bg-rose-400/40',  badge: 'bg-[#111111] text-slate-500 border-[#2a2a2a]'            },
};


// ─── Sub-components ───────────────────────────────────────────────────────────

function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <PageHeader
      title="Dashboard"
      subtitle="Visão geral da operação do e-commerce"
      icon={<Activity className="w-5 h-5" />}
      action={
        <PrimaryActionButton onClick={() => navigate('/pedidos')}>
          <Plus className="w-4 h-4" />
          Novo Pedido
        </PrimaryActionButton>
      }
    />
  );
}

function StatusBadges() {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2a2a2a] bg-[#0f0f0f] text-xs text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        Operação saudável
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2a2a2a] bg-[#0f0f0f] text-xs text-slate-500">
        <RefreshCcw className="w-3 h-3 shrink-0" />
        Atualizado agora
      </span>
    </div>
  );
}

function QuickActions() {
  const navigate = useNavigate();
  const actions = [
    { label: 'Novo Cliente', icon: Users, path: '/clientes' },
    { label: 'Novo Produto', icon: Package, path: '/produtos' },
    { label: 'Novo Pedido', icon: Plus, path: '/pedidos' },
    { label: 'Ver Estoque', icon: Activity, path: '/produtos' },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.label}
            type="button"
            onClick={() => navigate(a.path)}
            className="inline-flex items-center gap-2 px-4 h-9 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] text-sm text-slate-400 hover:border-[#a100ff]/30 hover:text-[#d8b4fe] hover:bg-[#111111] transition-all duration-150"
          >
            <Icon className="w-3.5 h-3.5 text-[#a100ff]/60" />
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

interface MetricDef {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  hint?: string;
}

function MetricCards({
  contas,
  pedidos,
  produtos,
  clientes,
  analises,
  isLoading,
  errorMap
}: {
  contas: Conta[];
  pedidos: Pedido[];
  produtos: Produto[];
  clientes: Cliente[];
  analises: AnaliseRiscoPedido[];
  isLoading: boolean;
  errorMap: Record<string, boolean>;
}) {
  // 1. Saldo da Empresa
  const empresa = contas.find((conta: any) => conta.tipoTitular === 'EMPRESA' || conta.tipo === 'EMPRESA');
  const saldoEmpresa = errorMap.contas 
    ? '--' 
    : empresa 
      ? `R$ ${Number(empresa.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
      : 'R$ 0,00';

  // 2. Pedidos Pagos
  const pedidosPagosStr = errorMap.pedidos 
    ? '--' 
    : pedidos.filter(p => (p.status || '').toString().toUpperCase() === 'PAGO').length.toString();

  // 3. Pedidos Pendentes
  const pedidosPendentesStr = errorMap.pedidos 
    ? '--' 
    : pedidos.filter(p => {
        const s = (p.status || '').toString().toUpperCase();
        return s === 'CRIADO' || s === 'RESERVADO' || s === 'PENDENTE' || (s !== 'PAGO' && s !== 'CANCELADO');
      }).length.toString();

  // 4. Estoque Baixo
  const estoqueBaixoStr = errorMap.produtos 
    ? '--' 
    : produtos.filter(p => Number(p.estoque) <= 5).length.toString();

  // 5. Clientes Cadastrados
  const clientesStr = errorMap.clientes 
    ? '--' 
    : clientes.length.toString();

  // 6. Faturamento do Mês
  const agora = new Date();
  const faturamentoMesVal = pedidos.filter(p => {
    if ((p.status || '').toString().toUpperCase() !== 'PAGO') return false;
    const dataReg = (p as any).dataCriacao || (p as any).dataPedido || (p as any).dataAtualizacao || (p as any).criadoEm;
    if (!dataReg) return false;
    const dt = new Date(dataReg);
    if (Number.isNaN(dt.getTime())) return false;
    return dt.getMonth() === agora.getMonth() && dt.getFullYear() === agora.getFullYear();
  }).reduce((acc, p: any) => acc + Number(p.totalFinal ?? p.valorTotal ?? p.valorFinal ?? p.total ?? 0), 0);

  const faturamentoMesStr = errorMap.pedidos 
    ? '--' 
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturamentoMesVal);

  // 7. Pedidos Cancelados
  const pedidosCanceladosStr = errorMap.pedidos 
    ? '--' 
    : pedidos.filter(p => (p.status || '').toString().toUpperCase() === 'CANCELADO').length.toString();

  // 8. Risco Médio
  const riscoStr = errorMap.analises 
    ? '--' 
    : analises.filter((a: any) => a.nivelRisco === 'MEDIO' || a.nivelRisco === 'ALTO').length.toString();


  const metrics: MetricDef[] = [
    { title: 'Saldo da Empresa',      value: isLoading ? '...' : saldoEmpresa, description: 'Disponível na conta principal',       icon: Wallet,       hint: undefined     },
    { title: 'Pedidos Pagos',         value: isLoading ? '...' : pedidosPagosStr,         description: 'Pedidos finalizados no período',      icon: CheckCircle2, hint: undefined     },
    { title: 'Pedidos Pendentes',     value: isLoading ? '...' : pedidosPendentesStr,          description: 'Aguardando reserva ou pagamento',     icon: Clock,        hint: 'Requer atenção' },
    { title: 'Estoque Baixo',         value: isLoading ? '...' : estoqueBaixoStr,          description: 'Produtos com reposição necessária',   icon: Package,      hint: 'Verificar hoje' },
    { title: 'Clientes Cadastrados',  value: isLoading ? '...' : clientesStr,        description: 'Total de clientes na base',           icon: Users,        hint: undefined     },
    { title: 'Faturamento do Mês',    value: isLoading ? '...' : faturamentoMesStr,  description: 'Receita total do mês atual',          icon: TrendingUp,   hint: undefined     },
    { title: 'Pedidos Cancelados',    value: isLoading ? '...' : pedidosCanceladosStr,          description: 'Cancelamentos no período',            icon: XCircle,      hint: undefined     },
    { title: 'Risco Médio',           value: isLoading ? '...' : riscoStr,      description: 'Pedidos com risco médio ou alto',     icon: AlertTriangle,hint: undefined     },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <Card
            key={m.title}
            className="p-5 border-[#2a2a2a] bg-[#0b0b0b] hover:border-[#a100ff]/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight pr-2">
                {m.title}
              </p>
              <div className="w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-slate-500 group-hover:text-[#a100ff] group-hover:border-[#a100ff]/20 shrink-0 transition-all duration-300">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <p className="text-2xl font-bold text-[#f8f5ff] tracking-tight mb-1">
              {m.value}
            </p>
            <p className="text-[11px] text-slate-600 font-medium">{m.description}</p>

            {m.hint && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#1a1a1a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a100ff] animate-pulse shrink-0" />
                <span className="text-[10px] font-bold text-[#c4b5fd]/80 uppercase tracking-tighter">{m.hint}</span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function LatestOrders({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await (await import('../../services/pedidoService')).pedidoService.listar();
        if (mounted) setPedidos(data ?? []);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Erro ao carregar pedidos');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Card className={cn("overflow-hidden flex flex-col", className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between gap-4 bg-[#0d0d0d]">
        <div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Operação em tempo real</p>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Últimos Pedidos
            <span className="w-1.5 h-1.5 rounded-full bg-[#a100ff] animate-pulse" />
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/pedidos')}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter text-[#a100ff] hover:text-white transition-colors group/link"
        >
          Ver todos <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-slate-500">Carregando pedidos...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="p-6 text-center text-[#d6a2b0]">{error}</td></tr>
            ) : pedidos.length === 0 ? (
              <tr><td colSpan={7} className="p-20 text-center">Nenhum pedido encontrado.</td></tr>
            ) : (
              pedidos.map((pedido) => {
                const statusLabel = (pedido.status ?? '').toString();
                const statusDisplay = statusLabel === 'PAGO' ? 'Pago' : statusLabel === 'RESERVADO' ? 'Reservado' : statusLabel === 'CANCELADO' ? 'Cancelado' : 'Criado';
                const ss = statusStyle[(statusDisplay as unknown) as OrderStatus] || statusStyle.Pago;
                return (
                  <TableRow key={pedido.idPedido} className="group/row">
                    <TableCell className="font-mono font-bold text-slate-400 group-hover/row:text-[#a100ff] transition-colors">#{pedido.idPedido}</TableCell>
                    <TableCell className="text-sm font-medium text-slate-300">Cliente #{pedido.clienteId}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-tighter ${ss.dot.replace('bg-', 'text-')} ${ss.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ss.dot}`} />
                        {statusDisplay}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-white">R$ {Number(pedido.totalFinal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className={cn("text-[11px] font-bold uppercase", 'text-slate-400')}>-</TableCell>
                    <TableCell className="text-[11px] font-medium text-slate-600">{new Date(pedido.dataCriacao).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <button className="opacity-0 group-hover/row:opacity-100 transition-opacity p-2 rounded-xl hover:bg-white/[0.05] text-slate-600 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function FinancialMovements({ movimentacoes, isLoading, error }: { movimentacoes: Movimentacao[]; isLoading: boolean; error: string | null }) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between gap-4 bg-[#0d0d0d]">
        <div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Fluxo de caixa recente</p>
          <h2 className="text-base font-bold text-white tracking-tight">Movimentações</h2>
        </div>
        <div className="w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-[#a100ff] shadow-inner">
          <Wallet className="w-4 h-4" />
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#141414] flex-1">
        {isLoading ? (
          <div className="px-6 py-4 text-slate-400">Carregando movimentações...</div>
        ) : error ? (
          <div className="px-6 py-4 text-[#d6a2b0]">{error}</div>
        ) : movimentacoes.length === 0 ? (
          <div className="px-6 py-4 text-slate-500">Nenhuma movimentação encontrada.</div>
        ) : (
          movimentacoes.slice(0, 5).map((m) => (
            <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-all duration-200 group">
              <div className="w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-[#a100ff]/40 group-hover:text-[#a100ff]/70 group-hover:border-[#a100ff]/20 shrink-0 transition-all">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{m.descricao}</p>
                <p className="text-[10px] font-bold text-slate-600 mt-0.5 uppercase tracking-tighter">ID {m.id}</p>
              </div>
              <p className={`text-sm font-black shrink-0 tracking-tight ${m.valor > 0 ? 'text-[#d8b4fe]' : 'text-rose-400/50'}`}>
                {m.valor > 0 ? '+' : '-'}R$ {Math.abs(m.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Footer link */}
      <div className="px-6 py-3.5 border-t border-[#1a1a1a] bg-[#0d0d0d]">
        <button
          type="button"
          onClick={() => navigate('/contas')}
          className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#a100ff] transition-all group/footer"
        >
          Ver fluxo completo <ArrowRight className="w-3.5 h-3.5 group-hover/footer:translate-x-1 transition-transform" />
        </button>
      </div>
    </Card>
  );
}

function LowStockProducts() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await (await import('../../services/produtoService')).produtoService.listar();
        if (mounted) setProdutos(data ?? []);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Erro ao carregar produtos');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const lowItems = produtos.filter(p => typeof p.estoque === 'number' && p.estoque <= 5);

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between gap-4 bg-[#0d0d0d]">
        <div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Requer atenção</p>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Estoque Crítico
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          </h2>
        </div>
        <div className="w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-rose-500/60 shadow-inner">
          <Package className="w-4 h-4" />
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-[#141414] flex-1">
        {loading ? (
          <div className="px-6 py-4 text-slate-400">Carregando produtos...</div>
        ) : error ? (
          <div className="px-6 py-4 text-[#d6a2b0]">{error}</div>
        ) : lowItems.length === 0 ? (
          <div className="px-6 py-4 text-slate-500">Nenhum produto com estoque baixo.</div>
        ) : (
          lowItems.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center group-hover:border-[#a100ff]/20 group-hover:text-[#a100ff] transition-all">
                  <Package className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{p.nome}</span>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${
                p.estoque <= 2
                  ? 'bg-rose-500/[0.08] text-rose-400 border-rose-500/20'
                  : 'bg-[#111111] text-slate-500 border-[#2a2a2a]'
              }`}>
                {p.estoque} UN.
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer link */}
      <div className="px-6 py-3.5 border-t border-[#1a1a1a] bg-[#0d0d0d]">
        <button
          type="button"
          onClick={() => navigate('/produtos')}
          className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-rose-400 transition-all group/footer"
        >
          Ver catálogo completo <ArrowRight className="w-3.5 h-3.5 group-hover/footer:translate-x-1 transition-transform" />
        </button>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { contas, movimentacoes, pedidos, produtos, clientes, analises, isLoading, errorMap } = useDashboardData();

  return (
    <PageLayout>

      {/* 1. Header */}
      <DashboardHeader />

      <PageToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pesquisar no sistema"
        rightContent={<QuickActions />}
      />

      {/* Status Indicators */}
      <StatusBadges />

      {/* 3. Metric cards — 2 cols on mobile, 4 on desktop */}
      <MetricCards 
        contas={contas} 
        pedidos={pedidos} 
        produtos={produtos} 
        clientes={clientes} 
        analises={analises} 
        isLoading={isLoading} 
        errorMap={errorMap} 
      />

      <div className="flex items-center justify-between gap-4 mt-2">
        <div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">
            Análise operacional
          </p>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Resumo de risco dos pedidos
          </h2>
        </div>

        <button
          type="button"
          onClick={() => navigate('/analise-risco')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#d8b4fe] transition-colors group/footer"
        >
          Ver análise completa
          <ArrowRight className="w-3.5 h-3.5 group-hover/footer:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 4. Orders table (2/3) + Risk card (1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <LatestOrders className="xl:col-span-2" />
        <RiskAnalysisCard />
      </div>

      {/* 5. Revenue chart — full width */}
      <RevenueChartCard />

      {/* 6. Financial movements + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialMovements movimentacoes={movimentacoes} isLoading={isLoading} error={errorMap.movimentacoes ? "Erro ao carregar movimentações" : null} />
        <LowStockProducts />
      </div>

    </PageLayout>
  );
}
