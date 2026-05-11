import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

const topProducts = [
  { nome: 'Arroz 5kg', qtd: 129, faturamento: 'R$ 4.120,00', margem: 'R$ 1.140,00' },
  { nome: 'Coca cola 2L', qtd: 101, faturamento: 'R$ 3.020,00', margem: 'R$ 820,00' },
  { nome: 'Batata', qtd: 89, faturamento: 'R$ 1.980,00', margem: 'R$ 420,00' }
];

const categoryRevenue = [
  { categoria: 'Hortifruti', valor: 'R$ 8.420,00', percentual: 78 },
  { categoria: 'Bebidas', valor: 'R$ 6.150,00', percentual: 64 },
  { categoria: 'Mercearia', valor: 'R$ 11.250,00', percentual: 92 },
  { categoria: 'Limpeza', valor: 'R$ 4.200,00', percentual: 41 }
];

const topCustomers = [
  { nome: 'O nome', pedidos: 18, valor: 'R$ 4.580,00' },
  { nome: 'Maria Silva', pedidos: 14, valor: 'R$ 3.820,00' },
  { nome: 'João Pedro', pedidos: 11, valor: 'R$ 2.960,00' }
];

const lowStock = [
  { produto: 'Álcool Isopropílico', estoque: 4, minimo: 15 },
  { produto: 'Coca cola 2L', estoque: 7, minimo: 20 },
  { produto: 'Batata', estoque: 11, minimo: 25 },
  { produto: 'Sabão em pó', estoque: 3, minimo: 10 }
];

