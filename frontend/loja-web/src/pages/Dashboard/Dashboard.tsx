import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Target,
  CreditCard,
  Trophy,
  Package,
  TrendingDown,
  Wallet,
  Clock,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

export default function Dashboard() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">

      {/* Header - Painel Executivo */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <p className="text-[#a3f5ce] text-xs font-bold tracking-wider uppercase mb-2">Painel Executivo</p>
          <h1 className="text-4xl font-bold text-white mb-2">Olá, usuário!</h1>
          <p className="text-slate-400 text-sm">
            Acompanhe a operação da <span className="text-white font-medium"> loja, pedidos, estoque e movimentações financeiras.</span> com base em fluxos de caixa efetivados.
          </p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Visão Imediata */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-slate-500 text-xs mb-1">Visão imediata</p>
            <h2 className="text-xl font-bold text-white">Resumo de Vendas e Resultado</h2>
          </div>
          <span className="text-xs text-slate-500 bg-[#1a1a1a] px-3 py-1 rounded-full">
            Prioridade: receita, lucro e pedidos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none hover:border-[#a100ff] transition-colors relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                Faturamento (Mês) <Info className="w-3.5 h-3.5" />
              </div>
              <DollarSign className="w-6 h-6 text-slate-600 absolute right-4 top-4 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">R$ 0,00</div>
            <div className="text-xs text-slate-500 mb-6">Receita do mês atual</div>
            <div className="text-xs text-slate-500">0% vs mês anterior</div>
          </Card>

          <Card className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none hover:border-[#a100ff] transition-colors relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                Lucro Líquido (Mês) <Info className="w-3.5 h-3.5" />
              </div>
              <TrendingUp className="w-6 h-6 text-slate-600 absolute right-4 top-4 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">R$ 0,00</div>
            <div className="text-xs text-slate-500 mb-6">Faturamento - Custos (Mês)</div>
            <div className="text-xs text-slate-500">0% vs mês anterior</div>
          </Card>

          <Card className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none hover:border-[#a100ff] transition-colors relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                Pedidos Concluídos <Info className="w-3.5 h-3.5" />
              </div>
              <Target className="w-6 h-6 text-slate-600 absolute right-4 top-4 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">67</div>
            <div className="text-xs text-slate-500 mb-6">Vendas registradas no período</div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#a100ff]/10 text-xs text-[#d482ff]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#a100ff]" /> Primeiro mês
            </div>
          </Card>

          <Card className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none hover:border-[#a100ff] transition-colors relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                Ticket Médio <Info className="w-3.5 h-3.5" />
              </div>
              <CreditCard className="w-6 h-6 text-slate-600 absolute right-4 top-4 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">R$ 0,00</div>
            <div className="text-xs text-slate-500 mb-6">Valor médio por venda</div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#1e1e1e] text-xs text-[#a100ff]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#a100ff]" /> Primeiro mês
            </div>
          </Card>
        </div>
      </section>

      {/* Performance rápida */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-[#111111] border-[#2a2a2a] p-6 shadow-none flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-xs mb-1">Performance rápida</p>
              <h3 className="text-xl font-bold text-white mb-2">Análise Diária</h3>
              <p className="text-sm text-slate-400">
                Receita e lucro indicam avanço em relação ao período anterior. Mantenha o ritmo das vendas ativas.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 text-xs text-[#10b981] whitespace-nowrap">
              <TrendingUp className="w-3 h-3" /> Dia positivo
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="border border-slate-800 rounded-lg p-3 bg-[#161616]">
              <p className="text-xs text-slate-500 mb-1">Tendência Receita</p>
              <p className="text-[#10b981] font-semibold text-lg">+0.0%</p>
            </div>
            <div className="border border-slate-800 rounded-lg p-3 bg-[#161616]">
              <p className="text-xs text-slate-500 mb-1">Tendência Lucro</p>
              <p className="text-[#10b981] font-semibold text-lg">+0.0%</p>
            </div>
            <div className="border border-slate-800 rounded-lg p-3 bg-[#161616]">
              <p className="text-xs text-slate-500 mb-1">Score do Dia</p>
              <p className="text-[#10b981] font-semibold text-lg">+0%</p>
            </div>
          </div>
        </Card>

        <Card className="bg-[#111111] border-[#2a2a2a] p-6 shadow-none relative">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-4">
            Margem de Lucro <Info className="w-3.5 h-3.5" />
          </div>
          <div className="text-4xl font-bold text-white mb-2">0.0%</div>
          <p className="text-sm text-slate-500 mb-8">Eficiência do resultado</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1e1e1e] text-xs font-medium text-[#a100ff]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#a100ff]" /> Primeiro mês
          </div>
          <Trophy className="w-12 h-12 text-slate-800 absolute right-6 top-8 opacity-40 stroke-1" />
        </Card>
      </div>

      {/* Operação e Compromissos */}
      <section>
        <div className="mb-4">
          <p className="text-slate-500 text-xs mb-1">Operação e compromissos</p>
          <h2 className="text-xl font-bold text-white">Estoque, custos e obrigações</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-2">
              Estoque Total <Info className="w-3.5 h-3.5" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">R$ 29.402,00</div>
            <div className="text-xs text-slate-500 mb-6">Patrimônio em produtos</div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#a100ff]/10 text-xs text-[#d482ff]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#a100ff]" /> Primeiro mês
            </div>
            <Package className="w-10 h-10 text-slate-800 absolute right-4 top-4 stroke-1 opacity-50" />
          </Card>

          <Card className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-2">
              Custos Pagos (Mês) <Info className="w-3.5 h-3.5" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">R$ 0,00</div>
            <div className="text-xs text-slate-500 mb-6">Saídas confirmadas</div>
            <div className="text-xs text-slate-500">0% vs mês anterior</div>
            <TrendingDown className="w-10 h-10 text-slate-800 absolute right-4 top-4 stroke-1 opacity-50" />
          </Card>

          <Card className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-2">
              Parcelas a Pagar <Info className="w-3.5 h-3.5" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">R$ 60,00</div>
            <div className="text-xs text-slate-500 mb-6">Compromissos futuros</div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#1e1e1e] text-xs text-[#a100ff]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#a100ff]" /> Primeiro mês
            </div>
            <Wallet className="w-10 h-10 text-slate-800 absolute right-4 top-4 stroke-1 opacity-50" />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 bg-[#111111] border-[#2a2a2a] p-6 shadow-none flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Desempenho Mensal</h3>
                <p className="text-sm text-slate-500">Faturamento vs Custos Pagos</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5 text-slate-400"><div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Faturamento</div>
                <div className="flex items-center gap-1.5 text-slate-400"><div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Custos Pagos</div>
              </div>
            </div>
            <div className="flex-1 w-full relative min-h-[200px]">
              {/* Dummy Chart Setup using CSS and SVG curves to mimic the image */}
              <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-600 pb-6 pr-4">
                <div className="flex items-center border-b border-dashed border-slate-800 w-full pb-1"><span className="w-12">R$ 22k</span></div>
                <div className="flex items-center border-b border-dashed border-slate-800 w-full pb-1"><span className="w-12">R$ 17k</span></div>
                <div className="flex items-center border-b border-dashed border-slate-800 w-full pb-1"><span className="w-12">R$ 11k</span></div>
                <div className="flex items-center border-b border-dashed border-slate-800 w-full pb-1"><span className="w-12">R$ 6k</span></div>
                <div className="flex items-center border-b border-slate-700 w-full pb-1"><span className="w-12 text-slate-500">R$ 0</span></div>
              </div>

              {/* SVG Line Mimicking the curves */}
              <svg className="absolute inset-0 w-full h-[calc(100%-1.5rem)] pt-2 pl-12 preserve-3d" preserveAspectRatio="none" viewBox="0 0 1000 200">
                <defs>
                  <linearGradient id="glowX" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="glowY" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 0 150 Q 80 0 160 30 T 300 198 L 1000 198" fill="none" stroke="#10b981" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                <path d="M 0 198 Q 180 190 240 100 T 350 198 L 1000 198" fill="url(#glowY)" stroke="#ef4444" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              </svg>

              {/* X Axis Labels */}
              <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-slate-600 px-4 mt-2">
                <span>dez</span>
                <span>jan</span>
                <span>fev</span>
                <span>mar</span>
                <span>abr</span>
                <span>mai</span>
              </div>
            </div>
          </Card>

          <Card className="bg-[#111111] border-[#2a2a2a] p-6 shadow-none">
            <h3 className="text-lg font-bold text-white mb-6">Métodos de Pagamento</h3>
            <div className="flex items-center justify-center h-48">
              <p className="text-slate-600 text-sm">Sem dados suficientes</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Produtos Mais Vendidos Table */}
      <Card className="bg-[#111111] border-[#2a2a2a] p-0 shadow-none overflow-hidden mt-8">
        <div className="p-6 pb-4 flex justify-between items-center border-b border-[#2a2a2a]">
          <h3 className="text-lg font-bold text-white">Produtos Mais Vendidos</h3>
          <button className="text-[#a100ff] text-sm hover:underline flex items-center gap-1">Ver todas as vendas <TrendingUp className="w-3 h-3" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-[#2a2a2a] text-xs font-semibold uppercase">
                <th className="font-medium p-6 py-4">Produto</th>
                <th className="font-medium p-4">Qtd. Vendida</th>
                <th className="font-medium p-4">Faturamento</th>
                <th className="font-medium p-4">Lucro Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {[
                { name: 'Alcool Isopropilico', qtd: 129, fat: 'R$ 2.838', lucro: 'R$ 258' },
                { name: 'Camiseta Algodao', qtd: 101, fat: 'R$ 4.029,9', lucro: 'R$ 2.514,9' },
                { name: 'Camisa Camisada', qtd: 101, fat: 'R$ 8.080', lucro: 'R$ 3.030' },
                { name: 'Coca cola 2L', qtd: 66, fat: 'R$ 653,94', lucro: 'R$ 143,94' },
                { name: 'Coca Cola 2L', qtd: 49, fat: 'R$ 440,51', lucro: 'R$ 171,01' },
                { name: 'Calca Jeans', qtd: 42, fat: 'R$ 5.455,8', lucro: 'R$ 2.515,8' },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-[#161616] transition-colors">
                  <td className="p-6 py-4 font-medium text-slate-200">{item.name}</td>
                  <td className="p-4 text-slate-400">{item.qtd}</td>
                  <td className="p-4 font-semibold text-[#10b981]">{item.fat}</td>
                  <td className="p-4 font-semibold text-[#d482ff]">{item.lucro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
