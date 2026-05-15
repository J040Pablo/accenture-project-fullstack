import { useState } from 'react';
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

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'Pago' | 'Reservado' | 'Cancelado' | 'Pendente';
type RiskLevel   = 'Baixo' | 'Médio' | 'Alto';

interface Order {
  id: string;
  cliente: string;
  status: OrderStatus;
  valor: string;
  risco: RiskLevel;
  data: string;
}

interface Movement {
  id: string;
  desc: string;
  valor: string;
  positive: boolean;
  icon: React.ElementType;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const latestOrders: Order[] = [
  { id: '#1021', cliente: 'João Silva',   status: 'Pago',      valor: 'R$ 320,00', risco: 'Baixo', data: 'Hoje'   },
  { id: '#1020', cliente: 'Maria Souza',  status: 'Reservado', valor: 'R$ 180,00', risco: 'Médio', data: 'Hoje'   },
  { id: '#1019', cliente: 'Ana Costa',    status: 'Cancelado', valor: 'R$ 90,00',  risco: 'Baixo', data: 'Ontem'  },
  { id: '#1018', cliente: 'Carlos Lima',  status: 'Pendente',  valor: 'R$ 450,00', risco: 'Alto',  data: 'Ontem'  },
  { id: '#1017', cliente: 'Lucia Ferraz', status: 'Pago',      valor: 'R$ 215,00', risco: 'Baixo', data: '2 dias' },
];

const lowStockItems = [
  { name: 'Camiseta Algodão',  units: 3 },
  { name: 'Mouse Gamer',       units: 2 },
  { name: 'Teclado Mecânico',  units: 1 },
  { name: 'Coca Cola 2L',      units: 4 },
];

const financialMovements: Movement[] = [
  { id: '#1021', desc: 'Pagamento do pedido', valor: '+R$ 320,00', positive: true,  icon: CreditCard },
  { id: '#1019', desc: 'Estorno do pedido',   valor: '−R$ 90,00',  positive: false, icon: RefreshCcw },
  { id: '#1018', desc: 'Pagamento do pedido', valor: '+R$ 250,00', positive: true,  icon: CreditCard },
];

// ─── Style helpers ────────────────────────────────────────────────────────────

/** Returns [dot-class, badge-class] — badges are always dark; only the tiny
 *  dot carries semantic colour (green/amber/rose), which is acceptable. */
const statusStyle: Record<OrderStatus, { dot: string; badge: string }> = {
  Pago:      { dot: 'bg-[#a100ff]',   badge: 'bg-[#a100ff]/[0.07] text-[#d8b4fe] border-[#a100ff]/20'  },
  Reservado: { dot: 'bg-[#7c3aed]',   badge: 'bg-[#7c3aed]/[0.05] text-[#c4b5fd] border-[#7c3aed]/15'  },
  Pendente:  { dot: 'bg-amber-400/40', badge: 'bg-[#111111] text-slate-400 border-[#2a2a2a]'            },
  Cancelado: { dot: 'bg-rose-400/40',  badge: 'bg-[#111111] text-slate-500 border-[#2a2a2a]'            },
};


const riskText: Record<RiskLevel, string> = {
  Baixo: 'text-slate-400',
  Médio: 'text-[#c4b5fd]',
  Alto:  'text-[#a78bfa] font-semibold',
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

function MetricCards() {
  const metrics: MetricDef[] = [
    { title: 'Saldo da Empresa',      value: 'R$ 12.500', description: 'Disponível na conta principal',       icon: Wallet,       hint: undefined     },
    { title: 'Pedidos Pagos',         value: '24',         description: 'Pedidos finalizados no período',      icon: CheckCircle2, hint: undefined     },
    { title: 'Pedidos Pendentes',     value: '8',          description: 'Aguardando reserva ou pagamento',     icon: Clock,        hint: 'Requer atenção' },
    { title: 'Estoque Baixo',         value: '5',          description: 'Produtos com reposição necessária',   icon: Package,      hint: 'Verificar hoje' },
    { title: 'Clientes Cadastrados',  value: '142',        description: 'Total de clientes na base',           icon: Users,        hint: undefined     },
    { title: 'Faturamento do Mês',    value: 'R$ 31.200',  description: 'Receita total do mês atual',          icon: TrendingUp,   hint: undefined     },
    { title: 'Pedidos Cancelados',    value: '3',          description: 'Cancelamentos no período',            icon: XCircle,      hint: undefined     },
    { title: 'Risco Médio',           value: '16,7%',      description: 'Pedidos com risco médio ou alto',     icon: AlertTriangle,hint: undefined     },
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
            {latestOrders.map((order) => {
              const ss = statusStyle[order.status];
              return (
                <TableRow key={order.id} className="group/row">
                  <TableCell className="font-mono font-bold text-slate-400 group-hover/row:text-[#a100ff] transition-colors">{order.id}</TableCell>
                  <TableCell className="text-sm font-medium text-slate-300">{order.cliente}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-tighter ${ss.dot.replace('bg-', 'text-')} ${ss.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ss.dot}`} />
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-white">{order.valor}</TableCell>
                  <TableCell className={cn("text-[11px] font-bold uppercase", riskText[order.risco])}>{order.risco}</TableCell>
                  <TableCell className="text-[11px] font-medium text-slate-600">{order.data}</TableCell>
                  <TableCell className="text-right">
                    <button className="opacity-0 group-hover/row:opacity-100 transition-opacity p-2 rounded-xl hover:bg-white/[0.05] text-slate-600 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function FinancialMovements() {
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
        {financialMovements.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-all duration-200 group">
              <div className="w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-[#a100ff]/40 group-hover:text-[#a100ff]/70 group-hover:border-[#a100ff]/20 shrink-0 transition-all">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{m.desc}</p>
                <p className="text-[10px] font-bold text-slate-600 mt-0.5 uppercase tracking-tighter">ID {m.id}</p>
              </div>
              <p className={`text-sm font-black shrink-0 tracking-tight ${m.positive ? 'text-[#d8b4fe]' : 'text-rose-400/50'}`}>
                {m.valor}
              </p>
            </div>
          );
        })}
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
        {lowStockItems.map((p) => (
          <div key={p.name} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center group-hover:border-[#a100ff]/20 group-hover:text-[#a100ff] transition-all">
                <Package className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{p.name}</span>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${
              p.units <= 2
                ? 'bg-rose-500/[0.08] text-rose-400 border-rose-500/20'
                : 'bg-[#111111] text-slate-500 border-[#2a2a2a]'
            }`}>
              {p.units} UN.
            </span>
          </div>
        ))}
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
      <MetricCards />

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
        <FinancialMovements />
        <LowStockProducts />
      </div>

    </PageLayout>
  );
}
