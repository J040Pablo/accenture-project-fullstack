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
  Search,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import { RevenueChartCard } from '../../components/dashboard/RevenueChartCard';
import { RiskAnalysisCard } from '../../components/dashboard/RiskAnalysisCard';

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
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

      {/* Left: title + status badges */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-400">Visão geral da operação do e-commerce</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2a2a2a] bg-[#0f0f0f] text-xs text-slate-400">
            {/* Tiny green dot is acceptable — it's semantic and very small */}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            Operação saudável
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2a2a2a] bg-[#0f0f0f] text-xs text-slate-500">
            <RefreshCcw className="w-3 h-3 shrink-0" />
            Atualizado agora
          </span>
        </div>
      </div>

      {/* Right: search + CTA */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar no sistema"
            className="pl-9 pr-4 h-10 w-52 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] text-sm text-slate-300 placeholder-slate-700 focus:outline-none focus:border-[#a100ff]/50 transition-colors"
          />
        </div>
        <button className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#a100ff] hover:bg-[#b833ff] text-white text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" />
          Novo Pedido
        </button>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: 'Novo Cliente', icon: Users    },
    { label: 'Novo Produto', icon: Package  },
    { label: 'Novo Pedido',  icon: Plus     },
    { label: 'Ver Estoque',  icon: Activity },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.label}
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.title}
            className="group rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-5 hover:border-[#3a3a3a] transition-colors duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-[11px] text-slate-600 font-medium uppercase tracking-wide leading-tight pr-2">
                {m.title}
              </p>
              <div className="w-8 h-8 rounded-xl border border-[#252525] bg-[#111111] flex items-center justify-center text-slate-600 group-hover:text-[#a100ff]/60 shrink-0 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <p className="text-2xl font-bold text-white tracking-tight mb-1">{m.value}</p>
            <p className="text-[11px] text-slate-600">{m.description}</p>

            {m.hint && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#1a1a1a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a100ff]/50 shrink-0" />
                <span className="text-[11px] text-[#c4b5fd]/60">{m.hint}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LatestOrders({ className }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] overflow-hidden ${className ?? ''}`}>

      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-500 mb-0.5">Operação em tempo real</p>
          <h2 className="text-base font-semibold text-white">Últimos Pedidos</h2>
        </div>
        <button className="inline-flex items-center gap-1.5 text-xs text-[#a100ff] hover:text-white transition-colors">
          Ver todos <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              {['Pedido', 'Cliente', 'Status', 'Valor', 'Risco', 'Data', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]">
            {latestOrders.map((order) => {
              const ss = statusStyle[order.status];
              return (
                <tr key={order.id} className="hover:bg-white/[0.015] transition-colors group">
                  <td className="px-5 py-4 text-sm font-mono font-medium text-slate-300">{order.id}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{order.cliente}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${ss.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ss.dot}`} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-white">{order.valor}</td>
                  <td className={`px-5 py-4 text-sm ${riskText[order.risco]}`}>{order.risco}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{order.data}</td>
                  <td className="px-5 py-4 text-right">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-[#1f1f1f] text-slate-600 hover:text-slate-300">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinancialMovements() {
  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] overflow-hidden flex flex-col">

      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-500 mb-0.5">Fluxo de caixa recente</p>
          <h2 className="text-base font-semibold text-white">Movimentações Financeiras</h2>
        </div>
        <div className="w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-[#a100ff]">
          <Wallet className="w-4 h-4" />
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#141414] flex-1">
        {financialMovements.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.015] transition-colors">
              <div className="w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-[#a100ff]/50 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300">{m.desc}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Pedido {m.id}</p>
              </div>
              {/* Positive = light purple; negative = muted rose — both subtle */}
              <p className={`text-sm font-semibold shrink-0 ${m.positive ? 'text-[#d8b4fe]' : 'text-rose-400/60'}`}>
                {m.valor}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <div className="px-6 py-3.5 border-t border-[#1a1a1a]">
        <button className="w-full flex items-center justify-center gap-2 text-xs text-slate-600 hover:text-slate-400 transition-colors">
          Ver todas as movimentações <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function LowStockProducts() {
  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] overflow-hidden flex flex-col">

      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-slate-500 mb-0.5">Requer atenção</p>
          <h2 className="text-base font-semibold text-white">Estoque Baixo</h2>
        </div>
        <div className="w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-[#a100ff]/60">
          <Package className="w-4 h-4" />
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-[#141414] flex-1">
        {lowStockItems.map((p) => (
          <div key={p.name} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.015] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg border border-[#252525] bg-[#111111] flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <span className="text-sm text-slate-300">{p.name}</span>
            </div>
            {/* ≤2 units gets a subtle purple pill; others get neutral slate */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${
              p.units <= 2
                ? 'bg-[#a100ff]/[0.08] text-[#d8b4fe] border-[#a100ff]/20'
                : 'bg-[#111111] text-slate-500 border-[#2a2a2a]'
            }`}>
              {p.units} un.
            </span>
          </div>
        ))}
      </div>

      {/* Footer link */}
      <div className="px-6 py-3.5 border-t border-[#1a1a1a]">
        <button className="w-full flex items-center justify-center gap-2 text-xs text-slate-600 hover:text-slate-400 transition-colors">
          Ver estoque completo <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* 1. Header */}
      <DashboardHeader />

      {/* 2. Quick actions */}
      <QuickActions />

      {/* 3. Metric cards — 2 cols on mobile, 4 on desktop */}
      <MetricCards />

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

    </div>
  );
}
