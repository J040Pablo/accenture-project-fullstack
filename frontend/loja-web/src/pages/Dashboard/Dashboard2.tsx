import {
    Wallet,
    XCircle,
    PackageX,
    Users,
    TrendingUp,
    Package,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ShieldCheck,
    Plus,
    ArrowRight,
    CreditCard,
    RefreshCcw,
    Activity,
    Info
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const metricCards = [
    {
        title: 'Saldo da Empresa',
        value: 'R$ 12.500,00',
        description: 'Valor disponível na conta da loja',
        icon: Wallet,
        highlight: 'Operação positiva',
        variant: 'success'
    },
    {
        title: 'Pedidos Pagos',
        value: '24',
        description: 'Pedidos finalizados com pagamento confirmado',
        icon: CheckCircle2,
        highlight: '+12% no mês',
        variant: 'success'
    },
    {
        title: 'Pedidos Cancelados',
        value: '3',
        description: 'Cancelamentos realizados no período',
        icon: XCircle,
        highlight: 'Baixo impacto',
        variant: 'danger'
    },
    {
        title: 'Estoque Baixo',
        value: '5',
        description: 'Produtos precisam de reposição',
        icon: PackageX,
        highlight: 'Atenção necessária',
        variant: 'warning'
    },
    {
        title: 'Clientes Cadastrados',
        value: '38',
        description: 'Total de clientes ativos no sistema',
        icon: Users,
        highlight: '+4 novos',
        variant: 'info'
    },
    {
        title: 'Pedidos Pendentes',
        value: '8',
        description: 'Aguardando reserva ou pagamento',
        icon: Clock,
        highlight: 'Revisar fila',
        variant: 'warning'
    },
    {
        title: 'Faturamento do Mês',
        value: 'R$ 8.940,00',
        description: 'Receita gerada por pedidos pagos',
        icon: TrendingUp,
        highlight: 'Primeiro mês',
        variant: 'success'
    },
    {
        title: 'Risco Médio',
        value: 'Baixo',
        description: 'Resultado médio da análise de risco',
        icon: ShieldCheck,
        highlight: 'Sistema saudável',
        variant: 'info'
    }
];

const ultimosPedidos = [
    {
        id: '#1021',
        cliente: 'João Silva',
        status: 'Pago',
        valor: 'R$ 320,00',
        risco: 'Baixo'
    },
    {
        id: '#1020',
        cliente: 'Maria Souza',
        status: 'Reservado',
        valor: 'R$ 180,00',
        risco: 'Médio'
    },
    {
        id: '#1019',
        cliente: 'Ana Costa',
        status: 'Cancelado',
        valor: 'R$ 90,00',
        risco: 'Baixo'
    },
    {
        id: '#1018',
        cliente: 'Carlos Lima',
        status: 'Pendente',
        valor: 'R$ 450,00',
        risco: 'Alto'
    }
];

const movimentacoes = [
    {
        tipo: 'Crédito',
        descricao: 'Pagamento do pedido #1021',
        valor: '+R$ 320,00',
        status: 'Entrada'
    },
    {
        tipo: 'Débito',
        descricao: 'Estorno do pedido #1019',
        valor: '-R$ 90,00',
        status: 'Saída'
    },
    {
        tipo: 'Crédito',
        descricao: 'Pagamento do pedido #1018',
        valor: '+R$ 250,00',
        status: 'Entrada'
    }
];

const estoqueBaixo = [
    {
        produto: 'Camiseta Algodão',
        estoque: 3,
        status: 'Baixo'
    },
    {
        produto: 'Mouse Gamer',
        estoque: 2,
        status: 'Crítico'
    },
    {
        produto: 'Teclado Mecânico',
        estoque: 1,
        status: 'Crítico'
    },
    {
        produto: 'Coca Cola 2L',
        estoque: 4,
        status: 'Baixo'
    }
];

const riscoPedidos = [
    {
        label: 'Baixo risco',
        value: 18,
        color: 'bg-[#10b981]'
    },
    {
        label: 'Médio risco',
        value: 4,
        color: 'bg-[#f59e0b]'
    },
    {
        label: 'Alto risco',
        value: 2,
        color: 'bg-[#ef4444]'
    }
];

const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pago':
        case 'entrada':
        case 'baixo':
            return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20';
        case 'reservado':
            return 'bg-[#3b82f6]/10 text-[#60a5fa] border-[#3b82f6]/20';
        case 'pendente':
        case 'médio':
            return 'bg-[#f59e0b]/10 text-[#fbbf24] border-[#f59e0b]/20';
        case 'cancelado':
        case 'alto':
        case 'saída':
        case 'crítico':
            return 'bg-[#ef4444]/10 text-[#f87171] border-[#ef4444]/20';
        default:
            return 'bg-slate-800 text-slate-300 border-slate-700';
    }
};

