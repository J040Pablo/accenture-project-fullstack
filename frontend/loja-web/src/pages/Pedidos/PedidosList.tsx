import { useMemo, useState, Fragment } from 'react';
import {
  ArrowLeft,
  ArrowRight,
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

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Mock Data ────────────────────────────────────────────────────────────────

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

// ─── Style helpers ────────────────────────────────────────────────────────────

const statusStyles: Record<PedidoStatus, string> = {
  ABERTO: 'bg-[#a100ff]/10 text-[#d8b4fe] border-[#a100ff]/20',
  RESERVADO: 'bg-[#7c3aed]/10 text-[#c4b5fd] border-[#7c3aed]/20',
  PAGO: 'bg-[#111111] text-slate-200 border-[#3a3a3a]',
  CANCELADO: 'bg-[#2a1118] text-[#d6a2b0] border-[#5a1f35]/40',
  FALHOU: 'bg-[#1a1024] text-[#c4b5fd] border-[#5b21b6]/30'
};


// ─── Component ────────────────────────────────────────────────────────────────

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
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusStyles[status]}`}>
      {status}
    </span>
  );

  const renderActionButtons = (status: PedidoStatus, compact = false) => {
    const baseClass = compact ? 'h-8 px-3 rounded-lg text-xs' : 'h-10 px-5 rounded-xl text-sm font-semibold';
    
    const purpleActionClass = 'bg-[#111111] border border-[#a100ff]/30 text-[#d8b4fe] hover:bg-[#a100ff]/10 hover:border-[#a100ff]/50 transition-all';
    const dangerActionClass = 'bg-[#111111] border border-[#5a1f35]/40 text-[#d6a2b0] hover:bg-[#2a1118] hover:border-[#5a1f35]/60 transition-all';

    if (status === 'ABERTO') {
      return (
        <div className="flex flex-wrap gap-2 justify-end">
          <Button className={`${purpleActionClass} ${baseClass}`}>
            <PackageCheck className="w-4 h-4 mr-2" />
            Reservar
          </Button>
          <Button className={`${dangerActionClass} ${baseClass}`}>
            <Ban className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      );
    }

    if (status === 'RESERVADO') {
      return (
        <div className="flex flex-wrap gap-2 justify-end">
          <Button className={`${purpleActionClass} ${baseClass}`}>
            <CreditCard className="w-4 h-4 mr-2" />
            Pagar
          </Button>
          <Button className={`${dangerActionClass} ${baseClass}`}>
            <Ban className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      );
    }

    if (status === 'PAGO') {
      return (
        <div className="flex flex-wrap gap-2 justify-end">
          <Button className={`${dangerActionClass} ${baseClass}`}>
            <Ban className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 justify-end">
        <Button 
          onClick={status === 'CANCELADO' || status === 'FALHOU' ? () => {} : undefined}
          className={`${purpleActionClass} ${baseClass}`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ver pedido
        </Button>
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 1. Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#0b0b0b] border border-[#2a2a2a] flex items-center justify-center text-[#a100ff]">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Pedidos</h1>
          </div>
          <p className="text-slate-400 text-sm">Gerencie o fluxo de reserva, pagamento e cancelamento</p>
        </div>

        <Button
          onClick={startCreateFlow}
          className="bg-[#a100ff] hover:bg-[#b833ff] text-white shadow-lg shadow-[#a100ff]/10 gap-2 rounded-xl h-11 px-6 font-bold transition-all"
        >
          <Plus className="w-5 h-5" />
          Criar pedido
        </Button>
      </div>

      {/* 2. Barra de Busca e Filtro */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por cliente ou número do pedido"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            className="w-full h-12 bg-[#0b0b0b] rounded-2xl px-5 pr-14 text-slate-200 placeholder-slate-600 border border-[#2a2a2a] focus:border-[#a100ff]/50 focus:outline-none focus:ring-1 focus:ring-[#a100ff]/20 transition-all"
          />
          <button className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-slate-500 hover:text-[#a100ff] transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0b0b0b] border border-[#2a2a2a] rounded-2xl">
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => setExpandedStatus(status)}
              className={`px-4 h-9 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${expandedStatus === status
                  ? 'bg-[#a100ff] text-white shadow-inner'
                  : 'text-slate-500 hover:bg-[#151515] hover:text-slate-300'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tabela de Pedidos */}
      <div className="rounded-2xl overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a]">
        <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-[#a100ff]/60" />
              Listagem de Pedidos
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Status atual: <span className="text-[#d8b4fe] font-bold">{expandedStatus}</span></p>
          </div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{filteredPedidos.length} encontrados</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="text-slate-600 border-b border-[#1a1a1a] text-[10px] font-bold uppercase tracking-widest bg-[#0f0f0f]/40">
                <th className="p-5">Número</th>
                <th className="p-5">Cliente</th>
                <th className="p-5">Data Criação</th>
                <th className="p-5">Status</th>
                <th className="p-5">Total</th>
                <th className="p-5 text-right px-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]">
              {filteredPedidos.length > 0 ? (
                filteredPedidos.map(pedido => {
                  const isExpanded = expandedRowId === pedido.id;

                  return (
                    <Fragment key={pedido.id}>
                      <tr className="group hover:bg-[#ffffff]/[0.015] transition-colors cursor-pointer" onClick={() => setExpandedRowId(isExpanded ? null : pedido.id)}>
                        <td className="p-5 font-mono text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{pedido.numero}</td>
                        <td className="p-5 text-sm text-slate-300 group-hover:text-slate-100 transition-colors">{pedido.cliente}</td>
                        <td className="p-5 text-xs text-slate-500">{pedido.data}</td>
                        <td className="p-5" onClick={(e) => e.stopPropagation()}>{renderStatusChip(pedido.status)}</td>
                        <td className="p-5 font-bold text-white tracking-tight">{pedido.total}</td>
                        <td className="p-5 text-right px-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              onClick={() => openPedidoDetail(pedido.id)}
                              className="bg-[#111111] border border-[#a100ff]/30 text-[#d8b4fe] hover:bg-[#a100ff]/10 hover:border-[#a100ff]/50 rounded-lg h-8 px-3 text-[11px] font-bold transition-all"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                              VER
                            </Button>
                            {renderActionButtons(pedido.status, true)}
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : pedido.id)}
                              className={`w-8 h-8 rounded-lg bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all ${isExpanded ? 'bg-[#151515] border-[#a100ff]/50 text-[#a100ff]' : ''}`}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-[#0f0f0f]/60 animate-in fade-in slide-in-from-top-1 duration-200">
                          <td colSpan={6} className="p-6 border-b border-[#1a1a1a]">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                              <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 hover:border-[#a100ff]/20 transition-colors">
                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <User className="w-3 h-3" /> CLIENTE
                                </div>
                                <div className="text-white font-bold text-base">{pedido.cliente}</div>
                                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                                  <span>Saldo diponível:</span>
                                  <span className="text-[#a1ffdb] font-semibold">{pedido.clienteSaldo}</span>
                                </div>
                              </div>
                              
                              <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 hover:border-[#a100ff]/20 transition-colors">
                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Wallet className="w-3 h-3" /> RESUMO FINANCEIRO
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs"><span className="text-slate-500 tracking-tight">Total Bruto</span><span className="text-slate-300">{pedido.totalBruto}</span></div>
                                  <div className="flex justify-between text-xs"><span className="text-slate-500 tracking-tight">Desconto</span><span className="text-[#ff9292]">{pedido.desconto}</span></div>
                                  <div className="pt-2 border-t border-[#1a1a1a] flex justify-between"><span className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Total Final</span><span className="text-white font-black">{pedido.totalFinal}</span></div>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 hover:border-[#a100ff]/20 transition-colors">
                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <PackageCheck className="w-3 h-3" /> OPERAÇÃO
                                </div>
                                <div className="text-xs text-slate-400 space-y-1.5">
                                  <p><span className="text-slate-600 mr-2">Empresa:</span> <span className="font-medium text-slate-300">{pedido.empresaSaldo}</span></p>
                                  <p className="text-[10px] leading-relaxed text-slate-500 mt-3 pt-3 border-t border-[#1a1a1a]">Fluxo recomendado: Verifique a reserva antes de processar o pagamento para garantir a integridade do estoque.</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-700">
                        <Filter className="w-8 h-8" />
                      </div>
                      <p className="text-slate-500 font-medium">Nenhum pedido encontrado nesta categoria.</p>
                      <button onClick={() => setSearchTerm('')} className="text-[#a100ff] text-sm font-semibold hover:underline">Limpar filtros</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCreateView = () => {
    return (
      <div className="space-y-8 max-w-6xl mx-auto pb-20">
        
        {/* Back and Breadcrumb */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => createStep === 1 ? setScreen('list') : setCreateStep((createStep - 1) as CreateStep)} 
            className="w-10 h-10 rounded-xl bg-[#0b0b0b] border border-[#2a2a2a] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#a100ff]/40 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Criar Novo Pedido</h1>
            <p className="text-xs text-slate-500 mt-0.5">Siga as etapas para registrar a venda no sistema</p>
          </div>
        </div>

        {/* Create Flow Card */}
        <div className="rounded-[24px] overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a] shadow-2xl">
          
          {/* Refined Step Header */}
          <div className="bg-[#0f0f0f] px-8 py-6 border-b border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-black transition-all ${
                    createStep === s 
                      ? 'bg-[#a100ff] border-[#a100ff] text-white' 
                      : createStep > s 
                        ? 'bg-[#a100ff]/10 border-[#a100ff]/30 text-[#d8b4fe]' 
                        : 'bg-[#151515] border-[#2a2a2a] text-slate-600'
                  }`}>
                    {s}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${createStep === s ? 'text-white' : 'text-slate-600'}`}>
                    {s === 1 ? 'Cliente' : s === 2 ? 'Itens' : 'Revisão'}
                  </span>
                  {s < 3 && <div className="hidden md:block w-8 h-px bg-[#2a2a2a] ml-2" />}
                </div>
              ))}
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a100ff]/5 border border-[#a100ff]/10 text-[10px] font-bold text-[#d8b4fe] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a100ff] animate-pulse" />
              Etapa {createStep} de 3
            </div>
          </div>

          <div className="p-8">
            {createStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-[#a100ff]/10 flex items-center justify-center text-[#a100ff]">
                        <User className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">Buscar Cliente</h3>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={clienteSearch}
                        onChange={event => setClienteSearch(event.target.value)}
                        placeholder="Nome, CPF ou telefone do cliente..."
                        className="w-full h-12 bg-[#0b0b0b] rounded-xl px-5 text-sm text-slate-200 placeholder-slate-700 border border-[#2a2a2a] focus:border-[#a100ff]/50 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="mt-6 space-y-3">
                      {filteredClientes.map(cliente => {
                        const isSelected = cliente.id === selectedClientId;
                        return (
                          <button
                            key={cliente.id}
                            onClick={() => setSelectedClientId(cliente.id)}
                            className={`w-full text-left rounded-2xl border p-4 transition-all duration-300 ${isSelected ? 'border-[#a100ff]/60 bg-[#a100ff]/5' : 'border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#2a2a2a] hover:bg-[#111111]'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${isSelected ? 'bg-white text-[#a100ff] border-white' : 'bg-[#1a1a1a] text-slate-500 border-[#2a2a2a]'}`}>
                                  {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div>
                                  <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>{cliente.nome}</div>
                                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{cliente.documento}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter mb-0.5">Saldo</div>
                                <div className="text-xs font-black text-[#a1ffdb]">{cliente.saldoDisponivel}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <aside className="space-y-6">
                  <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6">
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                       INFO COMPLEMENTAR
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[#0b0b0b] border border-[#1a1a1a]">
                        <div className="text-xs text-slate-500 mb-1">Cliente Selecionado</div>
                        <div className="text-sm font-bold text-white">{selectedCliente.nome}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#0b0b0b] border border-[#1a1a1a]">
                        <div className="text-xs text-slate-500 mb-1">Cidade / Estado</div>
                        <div className="text-sm font-bold text-white">{selectedCliente.cidade} / BR</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#0b0b0b] border border-[#a100ff]/10">
                        <div className="text-xs text-slate-500 mb-1">Saldo em Conta</div>
                        <div className="text-sm font-black text-[#a1ffdb]">{selectedCliente.saldoDisponivel}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-[#2a2a2a] bg-[#a100ff]/[0.02] p-5">
                    <div className="flex items-center gap-3 text-[#d8b4fe]">
                      <Sparkles className="w-5 h-5 flex-shrink-0" />
                      <p className="text-[11px] leading-relaxed">Selecione o cliente para prosseguir à etapa de adição de itens onde as quantidades serão validadas.</p>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {createStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 animate-in fade-in duration-500">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Search className="w-4 h-4 text-[#a100ff]" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Adicionar Itens</h3>
                      </div>
                      <input
                        type="text"
                        value={productSearch}
                        onChange={event => setProductSearch(event.target.value)}
                        placeholder="Nome ou SKU..."
                        className="w-full h-11 bg-[#0b0b0b] rounded-xl px-4 text-sm text-slate-200 placeholder-slate-700 border border-[#2a2a2a] focus:border-[#a100ff]/50 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6">
                       <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Item em Seleção</div>
                       <div className="flex justify-between items-start">
                         <div>
                            <div className="text-white font-bold">{selectedProduto.nome}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{selectedProduto.sku}</div>
                         </div>
                         <div className="text-right">
                            <div className="text-sm font-black text-[#d8b4fe]">{selectedProduto.preco}</div>
                            <div className="text-[10px] text-slate-600 mt-0.5">{selectedProduto.estoque} estoque</div>
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredProdutos.map(produto => {
                      const isSelected = produto.id === selectedProductId;
                      return (
                        <button
                          key={produto.id}
                          onClick={() => setSelectedProductId(produto.id)}
                          className={`w-full text-left rounded-2xl border p-4 transition-all ${isSelected ? 'border-[#a100ff]/60 bg-[#a100ff]/5' : 'border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#2a2a2a]'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isSelected ? 'bg-white text-[#a100ff] border-white' : 'bg-[#1a1a1a] text-slate-600 border-[#2a2a2a]'}`}>
                                <Barcode className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white">{produto.nome}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{produto.sku}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="hidden sm:block text-right">
                                  <div className="text-[9px] font-bold text-slate-700 uppercase">Categoria</div>
                                  <div className="text-[11px] text-slate-400 font-medium">{produto.categoria}</div>
                               </div>
                               <div className="text-right">
                                  <div className="text-[9px] font-bold text-slate-700 uppercase">Preço</div>
                                  <div className="text-sm font-bold text-[#a1ffdb]">{produto.preco}</div>
                               </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <aside className="space-y-6">
                  <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6">
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                       REQUISITO DE PAGAMENTO
                    </div>
                    <div className="space-y-5">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Subtotal</span>
                          <span className="text-slate-300">R$ 145,00</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Desconto aplicado</span>
                          <span className="text-[#ff9292]">R$ 0,00</span>
                       </div>
                       <div className="pt-4 border-t border-[#1a1a1a] flex justify-between items-baseline">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Total Final</span>
                          <span className="text-xl font-black text-white">{currentCreateTotal}</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0b0b0b] border border-[#2a2a2a] space-y-3">
                     <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-[#a1ffdb]" />
                        Estoque validado internamente
                     </div>
                     <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <Wallet className="w-4 h-4 text-[#d8b4fe]" />
                        Crédito será reservado na etapa 3
                     </div>
                  </div>
                </aside>
              </div>
            )}

            {createStep === 3 && (
              <div className="animate-in zoom-in-95 duration-500 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-[#111111] border border-[#2a2a2a] hover:border-[#a100ff]/30 transition-all">
                     <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.2em] mb-4">ENTIDADE PAGADORA</div>
                     <div className="text-white font-bold">{selectedCliente.nome}</div>
                     <div className="text-xs text-slate-500 mt-1 font-mono tracking-tighter">{selectedCliente.documento}</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#111111] border border-[#2a2a2a] hover:border-[#a100ff]/30 transition-all">
                     <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.2em] mb-4">VOLUME DOCUMENTADO</div>
                     <div className="text-white font-bold">2 Itens Registrados</div>
                     <div className="text-xs text-slate-500 mt-1">Conformidade de estoque em dia</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#111111] border border-[#a100ff]/20 hover:border-[#a100ff]/40 transition-all bg-gradient-to-br from-[#111111] to-[#a100ff]/[0.03]">
                     <div className="text-[10px] font-extrabold text-[#d8b4fe] uppercase tracking-[0.2em] mb-4">MÉTRICA FINAL</div>
                     <div className="text-2xl font-black text-white">{currentCreateTotal}</div>
                     <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest tracking-widest">Liquidável agora</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden bg-[#0b0b0b]">
                   <div className="p-4 bg-[#0f0f0f] border-b border-[#1a1a1a] flex items-center gap-2">
                      <Barcode className="w-4 h-4 text-[#a100ff]/60" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Detalhamento dos Itens</span>
                   </div>
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-[#141414] text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            <th className="p-5">Descrição</th>
                            <th className="p-5 text-center">Quant.</th>
                            <th className="p-5">Preço Unit.</th>
                            <th className="p-5 text-right px-8">Subtotal</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[#141414]">
                         <tr className="text-sm hover:bg-[#ffffff]/[0.02] transition-colors">
                            <td className="p-5 text-white font-medium">Batata</td>
                            <td className="p-5 text-center text-slate-400">03</td>
                            <td className="p-5 text-slate-400">R$ 8,90</td>
                            <td className="p-5 text-right px-8 font-bold text-white">R$ 26,70</td>
                         </tr>
                         <tr className="text-sm hover:bg-[#ffffff]/[0.02] transition-colors">
                            <td className="p-5 text-white font-medium">Arroz 5kg</td>
                            <td className="p-5 text-center text-slate-400">02</td>
                            <td className="p-5 text-slate-400">R$ 32,50</td>
                            <td className="p-5 text-right px-8 font-bold text-white">R$ 65,00</td>
                         </tr>
                      </tbody>
                   </table>
                </div>
              </div>
            )}

            {/* Global Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-[#1a1a1a]">
              <p className="text-xs text-slate-500 italic">Ao prosseguir você concorda com os termos de reserva de estoque e faturamento do sistema.</p>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button 
                  onClick={() => createStep === 1 ? setScreen('list') : setCreateStep((createStep - 1) as CreateStep)} 
                  className="flex-1 sm:flex-initial h-12 px-8 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-400 font-bold hover:bg-[#151515] hover:text-white transition-all"
                >
                  VOLTAR
                </Button>
                
                {createStep === 2 && (
                  <Button className="flex-1 sm:flex-initial h-12 px-8 rounded-xl bg-[#111111] border border-[#a100ff]/30 text-[#d8b4fe] font-bold hover:bg-[#a100ff]/10 hover:border-[#a100ff]/50 transition-all uppercase tracking-widest text-xs">
                     <Plus className="w-4 h-4 mr-2" /> Itens
                  </Button>
                )}

                <Button 
                  onClick={() => createStep < 3 ? setCreateStep((createStep + 1) as CreateStep) : setScreen('detail')} 
                  className="flex-1 sm:flex-initial h-12 px-10 rounded-xl bg-[#a100ff] text-white font-black hover:bg-[#b833ff] shadow-lg shadow-[#a100ff]/20 transition-all"
                >
                  {createStep === 3 ? 'SALVAR PEDIDO' : 'CONTINUAR'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
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
      <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
        
        {/* Detail Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setScreen('list')} 
              className="w-11 h-11 rounded-xl bg-[#0b0b0b] border border-[#2a2a2a] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#a100ff]/40 transition-all shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-white tracking-tight italic">#{selectedPedido.numero}</h1>
                {renderStatusChip(selectedPedido.status)}
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Fluxo de venda e liquidação financeira</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 text-[10px] font-bold text-slate-500">
               <Clock3 className="w-3.5 h-3.5" />
               CRIADO EM {selectedPedido.data}
             </div>
             {selectedPedido.dataPagamento && selectedPedido.dataPagamento !== '-' && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#a1ffdb]/10 text-[10px] font-bold text-[#a1ffdb]">
                  <CreditCard className="w-3.5 h-3.5" />
                  PAGO EM {selectedPedido.dataPagamento}
                </div>
             )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="rounded-2xl bg-[#a100ff]/[0.03] border border-[#a100ff]/10 p-5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
           <div className="absolute top-0 left-0 w-1 h-full bg-[#a100ff]" />
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center text-[#a100ff] shadow-inner">
                 <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                 <h4 className="text-sm font-black text-white uppercase tracking-tight">Próxima Ação recomendada</h4>
                 <p className="text-xs text-slate-500 font-medium">
                    {isAberto ? 'Registre a reserva dos itens no estoque para garantir a entrega.' : isReservado ? 'Processar o pagamento utilizando o saldo disponível do cliente.' : isPago ? 'O pedido está liquidado. Acompanhe a entrega no painel de relatórios.' : 'Consulte os logs para entender a falha ou motivo do cancelamento.'}
                 </p>
              </div>
           </div>
           {renderActionButtons(selectedPedido.status)}
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#2a2a2a] hover:border-[#a100ff]/20 transition-all">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">ENTIDADE</div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#151515] flex items-center justify-center text-slate-400">
                    <User className="w-4 h-4" />
                 </div>
                 <div className="text-white font-bold text-sm truncate">{selectedPedido.cliente}</div>
              </div>
           </div>

           <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#2a2a2a] hover:border-[#a100ff]/20 transition-all">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">CARTEIRA CLIENTE</div>
              <div className="text-[#a1ffdb] font-black text-lg tracking-tight">{selectedPedido.clienteSaldo}</div>
              <div className="text-[9px] text-slate-600 mt-1 font-bold">Disponível para liquidação</div>
           </div>

           <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#2a2a2a] hover:border-[#a100ff]/20 transition-all">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">CAIXA EMPRESA</div>
              <div className="text-white font-black text-lg tracking-tight">{selectedPedido.empresaSaldo}</div>
              <div className="text-[9px] text-slate-600 mt-1 font-bold">Consolidado em conta</div>
           </div>

           <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#a100ff]/20 hover:border-[#a100ff]/40 transition-all bg-gradient-to-br from-[#0b0b0b] to-[#a100ff]/[0.02]">
              <div className="text-[10px] font-bold text-[#d8b4fe] uppercase tracking-widest mb-4">VALOR FINAL</div>
              <div className="text-2xl font-black text-white tracking-tighter">{selectedPedido.totalFinal}</div>
              <div className="text-[9px] text-slate-500 mt-1 font-bold flex items-center gap-1.5 uppercase">
                <div className="w-1 h-1 rounded-full bg-[#a100ff]/60" />
                Dedução Fiscal Aplicada
              </div>
           </div>
        </div>

        {/* Content Table + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          
          <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden bg-[#0b0b0b] shadow-2xl">
            <div className="px-6 py-4 border-b border-[#1a1a1a] bg-[#0f0f0f]/40 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#a100ff]/30 border border-[#a100ff]/50" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Detalhamento Técnico dos Itens</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-600 border-b border-[#141414] text-[10px] font-bold uppercase tracking-widest">
                    <th className="p-6">Descrição Produto</th>
                    <th className="p-6">Quant.</th>
                    <th className="p-6">Preço Unitário</th>
                    <th className="p-6 text-right px-8">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]">
                  {selectedPedido.itens.map(item => (
                    <tr key={`${item.produto}-${item.quantidade}`} className="group hover:bg-[#ffffff]/[0.015] transition-colors">
                      <td className="p-6 text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{item.produto}</td>
                      <td className="p-6 text-sm text-slate-500 font-mono italic">{String(item.quantidade).padStart(2, '0')}</td>
                      <td className="p-6 text-sm text-slate-500">{item.precoUnitario}</td>
                      <td className="p-6 text-right px-8 font-black text-white">{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6 shadow-xl">
              <h3 className="text-xs font-black text-white tracking-widest uppercase mb-6 flex items-center justify-between">
                 Recibo de Venda
                 <CreditCard className="w-4 h-4 text-[#a100ff]/60" />
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase tracking-tighter">Total Bruto</span>
                  <span className="text-slate-300 font-bold">{selectedPedido.totalBruto}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500 uppercase tracking-tighter">Descontos</span>
                   <span className="text-[#ff9292] font-bold">{selectedPedido.desconto}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex justify-between items-baseline">
                   <span className="text-[11px] font-black text-white uppercase tracking-tighter">Líquido Final</span>
                   <span className="text-2xl font-black text-white">{selectedPedido.totalFinal}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
              <h3 className="text-xs font-black text-white tracking-widest uppercase mb-6">Linha do Tempo Status</h3>
              <div className="space-y-6 relative ml-1">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#1a1a1a]" />
                {statusOptions.map((status) => {
                  const isCurrent = selectedPedido.status === status;
                  return (
                    <div key={status} className="flex items-center gap-4 relative z-10 group">
                      <div className={`w-3 h-3 rounded-full border-2 transition-all group-hover:scale-125 ${
                        isCurrent 
                          ? 'bg-[#a100ff] border-[#a100ff] shadow-[0_0_8px_rgba(161,0,255,0.6)]' 
                          : 'bg-[#0f0f0f] border-[#2a2a2a]'
                      }`} />
                      <span className={`text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${
                        isCurrent ? 'text-white' : 'text-slate-700'
                      }`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#a100ff]/10 bg-[#a100ff]/[0.02] p-5">
              <p className="text-[10px] font-medium text-[#d8b4fe] leading-relaxed flex gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                {isPago ? 'Liquidação confirmada pelo motor de pagamentos Accentur-Engine.' : isReservado ? 'Reserva em processamento. Verifique se o saldo já foi debitado na conta do cliente.' : isAberto ? 'Pedido aguardando acionamento da reserva de estoque manual.' : 'Fluxo finalizado.'}
              </p>
            </div>
          </aside>
        </div>

        {/* Footer Flow info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-8 rounded-3xl bg-[#0b0b0b] border border-[#2a2a2a] opacity-60">
           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#a100ff]" />
              Transação Segura Accenture-Cloud
           </div>
           <div className="text-[11px] font-medium text-slate-500 max-w-sm md:text-right">
              {selectedPedido.status === 'ABERTO' && 'PRÓXIMO: Reservar itens e validar logística.'}
              {selectedPedido.status === 'RESERVADO' && 'PRÓXIMO: Debitar saldo do cliente e confirmar pagamento.'}
              {selectedPedido.status === 'PAGO' && 'PRÓXIMO: Gerar nota fiscal e despachar pedido.'}
              {selectedPedido.status === 'CANCELADO' && 'PRÓXIMO: Auditoria de cancelamento.'}
              {selectedPedido.status === 'FALHOU' && 'PRÓXIMO: Notificar suporte técnico.'}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans antialiased">
      <div className="py-8 px-4 sm:px-6">
        {screen === 'list' && renderListView()}
        {screen === 'create' && renderCreateView()}
        {screen === 'detail' && renderDetailView()}
      </div>
    </div>
  );
}
