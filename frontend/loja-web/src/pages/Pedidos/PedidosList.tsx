import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Barcode,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  CreditCard,
  Filter,
  Package,
  PackageCheck,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  User,
  Wallet
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

type PedidoStatus = 'ABERTO' | 'RESERVADO' | 'PAGO' | 'CANCELADO' | 'FALHOU';
type ScreenMode = 'list' | 'create' | 'detail';
type CreateStep = 1 | 2 | 3;

type ClienteResumo = {
  id: string;
  nome: string;
  saldoDisponivel: string;
  documento: string;
  telefone: string;
  cidade: string;
};

type ProdutoResumo = {
  id: string;
  nome: string;
  sku: string;
  categoria: string;
  preco: string;
  estoque: string;
};

type PedidoItem = {
  produto: string;
  quantidade: number;
  precoUnitario: string;
  subtotal: string;
};

type PedidoResumo = {
  id: string;
  numero: string;
  cliente: string;
  data: string;
  status: PedidoStatus;
  total: string;
  clienteSaldo: string;
  empresaSaldo: string;
  dataPagamento?: string;
  itens: PedidoItem[];
  desconto: string;
  totalBruto: string;
  totalFinal: string;
};

const statusOptions: PedidoStatus[] = ['ABERTO', 'RESERVADO', 'PAGO', 'CANCELADO', 'FALHOU'];

const clientesMock: ClienteResumo[] = [
  {
    id: '1',
    nome: 'O nome',
    saldoDisponivel: 'R$ 1.250,00',
    documento: '000.000.000-00',
    telefone: '(00) 00000-0000',
    cidade: 'São Paulo'
  },
  {
    id: '2',
    nome: 'Maria Silva',
    saldoDisponivel: 'R$ 2.580,00',
    documento: '111.111.111-11',
    telefone: '(11) 98888-0000',
    cidade: 'Campinas'
  }
];

const produtosMock: ProdutoResumo[] = [
  { id: '1', nome: 'Batata', sku: 'BAT-001', categoria: 'Hortifruti', preco: 'R$ 8,90', estoque: '120 un.' },
  { id: '2', nome: 'Arroz 5kg', sku: 'ARR-050', categoria: 'Mercearia', preco: 'R$ 32,50', estoque: '48 un.' },
  { id: '3', nome: 'Coca cola 2L', sku: 'REF-220', categoria: 'Bebidas', preco: 'R$ 9,99', estoque: '85 un.' }
];

const pedidosMock: PedidoResumo[] = [
  {
    id: '1',
    numero: 'PED-1024',
    cliente: 'O nome',
    data: '09/05/2026',
    status: 'ABERTO',
    total: 'R$ 145,00',
    clienteSaldo: 'R$ 1.250,00',
    empresaSaldo: 'R$ 29.402,00',
    itens: [
      { produto: 'Batata', quantidade: 3, precoUnitario: 'R$ 8,90', subtotal: 'R$ 26,70' },
      { produto: 'Arroz 5kg', quantidade: 2, precoUnitario: 'R$ 32,50', subtotal: 'R$ 65,00' }
    ],
    desconto: 'R$ 0,00',
    totalBruto: 'R$ 145,00',
    totalFinal: 'R$ 145,00'
  },
  {
    id: '2',
    numero: 'PED-1025',
    cliente: 'Maria Silva',
    data: '08/05/2026',
    status: 'RESERVADO',
    total: 'R$ 89,90',
    clienteSaldo: 'R$ 2.580,00',
    empresaSaldo: 'R$ 29.402,00',
    dataPagamento: '-',
    itens: [
      { produto: 'Coca cola 2L', quantidade: 4, precoUnitario: 'R$ 9,99', subtotal: 'R$ 39,96' },
      { produto: 'Batata', quantidade: 5, precoUnitario: 'R$ 8,90', subtotal: 'R$ 44,50' }
    ],
    desconto: 'R$ 5,00',
    totalBruto: 'R$ 94,90',
    totalFinal: 'R$ 89,90'
  }
];