const getMetricHighlightClass = (variant: string) => {
    switch (variant) {
        case 'success':
            return 'bg-[#10b981]/10 text-[#10b981]';
        case 'warning':
            return 'bg-[#f59e0b]/10 text-[#fbbf24]';
        case 'danger':
            return 'bg-[#ef4444]/10 text-[#f87171]';
        case 'info':
            return 'bg-[#a100ff]/10 text-[#d482ff]';
        default:
            return 'bg-[#1e1e1e] text-slate-400';
    }
};

export default function Dashboard() {
    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div>
                    <p className="text-[#a3f5ce] text-xs font-bold tracking-wider uppercase mb-2">
                        Painel Executivo
                    </p>

                    <h1 className="text-4xl font-bold text-white mb-2">
                        Olá, usuário!
                    </h1>

                    <p className="text-slate-400 text-sm max-w-3xl">
                        Acompanhe a operação da{' '}
                        <span className="text-white font-medium">
                            loja, pedidos, estoque, clientes, pagamentos e movimentações financeiras.
                        </span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-800 bg-[#111111] text-xs text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                        Operação saudável
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-800 bg-[#111111] text-xs text-slate-300">
                        <Clock className="w-3.5 h-3.5" />
                        Atualizado agora
                    </div>
                </div>
            </div>

            {/* Ações rápidas */}
            <section>
                <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <p className="text-slate-500 text-xs mb-1">Atalhos principais</p>
                        <h2 className="text-xl font-bold text-white">Ações rápidas</h2>
                    </div>

                    <span className="text-xs text-slate-500 bg-[#1a1a1a] px-3 py-1 rounded-full w-fit">
                        Fluxo principal: cliente, produto e pedido
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button className="h-12 justify-between bg-[#421d63] hover:bg-[#52257a] text-white border border-[#52257a] rounded-2xl px-5">
                        <span className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Novo Cliente
                        </span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>

                    <Button className="h-12 justify-between bg-[#421d63] hover:bg-[#52257a] text-white border border-[#52257a] rounded-2xl px-5">
                        <span className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Novo Produto
                        </span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>

                    <Button className="h-12 justify-between bg-[#a100ff] hover:bg-[#b933ff] text-white border border-[#a100ff] rounded-2xl px-5">
                        <span className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Novo Pedido
                        </span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </section>

            {/* Visão imediata */}
            <section>
                <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <p className="text-slate-500 text-xs mb-1">Visão imediata</p>
                        <h2 className="text-xl font-bold text-white">
                            Resumo da operação
                        </h2>
                    </div>

                    <span className="text-xs text-slate-500 bg-[#1a1a1a] px-3 py-1 rounded-full w-fit">
                        Prioridade: saldo, pedidos, estoque e risco
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {metricCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Card
                                key={card.title}
                                className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none hover:border-[#a100ff] transition-colors relative overflow-hidden min-h-[180px]"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                        {card.title}
                                        <Info className="w-3.5 h-3.5" />
                                    </div>

                                    <Icon className="w-8 h-8 text-slate-700 absolute right-4 top-4 opacity-60 stroke-1.5" />
                                </div>

                                <div className="text-3xl font-bold text-white mb-1">
                                    {card.value}
                                </div>

                                <div className="text-xs text-slate-500 mb-6">
                                    {card.description}
                                </div>

                                <div
                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs ${getMetricHighlightClass(
                                        card.variant
                                    )}`}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {card.highlight}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* Resumo operacional */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 bg-[#111111] border-[#2a2a2a] p-6 shadow-none flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                        <div>
                            <p className="text-slate-500 text-xs mb-1">Performance rápida</p>

                            <h3 className="text-xl font-bold text-white mb-2">
                                Análise da operação
                            </h3>

                            <p className="text-sm text-slate-400 max-w-3xl">
                                A loja possui pedidos pagos, pedidos pendentes e produtos com
                                estoque baixo. O saldo da empresa está positivo e a análise de
                                risco indica operação controlada.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 text-xs text-[#10b981] whitespace-nowrap">
                            <Activity className="w-3 h-3" />
                            Sistema ativo
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="border border-slate-800 rounded-xl p-4 bg-[#161616]">
                            <p className="text-xs text-slate-500 mb-1">Estoque</p>
                            <p className="text-[#fbbf24] font-semibold text-lg">
                                5 alertas
                            </p>
                        </div>

                        <div className="border border-slate-800 rounded-xl p-4 bg-[#161616]">
                            <p className="text-xs text-slate-500 mb-1">Pagamentos</p>
                            <p className="text-[#10b981] font-semibold text-lg">
                                24 confirmados
                            </p>
                        </div>

                        <div className="border border-slate-800 rounded-xl p-4 bg-[#161616]">
                            <p className="text-xs text-slate-500 mb-1">Risco</p>
                            <p className="text-[#d482ff] font-semibold text-lg">
                                Baixo
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#111111] border-[#2a2a2a] p-6 shadow-none relative overflow-hidden">
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-4">
                        Análise de Risco
                        <Info className="w-3.5 h-3.5" />
                    </div>

                    <div className="text-4xl font-bold text-white mb-2">Baixo</div>

                    <p className="text-sm text-slate-500 mb-6">
                        Resultado médio dos pedidos analisados
                    </p>

                    <div className="space-y-3">
                        {riscoPedidos.map((item) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-slate-400">{item.label}</span>
                                    <span className="text-white font-medium">{item.value}</span>
                                </div>

                                <div className="h-2 rounded-full bg-[#1e1e1e] overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.color}`}
                                        style={{
                                            width: `${Math.min(item.value * 5, 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <ShieldCheck className="w-14 h-14 text-slate-800 absolute right-6 top-8 opacity-50 stroke-1" />
                </Card>
            </div>

            {/* Tabelas principais */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Últimos pedidos */}
                <Card className="bg-[#111111] border-[#2a2a2a] p-0 shadow-none overflow-hidden">
                    <div className="p-6 pb-4 flex justify-between items-center border-b border-[#2a2a2a]">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Últimos Pedidos
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Pedidos mais recentes do sistema
                            </p>
                        </div>

                        <button className="text-[#a100ff] text-sm hover:underline flex items-center gap-1">
                            Ver pedidos
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="text-slate-500 border-b border-[#2a2a2a] text-xs font-semibold uppercase">
                                    <th className="font-medium p-4">Pedido</th>
                                    <th className="font-medium p-4">Cliente</th>
                                    <th className="font-medium p-4">Status</th>
                                    <th className="font-medium p-4">Valor</th>
                                    <th className="font-medium p-4">Risco</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#2a2a2a]">
                                {ultimosPedidos.map((pedido) => (
                                    <tr
                                        key={pedido.id}
                                        className="hover:bg-[#161616] transition-colors"
                                    >
                                        <td className="p-4 font-semibold text-slate-200">
                                            {pedido.id}
                                        </td>

                                        <td className="p-4 text-slate-400">
                                            {pedido.cliente}
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium ${getStatusClass(
                                                    pedido.status
                                                )}`}
                                            >
                                                {pedido.status}
                                            </span>
                                        </td>

                                        <td className="p-4 font-semibold text-[#10b981]">
                                            {pedido.valor}
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium ${getStatusClass(
                                                    pedido.risco
                                                )}`}
                                            >
                                                {pedido.risco}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Últimas movimentações */}
                <Card className="bg-[#111111] border-[#2a2a2a] p-0 shadow-none overflow-hidden">
                    <div className="p-6 pb-4 flex justify-between items-center border-b border-[#2a2a2a]">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Últimas Movimentações
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Entradas, saídas e estornos financeiros
                            </p>
                        </div>

                        <button className="text-[#a100ff] text-sm hover:underline flex items-center gap-1">
                            Ver contas
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="divide-y divide-[#2a2a2a]">
                        {movimentacoes.map((movimentacao, index) => (
                            <div
                                key={`${movimentacao.descricao}-${index}`}
                                className="p-5 flex items-center justify-between gap-4 hover:bg-[#161616] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${movimentacao.status === 'Entrada'
                                            ? 'bg-[#10b981]/10 text-[#10b981]'
                                            : 'bg-[#ef4444]/10 text-[#ef4444]'
                                            }`}
                                    >
                                        {movimentacao.status === 'Entrada' ? (
                                            <CreditCard className="w-5 h-5" />
                                        ) : (
                                            <RefreshCcw className="w-5 h-5" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {movimentacao.tipo}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {movimentacao.descricao}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p
                                        className={`text-sm font-bold ${movimentacao.status === 'Entrada'
                                            ? 'text-[#10b981]'
                                            : 'text-[#ef4444]'
                                            }`}
                                    >
                                        {movimentacao.valor}
                                    </p>

                                    <span
                                        className={`inline-flex mt-1 px-2 py-0.5 rounded-full border text-[11px] ${getStatusClass(
                                            movimentacao.status
                                        )}`}
                                    >
                                        {movimentacao.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </section>

            {/* Estoque baixo e diferencial */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Produtos com estoque baixo */}
                <Card className="bg-[#111111] border-[#2a2a2a] p-0 shadow-none overflow-hidden">
                    <div className="p-6 pb-4 flex justify-between items-center border-b border-[#2a2a2a]">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Produtos com Estoque Baixo
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Itens que precisam de reposição
                            </p>
                        </div>

                        <button className="text-[#a100ff] text-sm hover:underline flex items-center gap-1">
                            Ver estoque
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="divide-y divide-[#2a2a2a]">
                        {estoqueBaixo.map((item) => (
                            <div
                                key={item.produto}
                                className="p-5 flex items-center justify-between gap-4 hover:bg-[#161616] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#f59e0b]/10 text-[#fbbf24] flex items-center justify-center">
                                        <Package className="w-5 h-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {item.produto}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Estoque atual: {item.estoque} unidades
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium ${getStatusClass(
                                        item.status
                                    )}`}
                                >
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Diferencial: análise de risco */}
                <Card className="bg-[#111111] border-[#2a2a2a] p-6 shadow-none relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div>
                            <p className="text-slate-500 text-xs mb-1">
                                Funcionalidade diferencial
                            </p>

                            <h3 className="text-lg font-bold text-white">
                                Análise de Risco do Pedido
                            </h3>

                            <p className="text-sm text-slate-400 mt-2 max-w-xl">
                                O sistema avalia pedidos com base em valor, histórico do cliente,
                                quantidade de itens, estoque e regras internas antes da confirmação.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#a100ff]/10 text-xs text-[#d482ff] whitespace-nowrap">
                            <ShieldCheck className="w-3 h-3" />
                            Diferencial ativo
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="border border-slate-800 rounded-xl p-4 bg-[#161616]">
                            <p className="text-xs text-slate-500 mb-1">Baixo risco</p>
                            <p className="text-[#10b981] font-semibold text-2xl">18</p>
                        </div>

                        <div className="border border-slate-800 rounded-xl p-4 bg-[#161616]">
                            <p className="text-xs text-slate-500 mb-1">Médio risco</p>
                            <p className="text-[#fbbf24] font-semibold text-2xl">4</p>
                        </div>

                        <div className="border border-slate-800 rounded-xl p-4 bg-[#161616]">
                            <p className="text-xs text-slate-500 mb-1">Alto risco</p>
                            <p className="text-[#ef4444] font-semibold text-2xl">2</p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />

                        <div>
                            <p className="text-sm font-semibold text-white">
                                2 pedidos precisam de revisão
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                                Verifique pedidos de alto risco antes de confirmar pagamento ou reserva.
                            </p>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
}