export default function Relatorios() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <p className="text-[#a3f5ce] text-xs font-bold tracking-wider uppercase mb-2">
            Relatórios Executivos
          </p>
          <h1 className="text-4xl font-bold text-white mb-2">Relatórios</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Acompanhe faturamento, pedidos, estoque e comportamento dos clientes em uma visão analítica pensada para apresentação.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-800 bg-[#111111] text-xs text-slate-300">
            <Clock3 className="w-3.5 h-3.5" />
            Atualizado agora
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-800 bg-[#111111] text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-[#d482ff]" />
            Visão financeira
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-slate-500 text-xs mb-1">Resumo geral</p>
            <h2 className="text-xl font-bold text-white">Indicadores principais</h2>
          </div>
          <span className="text-xs text-slate-500 bg-[#1a1a1a] px-3 py-1 rounded-full">
            Foco: faturamento, pedidos e estoque
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none hover:border-[#a100ff] transition-colors relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                Faturamento total <DollarSign className="w-3.5 h-3.5" />
              </div>
              <TrendingUp className="w-6 h-6 text-slate-600 absolute right-4 top-4 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">R$ 24.790,00</div>
            <div className="text-xs text-slate-500 mb-6">Receita consolidada do período</div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#10b981]/10 text-xs text-[#a7f3d0]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> +12,4% vs. mês anterior
            </div>
          </Card>

          <Card className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none hover:border-[#a100ff] transition-colors relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                Pedidos pagos <CreditCard className="w-3.5 h-3.5" />
              </div>
              <ShoppingCart className="w-6 h-6 text-slate-600 absolute right-4 top-4 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">67</div>
            <div className="text-xs text-slate-500 mb-6">Pedidos concluídos com sucesso</div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#1e1e1e] text-xs text-[#d482ff]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#a100ff]" /> Fluxo saudável
            </div>
          </Card>

          <Card className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none hover:border-[#a100ff] transition-colors relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                Pedidos cancelados <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <BarChart3 className="w-6 h-6 text-slate-600 absolute right-4 top-4 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">8</div>
            <div className="text-xs text-slate-500 mb-6">Pedidos não concluídos</div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#7f1d1d]/10 text-xs text-[#fecaca]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> Em acompanhamento
            </div>
          </Card>

          <Card className="bg-[#111111] border-[#2a2a2a] p-5 shadow-none hover:border-[#a100ff] transition-colors relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                Produtos com estoque baixo <Package className="w-3.5 h-3.5" />
              </div>
              <BriefcaseBusiness className="w-6 h-6 text-slate-600 absolute right-4 top-4 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">4</div>
            <div className="text-xs text-slate-500 mb-6">Itens que pedem reposição</div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#f59e0b]/10 text-xs text-[#fbbf24]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Atenção operacional
            </div>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-4">
        <Card className="bg-[#111111] border-[#2a2a2a] p-6 shadow-none overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-slate-500 text-xs mb-1">Gráfico principal</p>
              <h3 className="text-xl font-bold text-white">Faturamento por categoria</h3>
              <p className="text-sm text-slate-400 mt-1">Leitura visual do desempenho por linha de produto</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#a100ff]/10 text-xs text-[#d482ff] whitespace-nowrap">
              <TrendingUp className="w-3 h-3" /> Crescimento consistente
            </div>
          </div>

          <div className="space-y-4">
            {categoryRevenue.map(item => (
              <div key={item.categoria} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-200 font-medium">{item.categoria}</span>
                  <span className="text-slate-400">{item.valor}</span>
                </div>
                <div className="h-3 rounded-full bg-[#1a1a1a] overflow-hidden border border-[#2a2a2a]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#a100ff] to-[#d482ff]"
                    style={{ width: `${item.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="text-xs text-slate-500 mb-1">Receita líquida</div>
              <div className="text-white font-semibold">R$ 18.420,00</div>
            </div>
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="text-xs text-slate-500 mb-1">Ticket médio</div>
              <div className="text-white font-semibold">R$ 369,00</div>
            </div>
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="text-xs text-slate-500 mb-1">Margem estimada</div>
              <div className="text-[#a7f3d0] font-semibold">31,8%</div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#111111] border-[#2a2a2a] p-6 shadow-none">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-slate-500 text-xs mb-1">Painel lateral</p>
              <h3 className="text-xl font-bold text-white">Leituras rápidas</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#d482ff]">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Pedidos pagos</span>
                <span className="text-xs text-[#a7f3d0]">67</span>
              </div>
              <div className="h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div className="h-full w-[78%] bg-[#10b981] rounded-full" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Pedidos cancelados</span>
                <span className="text-xs text-[#fecaca]">8</span>
              </div>
              <div className="h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div className="h-full w-[22%] bg-[#ef4444] rounded-full" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Estoque baixo</span>
                <span className="text-xs text-[#fbbf24]">4</span>
              </div>
              <div className="h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div className="h-full w-[34%] bg-[#f59e0b] rounded-full" />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4 text-sm text-slate-300">
            Use esta coluna para destacar leituras, tendências e alertas rápidos da operação.
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="bg-[#111111] border-[#2a2a2a] p-0 shadow-none overflow-hidden">
          <div className="p-6 pb-4 flex justify-between items-center border-b border-[#2a2a2a]">
            <div>
              <h3 className="text-lg font-bold text-white">Top 3 produtos mais vendidos</h3>
              <p className="text-xs text-slate-500 mt-1">Quantidade, faturamento e margem por item</p>
            </div>
            <button className="text-[#a100ff] text-sm hover:underline flex items-center gap-1">
              Ver catálogo <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-[#2a2a2a] text-xs font-semibold uppercase">
                  <th className="font-medium p-6 py-4">Produto</th>
                  <th className="font-medium p-4">Qtd. vendida</th>
                  <th className="font-medium p-4">Faturamento</th>
                  <th className="font-medium p-4">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {topProducts.map((item, index) => (
                  <tr key={item.nome} className="hover:bg-[#161616] transition-colors">
                    <td className="p-6 py-4 font-medium text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#d482ff] text-xs font-bold">
                          {index + 1}
                        </div>
                        {item.nome}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{item.qtd}</td>
                    <td className="p-4 font-semibold text-[#10b981]">{item.faturamento}</td>
                    <td className="p-4 font-semibold text-[#d482ff]">{item.margem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="bg-[#111111] border-[#2a2a2a] p-0 shadow-none overflow-hidden">
          <div className="p-6 pb-4 flex justify-between items-center border-b border-[#2a2a2a]">
            <div>
              <h3 className="text-lg font-bold text-white">Clientes com mais pedidos</h3>
              <p className="text-xs text-slate-500 mt-1">Ranking dos clientes mais ativos</p>
            </div>
            <button className="text-[#a100ff] text-sm hover:underline flex items-center gap-1">
              Ver clientes <Users className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {topCustomers.map((cliente, index) => (
              <div key={cliente.nome} className="p-5 flex items-center justify-between gap-4 hover:bg-[#161616] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-slate-300 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{cliente.nome}</p>
                    <p className="text-xs text-slate-500">{cliente.pedidos} pedidos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#a7f3d0]">{cliente.valor}</p>
                  <p className="text-xs text-slate-500">Faturamento acumulado</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-4">
        <Card className="bg-[#111111] border-[#2a2a2a] p-0 shadow-none overflow-hidden">
          <div className="p-6 pb-4 flex justify-between items-center border-b border-[#2a2a2a]">
            <div>
              <h3 className="text-lg font-bold text-white">Estoque baixo</h3>
              <p className="text-xs text-slate-500 mt-1">Produtos que precisam reposição urgente</p>
            </div>
            <button className="text-[#a100ff] text-sm hover:underline flex items-center gap-1">
              Ver estoque <Package className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-[#2a2a2a] text-xs font-semibold uppercase">
                  <th className="font-medium p-6 py-4">Produto</th>
                  <th className="font-medium p-4">Estoque</th>
                  <th className="font-medium p-4">Mínimo</th>
                  <th className="font-medium p-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {lowStock.map(item => (
                  <tr key={item.produto} className="hover:bg-[#161616] transition-colors">
                    <td className="p-6 py-4 font-medium text-slate-200">{item.produto}</td>
                    <td className="p-4 text-[#fbbf24] font-semibold">{item.estoque}</td>
                    <td className="p-4 text-slate-400">{item.minimo}</td>
                    <td className="p-4">
                      <button className="text-[#d482ff] text-sm hover:underline flex items-center gap-1">
                        Solicitar reposição <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="bg-[#111111] border-[#2a2a2a] p-6 shadow-none">
          <h3 className="text-lg font-bold text-white mb-4">Leitura executiva</h3>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                <TrendingUp className="w-4 h-4 text-[#10b981]" />
                Crescimento positivo
              </div>
              <p className="text-xs text-slate-500">Faturamento em alta, puxado por mercearia e bebidas.</p>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                <TrendingDown className="w-4 h-4 text-[#ef4444]" />
                Cancelamentos sob controle
              </div>
              <p className="text-xs text-slate-500">Manter o fluxo de reserva e pagamento reduz falhas.</p>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                <Package className="w-4 h-4 text-[#fbbf24]" />
                Estoque em atenção
              </div>
              <p className="text-xs text-slate-500">Produtos-chave precisam de reposição antes do próximo pico.</p>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                <Users className="w-4 h-4 text-[#d482ff]" />
                Base de clientes ativa
              </div>
              <p className="text-xs text-slate-500">Clientes recorrentes seguem concentrando boa parte do faturamento.</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
