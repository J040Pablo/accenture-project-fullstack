import {
  ArrowRight,
  BadgeAlert,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Minus,
  Package,
  Plus,
  RefreshCcw,
  ShoppingCart,
  ShieldAlert,
  Users,
  Wallet,
  Zap
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type PedidoStatus = 'ABERTO' | 'RESERVADO' | 'PAGO' | 'CANCELADO' | 'FALHOU';
type Prioridade = 'Alta' | 'Média' | 'Baixa';

const quickActions = [
  { label: 'Novo Cliente', icon: Users },
  { label: 'Novo Produto', icon: Package },
  { label: 'Novo Pedido', icon: ShoppingCart }
];

const operationalCards = [
  {
    title: 'Pedidos abertos',
    value: '8',
    helper: 'Aguardando reserva ou confirmação',
    icon: ShoppingCart,
    tone: 'text-[#dbeafe]',
    badge: 'Agora'
  },
  {
    title: 'Pedidos reservados',
    value: '5',
    helper: 'Prontos para pagamento',
    icon: CheckCircle2,
    tone: 'text-[#e8c7ff]',
    badge: 'Em fila'
  },
  {
    title: 'Estoque baixo',
    value: '4',
    helper: 'Produtos precisam reposição',
    icon: Package,
    tone: 'text-[#fbbf24]',
    badge: 'Alerta'
  },
  {
    title: 'Pagamentos pendentes',
    value: '3',
    helper: 'Pedidos aguardando baixa',
    icon: CreditCard,
    tone: 'text-[#a7f3d0]',
    badge: 'Atenção'
  }
];

const alerts = [
  {
    title: '5 produtos precisam de reposição',
    description: 'Itens com risco de ruptura no curto prazo.',
    priority: 'Alta' as Prioridade,
    icon: Package
  },
  {
    title: '3 pedidos aguardam pagamento',
    description: 'Pedidos reservados esperando confirmação.',
    priority: 'Alta' as Prioridade,
    icon: Wallet
  },
  {
    title: '2 pedidos falharam na reserva',
    description: 'Revisar disponibilidade e tentar novamente.',
    priority: 'Média' as Prioridade,
    icon: ShieldAlert
  },
  {
    title: '1 cancelamento aguarda estorno',
    description: 'Necessita ajuste financeiro imediato.',
    priority: 'Baixa' as Prioridade,
    icon: RefreshCcw
  }
];

const recentOrders: Array<{
  pedido: string;
  cliente: string;
  status: PedidoStatus;
  total: string;
}> = [
  { pedido: 'PED-1024', cliente: 'O nome', status: 'ABERTO', total: 'R$ 145,00' },
  { pedido: 'PED-1025', cliente: 'Maria Silva', status: 'RESERVADO', total: 'R$ 89,90' },
  { pedido: 'PED-1026', cliente: 'João Pedro', status: 'PAGO', total: 'R$ 240,00' },
  { pedido: 'PED-1027', cliente: 'Ana Souza', status: 'CANCELADO', total: 'R$ 79,90' },
  { pedido: 'PED-1028', cliente: 'Carlos Lima', status: 'FALHOU', total: 'R$ 112,00' }
];

const movements = [
  {
    title: 'Pagamento recebido',
    description: 'Pedido PED-1026 liquidado com sucesso',
    value: '+ R$ 240,00',
    icon: CreditCard,
    color: 'text-[#10b981]',
    related: 'PED-1026'
  },
  {
    title: 'Estorno realizado',
    description: 'Cancelamento do pedido PED-1027',
    value: '- R$ 79,90',
    icon: RefreshCcw,
    color: 'text-[#ef4444]',
    related: 'PED-1027'
  },
  {
    title: 'Débito do cliente',
    description: 'Pagamento pendente no caixa do cliente',
    value: '- R$ 145,00',
    icon: Minus,
    color: 'text-[#f59e0b]',
    related: 'PED-1024'
  },
  {
    title: 'Crédito na empresa',
    description: 'Entrada financeira de pedido pago',
    value: '+ R$ 89,90',
    icon: Plus,
    color: 'text-[#a7f3d0]',
    related: 'PED-1025'
  }
];

const priorityStyles: Record<Prioridade, string> = {
  Alta: 'bg-[#7f1d1d]/10 text-[#fecaca] border-[#ef4444]/30',
  Média: 'bg-[#f59e0b]/10 text-[#fbbf24] border-[#f59e0b]/30',
  Baixa: 'bg-[#1e3a8a]/10 text-[#dbeafe] border-[#3b82f6]/30'
};

const statusStyles: Record<PedidoStatus, string> = {
  ABERTO: 'bg-[#1e3a8a]/10 text-[#dbeafe] border-[#3b82f6]/30',
  RESERVADO: 'bg-[#4a136f]/10 text-[#e8c7ff] border-[#c000ff]/30',
  PAGO: 'bg-[#064e3b]/10 text-[#a7f3d0] border-[#10b981]/30',
  CANCELADO: 'bg-[#7f1d1d]/10 text-[#fecaca] border-[#ef4444]/30',
  FALHOU: 'bg-[#713f12]/10 text-[#fde68a] border-[#f59e0b]/30'
};

function StatusBadge({ status }: { status: PedidoStatus }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Prioridade }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-semibold ${priorityStyles[priority]}`}>
      {priority}
    </span>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-3">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Olá, usuário!</h1>
            <p className="text-slate-400 text-sm max-w-2xl">Acompanhe a operação da loja em tempo real.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2a2a2a] bg-[#111111] text-xs text-slate-300">
              <div className="w-2 h-2 rounded-full bg-[#10b981]" /> Operação saudável
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2a2a2a] bg-[#111111] text-xs text-slate-300">
              <Clock3 className="w-3.5 h-3.5" /> Atualizado agora
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-[#2a2a2a] bg-[#111111] text-xs text-slate-300">
          <Zap className="w-3.5 h-3.5 text-[#d482ff]" /> Operação diária
        </div>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 items-stretch">
        <Card className="relative overflow-hidden bg-[#111111] border-[#2a2a2a] shadow-none p-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#a100ff]/18 via-[#a100ff]/6 to-transparent pointer-events-none" />
          <div className="relative p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2a2a2a] bg-[#151515] text-xs text-slate-300">
                  <BellRing className="w-3.5 h-3.5 text-[#d482ff]" /> Status geral da operação
                </div>
                <h2 className="text-3xl font-bold text-white leading-tight">Pedidos, estoque e pagamentos estão sendo acompanhados.</h2>
                <p className="text-sm text-slate-400 max-w-xl">Tudo que exige atenção imediata aparece aqui</p>
              </div>

              <div className="shrink-0 rounded-3xl border border-[#2a2a2a] bg-[#151515]/80 px-5 py-4 text-right min-w-[180px]">
                <div className="text-xs text-slate-400 mb-1">Indicador atual</div>
                <div className="text-3xl font-bold text-white">8</div>
                <div className="text-sm text-slate-300">ações pendentes</div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button className="bg-[#c000ff] hover:bg-[#da3dff] text-white rounded-full h-12 px-6 font-semibold">
                Criar pedido
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white border border-[#2a2a2a] rounded-full h-12 px-6">
                Ver pedidos
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-[#111111] border-[#2a2a2a] shadow-none p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-500 text-xs mb-1">Ações necessárias</p>
              <h3 className="text-lg font-bold text-white">O que precisa de atenção</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#d482ff]">
              <BadgeAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = alert.icon;

              return (
                <div key={alert.title} className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4 hover:border-[#5b148a] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#d482ff] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-semibold text-white leading-snug">{alert.title}</h4>
                        <PriorityBadge priority={alert.priority} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              className="group rounded-2xl border border-[#2a2a2a] bg-[#111111] px-4 py-4 text-left hover:border-[#5b148a] hover:bg-[#151515] transition-all shadow-none"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#d482ff] shrink-0 transition-colors group-hover:text-white group-hover:bg-[#4a136f]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-white">{action.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </button>
          );
        })}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {operationalCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="bg-[#111111] border-[#2a2a2a] shadow-none p-5 hover:border-[#5b148a] transition-colors relative overflow-hidden">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{card.title}</p>
                  <div className={`text-3xl font-bold ${card.tone}`}>{card.value}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-slate-400">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-4">{card.helper}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#2a2a2a] bg-[#151515] text-[11px] text-slate-300">
                {card.badge}
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4 items-start">
        <Card className="bg-[#111111] border-[#2a2a2a] p-0 shadow-none overflow-hidden">
          <div className="p-6 pb-4 flex justify-between items-start border-b border-[#2a2a2a] gap-4">
            <div>
              <p className="text-slate-500 text-xs mb-1">Operação em andamento</p>
              <h3 className="text-lg font-bold text-white">Pedidos recentes</h3>
            </div>
            <Button className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white border border-[#2a2a2a] rounded-full h-10 px-4 text-sm">
              Ver tudo
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="text-slate-500 border-b border-[#2a2a2a] text-xs font-semibold uppercase">
                  <th className="font-medium p-5">Pedido</th>
                  <th className="font-medium p-5">Cliente</th>
                  <th className="font-medium p-5">Status</th>
                  <th className="font-medium p-5">Total</th>
                  <th className="font-medium p-5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {recentOrders.map((order) => (
                  <tr key={order.pedido} className="hover:bg-[#161616] transition-colors">
                    <td className="p-5 font-medium text-white">{order.pedido}</td>
                    <td className="p-5 text-slate-300">{order.cliente}</td>
                    <td className="p-5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-5 font-semibold text-[#d482ff]">{order.total}</td>
                    <td className="p-5 text-right">
                      <button className="inline-flex items-center gap-1 text-sm text-[#d482ff] hover:text-white transition-colors">
                        Ver pedido <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="bg-[#111111] border-[#2a2a2a] p-0 shadow-none overflow-hidden">
          <div className="p-6 pb-4 flex justify-between items-start border-b border-[#2a2a2a] gap-4">
            <div>
              <p className="text-slate-500 text-xs mb-1">Fluxo financeiro</p>
              <h3 className="text-lg font-bold text-white">Movimentações recentes</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#d482ff]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="divide-y divide-[#2a2a2a]">
            {movements.map((movement) => {
              const Icon = movement.icon;

              return (
                <div key={movement.title} className="p-5 flex items-start justify-between gap-4 hover:bg-[#161616] transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shrink-0 ${movement.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{movement.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{movement.description}</p>
                      <p className="text-[11px] text-slate-500 mt-2">Pedido relacionado: {movement.related}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${movement.color}`}>{movement.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