const statusStyles: Record<PedidoStatus, string> = {
  ABERTO: 'bg-[#4a136f] text-[#e8c7ff] border-[#5b148a]',
  RESERVADO: 'bg-[#1e3a8a] text-[#dbeafe] border-[#3b82f6]',
  PAGO: 'bg-[#064e3b] text-[#a7f3d0] border-[#10b981]',
  CANCELADO: 'bg-[#7f1d1d] text-[#fecaca] border-[#ef4444]',
  FALHOU: 'bg-[#581c87] text-[#f3e8ff] border-[#c084fc]'
};

const inputClassName =
  'w-full bg-[#2a2a2a] h-12 rounded-full px-4 text-sm text-white placeholder-slate-400 border border-transparent focus:border-[#c000ff] focus:outline-none transition-colors';

const stepLabelStyles = (active: boolean, completed: boolean) =>
  active
    ? 'bg-[#c000ff] text-white border-[#c000ff]'
    : completed
      ? 'bg-[#4a136f] text-[#f2dcff] border-[#5b148a]'
      : 'bg-[#1e1e1e] text-slate-400 border-[#2a2a2a]';

export default function PedidosList() {
  const [screen, setScreen] = useState<ScreenMode>('list');
  const [createStep, setCreateStep] = useState<CreateStep>(1);
  const [expandedStatus, setExpandedStatus] = useState<PedidoStatus>('ABERTO');
  const [selectedPedidoId, setSelectedPedidoId] = useState('1');
  const [selectedClientId, setSelectedClientId] = useState('1');
  const [selectedProductId, setSelectedProductId] = useState('1');
  const [expandedRowId, setExpandedRowId] = useState<string | null>('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [clienteSearch, setClienteSearch] = useState('');

  const selectedPedido = useMemo(
    () => pedidosMock.find(pedido => pedido.id === selectedPedidoId) ?? pedidosMock[0],
    [selectedPedidoId]
  );

  const selectedCliente = useMemo(
    () => clientesMock.find(cliente => cliente.id === selectedClientId) ?? clientesMock[0],
    [selectedClientId]
  );

  const selectedProduto = useMemo(
    () => produtosMock.find(produto => produto.id === selectedProductId) ?? produtosMock[0],
    [selectedProductId]
  );

  const filteredPedidos = pedidosMock.filter(pedido => {
    const matchesStatus = pedido.status === expandedStatus;
    const matchesSearch =
      searchTerm.trim().length === 0 ||
      pedido.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const filteredClientes = clientesMock.filter(cliente =>
    cliente.nome.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    cliente.documento.toLowerCase().includes(clienteSearch.toLowerCase())
  );

  const filteredProdutos = produtosMock.filter(produto =>
    produto.nome.toLowerCase().includes(productSearch.toLowerCase()) ||
    produto.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const currentCreateTotal = 'R$ 145,00';

  const startCreateFlow = () => {
    setCreateStep(1);
    setScreen('create');
  };

  const openPedidoDetail = (pedidoId: string) => {
    setSelectedPedidoId(pedidoId);
    setScreen('detail');
  };

  const renderStatusChip = (status: PedidoStatus) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );

  const renderActionButtons = (status: PedidoStatus, compact = false) => {
    const baseClass = compact ? 'h-9 px-3 rounded-full text-xs' : 'h-10 px-4 rounded-full text-sm';

    if (status === 'ABERTO') {
      return (
        <div className="flex flex-wrap gap-2 justify-end">
          <Button className={`bg-[#1e3a8a] hover:bg-[#2246a8] text-white ${baseClass}`}>
            <PackageCheck className="w-4 h-4 mr-2" />
            Reservar
          </Button>
          <Button className={`bg-[#7f1d1d] hover:bg-[#991b1b] text-white ${baseClass}`}>
            <Ban className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      );
    }

    if (status === 'RESERVADO') {
      return (
        <div className="flex flex-wrap gap-2 justify-end">
          <Button className={`bg-[#064e3b] hover:bg-[#0f766e] text-white ${baseClass}`}>
            <CreditCard className="w-4 h-4 mr-2" />
            Pagar
          </Button>
          <Button className={`bg-[#7f1d1d] hover:bg-[#991b1b] text-white ${baseClass}`}>
            <Ban className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      );
    }

    if (status === 'PAGO') {
      return (
        <div className="flex flex-wrap gap-2 justify-end">
          <Button className={`bg-[#7f1d1d] hover:bg-[#991b1b] text-white ${baseClass}`}>
            <Ban className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 justify-end">
        <Button className={`bg-[#4a136f] hover:bg-[#5b148a] text-white ${baseClass}`}>
          <Sparkles className="w-4 h-4 mr-2" />
          Ver pedido
        </Button>
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex w-full mb-5 relative">
        <input
          type="text"
          placeholder="Buscar por cliente ou número do pedido"
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
          className="w-full h-12 bg-[#1a1a1a] rounded-full px-6 pr-14 text-slate-200 placeholder-slate-500 border border-transparent focus:border-[#c000ff] focus:outline-none transition-colors"
        />

        <button className="absolute right-0 top-0 h-12 w-12 bg-[#c000ff] rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all border border-transparent focus:border-[#c000ff] outline-none focus:outline-none">
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-300">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-white">Pedidos</h1>
          </div>
          <p className="text-slate-300">Lista de pedidos da operação</p>
        </div>

        <Button
          onClick={startCreateFlow}
          className="bg-[#421d63] hover:bg-[#52257a] text-white border border-[#52257a] focus:border-[#c000ff] gap-2 rounded-xl h-11 px-5 outline-none focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          Criar pedido
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 px-4 h-11 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-slate-300 text-sm">
          <Filter className="w-4 h-4" />
          Filtro por status:
        </div>
        {statusOptions.map(status => (
          <button
            key={status}
            onClick={() => setExpandedStatus(status)}
            className={`px-4 h-11 rounded-full border text-sm font-semibold transition-colors ${expandedStatus === status
                ? 'bg-[#c000ff] text-white border-[#c000ff]'
                : 'bg-[#1a1a1a] text-slate-300 border-[#2a2a2a] hover:border-[#5b148a]'
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="rounded-[20px] overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl shadow-black/20">
        <div className="p-5 border-b border-[#2a2a2a] flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white font-semibold text-lg">Pedidos {expandedStatus}</h2>
            <p className="text-xs text-slate-400 mt-1">Acompanhe o status, total e ações por pedido</p>
          </div>
          <div className="text-xs text-slate-400">{filteredPedidos.length} pedidos encontrados</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="text-slate-500 border-b border-[#2a2a2a] text-xs font-semibold uppercase">
                <th className="font-medium p-5">Nº do pedido</th>
                <th className="font-medium p-5">Cliente</th>
                <th className="font-medium p-5">Data</th>
                <th className="font-medium p-5">Status</th>
                <th className="font-medium p-5">Total</th>
                <th className="font-medium p-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredPedidos.map(pedido => {
                const isExpanded = expandedRowId === pedido.id;

                return (
                  <>
                    <tr key={pedido.id} className="hover:bg-[#161616] transition-colors">
                      <td className="p-5 font-medium text-slate-100">{pedido.numero}</td>
                      <td className="p-5 text-slate-300">{pedido.cliente}</td>
                      <td className="p-5 text-slate-300">{pedido.data}</td>
                      <td className="p-5">{renderStatusChip(pedido.status)}</td>
                      <td className="p-5 font-semibold text-[#d482ff]">{pedido.total}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            onClick={() => openPedidoDetail(pedido.id)}
                            className="bg-[#4a136f] hover:bg-[#5b148a] text-white rounded-full h-9 px-4 text-xs"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Ver pedido
                          </Button>
                          {renderActionButtons(pedido.status, true)}
                          <button
                            onClick={() => setExpandedRowId(isExpanded ? null : pedido.id)}
                            className="w-9 h-9 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center text-slate-300 hover:border-[#5b148a]"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="p-5 bg-[#0f0f0f]">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="rounded-2xl border border-[#2a2a2a] bg-[#161616] p-4">
                              <div className="text-xs text-slate-500 mb-2">Cliente</div>
                              <div className="text-white font-semibold">{pedido.cliente}</div>
                              <div className="text-sm text-slate-400 mt-1">Saldo cliente: {pedido.clienteSaldo}</div>
                            </div>
                            <div className="rounded-2xl border border-[#2a2a2a] bg-[#161616] p-4">
                              <div className="text-xs text-slate-500 mb-2">Resumo financeiro</div>
                              <div className="text-sm text-slate-300">Total bruto: {pedido.totalBruto}</div>
                              <div className="text-sm text-slate-300">Desconto: {pedido.desconto}</div>
                              <div className="text-sm text-slate-300">Total final: {pedido.totalFinal}</div>
                            </div>
                            <div className="rounded-2xl border border-[#2a2a2a] bg-[#161616] p-4">
                              <div className="text-xs text-slate-500 mb-2">Empresa</div>
                              <div className="text-sm text-slate-300">Saldo da empresa: {pedido.empresaSaldo}</div>
                              <div className="text-sm text-slate-300 mt-1">Impacto financeiro: aprovar / estornar conforme o fluxo</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCreateView = () => {
    if (createStep === 1) {
      return (
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Button onClick={() => setScreen('list')} className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white rounded-full h-11 px-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="text-slate-400 text-sm">Pedidos → Criar Pedido → Selecionar Cliente</div>
          </div>

          <div className="rounded-[20px] overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl shadow-black/20">
            <div className="bg-[#5b148a] px-5 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-lg">Criar pedido</h2>
                <p className="text-white/70 text-sm mt-0.5">Etapa 1: Selecionar Cliente</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 border border-white/20">1</span>
                <span className="hidden sm:inline">Selecionar Cliente</span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-100">Campo para buscar cliente</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Selecione o cliente antes de adicionar itens</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={clienteSearch}
                    onChange={event => setClienteSearch(event.target.value)}
                    placeholder="Buscar cliente por nome, CPF ou telefone"
                    className={inputClassName}
                  />

                  <div className="space-y-3">
                    {filteredClientes.map(cliente => {
                      const isSelected = cliente.id === selectedClientId;

                      return (
                        <button
                          key={cliente.id}
                          onClick={() => setSelectedClientId(cliente.id)}
                          className={`w-full text-left rounded-2xl border p-4 transition-colors ${isSelected ? 'border-[#c000ff] bg-[#181818]' : 'border-[#2a2a2a] bg-[#151515] hover:border-[#5b148a]'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-white font-medium">{cliente.nome}</div>
                                <div className="text-xs text-slate-400 mt-1">{cliente.documento} · {cliente.telefone}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500">Saldo disponível</div>
                              <div className="text-sm font-semibold text-[#a7f3d0]">{cliente.saldoDisponivel}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <aside className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5 h-fit">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                      <BadgeCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-100">Dados resumidos do cliente</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Resumo do cliente selecionado</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3"><span className="text-slate-400">Cliente</span><span className="text-white font-medium text-right">{selectedCliente.nome}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-400">Telefone</span><span className="text-white font-medium text-right">{selectedCliente.telefone}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-400">Cidade</span><span className="text-white font-medium text-right">{selectedCliente.cidade}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-400">Saldo disponível</span><span className="text-[#a7f3d0] font-semibold text-right">{selectedCliente.saldoDisponivel}</span></div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#2a2a2a] bg-[#111111] p-4">
                    <div className="text-xs text-slate-500 mb-2">Fluxo</div>
                    <div className="text-sm text-slate-200">Selecionar cliente → Adicionar itens</div>
                  </div>
                </aside>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setCreateStep(2)} className="bg-[#c000ff] hover:bg-[#da3dff] text-white rounded-full h-12 px-6 font-semibold">
                  Próxima etapa
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (createStep === 2) {
      return (
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Button onClick={() => setCreateStep(1)} className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white rounded-full h-11 px-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="text-slate-400 text-sm">Pedidos → Criar Pedido → Adicionar Itens</div>
          </div>

          <div className="rounded-[20px] overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl shadow-black/20">
            <div className="bg-[#5b148a] px-5 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-lg">Criar pedido</h2>
                <p className="text-white/70 text-sm mt-0.5">Etapa 2: Adicionar Itens</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border ${stepLabelStyles(false, true)}`}>1</span>
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border ${stepLabelStyles(true, false)}`}>2</span>
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border ${stepLabelStyles(false, false)}`}>3</span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                          <Search className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-100">Busca de produto</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Localize o item para adicionar ao pedido</p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={productSearch}
                        onChange={event => setProductSearch(event.target.value)}
                        placeholder="Buscar produto por nome ou SKU"
                        className={inputClassName}
                      />
                    </div>

                    <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-100">Produto selecionado</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Dados rápidos do item</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-3"><span className="text-slate-400">Nome</span><span className="text-white">{selectedProduto.nome}</span></div>
                        <div className="flex justify-between gap-3"><span className="text-slate-400">SKU</span><span className="text-white">{selectedProduto.sku}</span></div>
                        <div className="flex justify-between gap-3"><span className="text-slate-400">Preço</span><span className="text-[#d482ff] font-semibold">{selectedProduto.preco}</span></div>
                        <div className="flex justify-between gap-3"><span className="text-slate-400">Estoque</span><span className="text-white">{selectedProduto.estoque}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredProdutos.map(produto => {
                      const isSelected = produto.id === selectedProductId;

                      return (
                        <button
                          key={produto.id}
                          onClick={() => setSelectedProductId(produto.id)}
                          className={`w-full text-left rounded-2xl border p-4 transition-colors ${isSelected ? 'border-[#c000ff] bg-[#181818]' : 'border-[#2a2a2a] bg-[#151515] hover:border-[#5b148a]'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                                <Barcode className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-white font-medium">{produto.nome}</div>
                                <div className="text-xs text-slate-400 mt-1">{produto.categoria} · {produto.sku}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500">Preço</div>
                              <div className="text-sm font-semibold text-[#a7f3d0]">{produto.preco}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <aside className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5 h-fit">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-100">Itens adicionados</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Resumo parcial do pedido</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3"><span className="text-slate-400">Subtotal</span><span className="text-white font-medium">R$ 145,00</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-400">Desconto</span><span className="text-white font-medium">R$ 0,00</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-400">Total final</span><span className="text-[#d482ff] font-semibold">{currentCreateTotal}</span></div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#2a2a2a] bg-[#111111] p-4 space-y-2 text-sm text-slate-300">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> {selectedProduto.nome} pronto para adicionar</div>
                    <div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-[#d482ff]" /> Saldo do cliente será validado ao revisar</div>
                  </div>
                </aside>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-between mt-6">
                <Button onClick={() => setCreateStep(1)} className="bg-[#4a136f] hover:bg-[#5b148a] text-white rounded-full h-12 px-6">
                  Voltar
                </Button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-[#1e3a8a] hover:bg-[#2246a8] text-white rounded-full h-12 px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar item
                  </Button>
                  <Button onClick={() => setCreateStep(3)} className="bg-[#c000ff] hover:bg-[#da3dff] text-white rounded-full h-12 px-6 font-semibold">
                    Revisar pedido
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <Button onClick={() => setCreateStep(2)} className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white rounded-full h-11 px-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-slate-400 text-sm">Pedidos → Criar Pedido → Revisar Pedido</div>
        </div>

        <div className="rounded-[20px] overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl shadow-black/20">
          <div className="bg-[#5b148a] px-5 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg">Criar pedido</h2>
              <p className="text-white/70 text-sm mt-0.5">Etapa 3: Revisar Pedido</p>
            </div>
            <div className="text-xs font-semibold text-white/80">Status inicial: ABERTO</div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
                <div className="text-xs text-slate-500 mb-2">Cliente</div>
                <div className="text-white font-semibold">{selectedCliente.nome}</div>
                <div className="text-sm text-slate-400 mt-1">{selectedCliente.telefone}</div>
              </div>

              <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
                <div className="text-xs text-slate-500 mb-2">Itens</div>
                <div className="text-white font-semibold">2 itens</div>
                <div className="text-sm text-slate-400 mt-1">{selectedProduto.nome} + outros itens</div>
              </div>

              <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
                <div className="text-xs text-slate-500 mb-2">Valores</div>
                <div className="text-white font-semibold">Total final {currentCreateTotal}</div>
                <div className="text-sm text-slate-400 mt-1">Pronto para salvar</div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#151515] text-slate-500 border-b border-[#2a2a2a] text-xs uppercase">
                    <th className="font-medium p-4">Produto</th>
                    <th className="font-medium p-4">Quantidade</th>
                    <th className="font-medium p-4">Preço unitário</th>
                    <th className="font-medium p-4">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a] bg-[#111111]">
                  <tr>
                    <td className="p-4 text-white">Batata</td>
                    <td className="p-4 text-slate-300">3</td>
                    <td className="p-4 text-slate-300">R$ 8,90</td>
                    <td className="p-4 text-[#d482ff] font-semibold">R$ 26,70</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-white">Arroz 5kg</td>
                    <td className="p-4 text-slate-300">2</td>
                    <td className="p-4 text-slate-300">R$ 32,50</td>
                    <td className="p-4 text-[#d482ff] font-semibold">R$ 65,00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between gap-3 flex-col sm:flex-row">
              <Button onClick={() => setCreateStep(2)} className="bg-[#4a136f] hover:bg-[#5b148a] text-white rounded-full h-12 px-6">
                Voltar
              </Button>
              <Button onClick={() => setScreen('detail')} className="bg-[#c000ff] hover:bg-[#da3dff] text-white rounded-full h-12 px-6 font-semibold">
                Salvar pedido
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailView = () => {
    const isAberto = selectedPedido.status === 'ABERTO';
    const isReservado = selectedPedido.status === 'RESERVADO';
    const isPago = selectedPedido.status === 'PAGO';

    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        <div className="flex items-center gap-3">
          <Button onClick={() => setScreen('list')} className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white rounded-full h-11 px-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-slate-400 text-sm">Pedidos → Detalhes do Pedido</div>
        </div>

        <div className="rounded-[20px] overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl shadow-black/20">
          <div className="bg-[#5b148a] px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-white font-semibold text-lg">Detalhes do Pedido {selectedPedido.numero}</h2>
              <p className="text-white/70 text-sm mt-0.5">Acompanhamento do fluxo e impacto financeiro</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {renderStatusChip(selectedPedido.status)}
              <span className="inline-flex items-center gap-2 text-xs text-white/80 bg-black/20 border border-white/10 px-3 py-1 rounded-full">
                <Clock3 className="w-4 h-4" />
                Data de criação: {selectedPedido.data}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5 lg:col-span-2">
                <div className="text-xs text-slate-500 mb-2">Cliente</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{selectedPedido.cliente}</div>
                    <div className="text-sm text-slate-400">Saldo do cliente: {selectedPedido.clienteSaldo}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
                <div className="text-xs text-slate-500 mb-2">Data de pagamento</div>
                <div className="text-white font-semibold">{selectedPedido.dataPagamento ?? '-'}</div>
              </div>

              <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
                <div className="text-xs text-slate-500 mb-2">Saldo da empresa</div>
                <div className="text-[#a7f3d0] font-semibold">{selectedPedido.empresaSaldo}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
              <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#2a2a2a] bg-[#151515]">
                  <h3 className="text-white font-semibold">Itens do pedido</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="text-slate-500 border-b border-[#2a2a2a] text-xs uppercase">
                        <th className="font-medium p-4">Produto</th>
                        <th className="font-medium p-4">Quantidade</th>
                        <th className="font-medium p-4">Preço unitário</th>
                        <th className="font-medium p-4">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a2a] bg-[#111111]">
                      {selectedPedido.itens.map(item => (
                        <tr key={`${item.produto}-${item.quantidade}`}>
                          <td className="p-4 text-white">{item.produto}</td>
                          <td className="p-4 text-slate-300">{item.quantidade}</td>
                          <td className="p-4 text-slate-300">{item.precoUnitario}</td>
                          <td className="p-4 text-[#d482ff] font-semibold">{item.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
                  <h3 className="text-white font-semibold mb-4">Resumo financeiro</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3"><span className="text-slate-400">Total bruto</span><span className="text-white">{selectedPedido.totalBruto}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-400">Desconto</span><span className="text-white">{selectedPedido.desconto}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-400">Total final</span><span className="text-[#d482ff] font-semibold">{selectedPedido.totalFinal}</span></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
                  <h3 className="text-white font-semibold mb-4">Fluxo</h3>
                  <div className="space-y-3 text-sm">
                    {statusOptions.map(status => (
                      <div key={status} className="flex items-center gap-3 text-slate-300">
                        <div className={`w-2.5 h-2.5 rounded-full ${selectedPedido.status === status ? 'bg-[#c000ff]' : 'bg-[#2a2a2a]'}`} />
                        <span>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 text-sm text-slate-300">
                  <div className="flex items-center gap-2 mb-2"><Wallet className="w-4 h-4 text-[#d482ff]" /> Impacto financeiro</div>
                  {isPago ? 'Pagamento concluído. Cancelamento deve considerar estorno.' : isReservado ? 'Reserva validada. Pagamento afeta saldo disponível e caixa.' : isAberto ? 'Pedido aberto. Reservar estoque não altera saldo final ainda.' : 'Pedido cancelado ou com falha, sem ação financeira ativa.'}
                </div>
              </aside>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
              <h3 className="text-white font-semibold mb-4">Acompanhamento do fluxo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {statusOptions.map(status => (
                  <div key={status} className={`rounded-2xl border p-4 text-center ${selectedPedido.status === status ? 'border-[#c000ff] bg-[#1c1c1c]' : 'border-[#2a2a2a] bg-[#111111]'
                    }`}>
                    <div className="text-sm font-semibold text-white">{status}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
              <div className="text-sm text-slate-400">
                {selectedPedido.status === 'ABERTO' && 'Pedido ABERTO → Reservar → RESERVADO'}
                {selectedPedido.status === 'RESERVADO' && 'Pedido RESERVADO → Pagar → PAGO'}
                {selectedPedido.status === 'PAGO' && 'Pedido PAGO → Cancelar → CANCELADO com estorno'}
                {selectedPedido.status === 'CANCELADO' && 'Pedido cancelado'}
                {selectedPedido.status === 'FALHOU' && 'Pedido com falha de reserva ou pagamento'}
              </div>

              {renderActionButtons(selectedPedido.status)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {screen === 'list' && renderListView()}
      {screen === 'create' && renderCreateView()}
      {screen === 'detail' && renderDetailView()}
    </div>
  );
}
