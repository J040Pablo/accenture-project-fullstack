import { useCallback, useEffect, useMemo, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { analiseRiscoService } from '../../services/analiseRiscoService';
import { toast } from 'react-toastify';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageToolbar } from '../../components/ui/PageToolbar';
import { PrimaryActionButton } from '../../components/ui/PrimaryActionButton';
import { SearchInput } from '../../components/ui/SearchInput';
import { pedidoService } from '../../services/pedidoService';
import { clienteService } from '../../services/clienteService';
import { produtoService } from '../../services/produtoService';
import type { Pedido } from '../../types/Pedido';
import type { Cliente } from '../../types/Cliente';
import type { Produto } from '../../types/Produto';
import type { AnaliseRiscoPedidoResponseDTO } from '../../types/AnaliseRisco';

// ─── Types ────────────────────────────────────────────────────────────────────

type PedidoStatus = 'CRIADO' | 'RESERVADO' | 'PAGO' | 'CANCELADO';
type ScreenMode = 'list' | 'create' | 'detail';
type CreateStep = 1 | 2 | 3;

const statusOptions: PedidoStatus[] = ['CRIADO', 'RESERVADO', 'PAGO', 'CANCELADO'];

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatData(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR');
}

const statusStyles: Record<PedidoStatus, string> = {
  CRIADO:    'bg-[#a100ff]/10 text-[#d8b4fe] border-[#a100ff]/20',
  RESERVADO: 'bg-[#7c3aed]/10 text-[#c4b5fd] border-[#7c3aed]/20',
  PAGO:      'bg-[#111111] text-slate-200 border-[#3a3a3a]',
  CANCELADO: 'bg-[#2a1118] text-[#d6a2b0] border-[#5a1f35]/40',
};

// removed unused riskStyles to silence TypeScript unused-variable warnings

type ItemCarrinho = { produtoId: number; quantidade: number };

export default function PedidosList() {
  const navigate = useNavigate();

  const [screen, setScreen]           = useState<ScreenMode>('list');
  const [createStep, setCreateStep]   = useState<CreateStep>(1);

  const [pedidos, setPedidos]         = useState<Pedido[]>([]);
  const [clientes, setClientes]       = useState<Cliente[]>([]);
  const [produtos, setProdutos]       = useState<Produto[]>([]);
  
  const [loadingList, setLoadingList] = useState(false);
  const [erroGlobal, setErroGlobal]   = useState<string | null>(null);

  const [loadingAcao, setLoadingAcao] = useState<number | null>(null);

  const [cancelandoId, setCancelandoId]     = useState<number | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');

  const [expandedStatus, setExpandedStatus]   = useState<PedidoStatus>('CRIADO');
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);

  const [selectedPedidoCompleto, setSelectedPedidoCompleto] = useState<Pedido | null>(null); 
  const [analiseLoading, setAnaliseLoading] = useState(false);
  const [analiseResultado, setAnaliseResultado] = useState<AnaliseRiscoPedidoResponseDTO | null>(null);
  const [expandedRowId, setExpandedRowId]       = useState<number | null>(null);
  const [searchTerm, setSearchTerm]             = useState('');
  const [productSearch, setProductSearch]       = useState('');
  const [clienteSearch, setClienteSearch]       = useState('');

  const [selectedClientId, setSelectedClientId]   = useState<number>(0);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [itensCarrinho, setItensCarrinho]         = useState<ItemCarrinho[]>([]);
  const [salvando, setSalvando]                   = useState(false);

  const carregarPedidos = useCallback(async () => {
    setLoadingList(true);
    setErroGlobal(null);
    try {
      const data = await pedidoService.listar();
      setPedidos(data);
    } catch (e: unknown) {
      setErroGlobal(e instanceof Error ? e.message : 'Erro ao carregar pedidos.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const carregarDadosAuxiliares = useCallback(async () => {
    try {
      const [clientesData, produtosData] = await Promise.all([
        clienteService.listar(),
        produtoService.listar()
      ]);
      
      setClientes(clientesData);
      setProdutos(produtosData);
      
      if (clientesData.length > 0) setSelectedClientId(clientesData[0].id!);
      if (produtosData.length > 0) setSelectedProductId(produtosData[0].id!);
    } catch (e: unknown) {
      setErroGlobal(e instanceof Error ? e.message : 'Erro ao carregar clientes e produtos.');
    }
  }, []);

  useEffect(() => {
    carregarPedidos();
    carregarDadosAuxiliares();
  }, [carregarPedidos, carregarDadosAuxiliares]);

  const selectedPedido = useMemo(
    () => pedidos.find(p => p.idPedido === selectedPedidoId) ?? null,
    [pedidos, selectedPedidoId]
  );

  const selectedCliente = useMemo(
    () => clientes.find(c => c.id === selectedClientId) ?? null,
    [clientes, selectedClientId]
  );

  const selectedProduto = useMemo(
    () => produtos.find(p => p.id === selectedProductId) ?? null,
    [produtos, selectedProductId]
  );

  const activeStatusIndex = statusOptions.findIndex(s => s === expandedStatus);

  const filteredPedidos = pedidos.filter(pedido => {
    const matchesStatus = pedido.status === expandedStatus;
    const matchesSearch =
      searchTerm.trim().length === 0 ||
      String(pedido.idPedido).includes(searchTerm) ||
      String(pedido.clienteId).includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const filteredClientes = clientes.filter(c =>
    c.nome.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    c.cpf.toLowerCase().includes(clienteSearch.toLowerCase())
  );

  const filteredProdutos = produtos.filter(p =>
    p.nome.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const atualizarPedidoNaLista = (pedidoAtualizado: Pedido) => {
    setPedidos(prev =>
      prev.map(p => p.idPedido === pedidoAtualizado.idPedido ? pedidoAtualizado : p)
    );
    if (selectedPedidoId === pedidoAtualizado.idPedido) {
      setSelectedPedidoId(pedidoAtualizado.idPedido);
    }
  };

  const handleReservar = async (id: number) => {
    setLoadingAcao(id);
    setErroGlobal(null);
    try {
      const atualizado = await pedidoService.reservar(id);
      atualizarPedidoNaLista(atualizado);
      toast.success('Pedido reservado com sucesso no estoque!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao reservar pedido.';
      setErroGlobal(msg);
    } finally {
      setLoadingAcao(null);
    }
  };

  const handlePagar = async (id: number) => {
    setLoadingAcao(id);
    setErroGlobal(null);
    try {
      const atualizado = await pedidoService.pagar(id);
      atualizarPedidoNaLista(atualizado);
      toast.success('Pagamento processado com sucesso!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao pagar pedido.';
      setErroGlobal(msg);
    } finally {
      setLoadingAcao(null);
    }
  };

  const handleConfirmarCancelamento = async () => {
    if (!cancelandoId || !motivoCancelamento.trim()) return;
    setLoadingAcao(cancelandoId);
    setErroGlobal(null);
    try {
      const atualizado = await pedidoService.cancelar(cancelandoId, motivoCancelamento.trim());
      atualizarPedidoNaLista(atualizado);
      setCancelandoId(null);
      setMotivoCancelamento('');
      toast.success('Pedido cancelado com sucesso!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao cancelar pedido.';
      setErroGlobal(msg);
      toast.error(msg);
    } finally {
      setLoadingAcao(null);
    }
  };

  const abrirCancelamento = (id: number) => {
    setCancelandoId(id);
    setMotivoCancelamento('');
    setErroGlobal(null);
  };

  const adicionarItemCarrinho = () => {
    const produtoId = selectedProductId;
    setItensCarrinho(prev => {
      const existente = prev.find(i => i.produtoId === produtoId);
      if (existente) {
        return prev.map(i => i.produtoId === produtoId ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [...prev, { produtoId, quantidade: 1 }];
    });
  };

  const handleSalvarPedido = async () => {
    if (!selectedClientId) {
      const msg = 'Por favor, selecione um cliente.';
      setErroGlobal(msg);
      toast.warning(msg);
      return;
    }

    setSalvando(true);
    setErroGlobal(null);
    try {
      const clienteId = selectedClientId;
      const itensFinal = itensCarrinho.length > 0
        ? itensCarrinho
        : [{ produtoId: selectedProductId, quantidade: 1 }];

      const novoPedido = await pedidoService.criar({ clienteId, desconto: 0, itens: itensFinal });
      setPedidos(prev => [novoPedido, ...prev]);
      setItensCarrinho([]);
      setSelectedPedidoId(novoPedido.idPedido);
      setScreen('detail');
      toast.success('Pedido criado com sucesso!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar pedido.';
      setErroGlobal(msg);
      toast.error(msg);
    } finally {
      setSalvando(false);
    }
  };

  const startCreateFlow = () => {
    setItensCarrinho([]);
    setErroGlobal(null);
    setCreateStep(1);
    setScreen('create');
  };

const openPedidoDetail = async (id: number) => {
    setSelectedPedidoId(id);
    setSelectedPedidoCompleto(null); // ← ADICIONAR
    setErroGlobal(null);
    setScreen('detail');

    try {
      const pedidoCompleto = await pedidoService.buscarPorId(id); 
      atualizarPedidoNaLista(pedidoCompleto);
      setSelectedPedidoCompleto(pedidoCompleto); // ← ADICIONAR
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar os itens do pedido.';
      setErroGlobal(msg);
      toast.error(msg);
    }
  };

  const renderStatusChip = (status: PedidoStatus) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusStyles[status]}`}>
      {status}
    </span>
  );

  const renderActionButtons = (status: PedidoStatus, id: number, compact = false) => {
    const baseClass = compact ? 'h-8 px-3 rounded-lg text-xs' : 'h-10 px-5 rounded-xl text-sm font-semibold';
    const isLoading = loadingAcao === id;

    const purpleActionClass = 'bg-[#111111] hover:bg-[#161616] text-[#d8b4fe] hover:text-white border border-[#a100ff]/20 hover:border-[#a100ff]/40 rounded-xl outline-none focus:outline-none focus:ring-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const dangerActionClass  = 'bg-[#111111] hover:bg-[#161616] text-[#d6a2b0] hover:text-[#f0c2cf] border border-[#5a1f35]/40 hover:border-[#5a1f35]/70 rounded-xl outline-none focus:outline-none focus:ring-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    if (status === 'CRIADO') {
      return (
        <div className="flex items-center gap-2 justify-end flex-nowrap">
          <Button
            disabled={isLoading}
            onClick={() => handleReservar(id)}
            className={`${purpleActionClass} ${baseClass} shrink-0`}
          >
            <PackageCheck className="w-4 h-4 mr-2" />
            {isLoading ? 'Reservando...' : 'Reservar'}
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => abrirCancelamento(id)}
            className={`${dangerActionClass} ${baseClass} shrink-0`}
          >
            <Ban className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      );
    }

    if (status === 'RESERVADO') {
      return (
        <div className="flex items-center gap-2 justify-end flex-nowrap">
          <Button
            disabled={isLoading}
            onClick={() => handlePagar(id)}
            className={`${purpleActionClass} ${baseClass} shrink-0`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isLoading ? 'Pagando...' : 'Pagar'}
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => abrirCancelamento(id)}
            className={`${dangerActionClass} ${baseClass} shrink-0`}
          >
            <Ban className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      );
    }

    if (status === 'PAGO') {
      return (
        <div className="flex items-center gap-2 justify-end flex-nowrap">
          <Button
            disabled={isLoading}
            onClick={() => abrirCancelamento(id)}
            className={`${dangerActionClass} ${baseClass} shrink-0`}
          >
            <Ban className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 justify-end flex-nowrap">
        <Button
          onClick={() => openPedidoDetail(id)}
          className={`bg-[#111111] hover:bg-[#161616] text-[#d8b4fe] hover:text-white border border-[#a100ff]/20 hover:border-[#a100ff]/40 rounded-xl outline-none focus:outline-none focus:ring-0 transition-colors ${baseClass} shrink-0`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ver pedido
        </Button>
      </div>
    );
  };

  const renderModalCancelamento = () => {
    if (cancelandoId === null) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl bg-[#111111] border border-[#2a2a2a] p-8 shadow-2xl">
          <h3 className="text-white font-black text-lg mb-2">Cancelar Pedido</h3>
          <p className="text-slate-500 text-xs mb-6">Informe o motivo do cancelamento para continuar.</p>
          <textarea
            value={motivoCancelamento}
            onChange={e => setMotivoCancelamento(e.target.value)}
            placeholder="Descreva o motivo do cancelamento..."
            rows={4}
            className="w-full rounded-xl bg-[#0b0b0b] border border-[#2a2a2a] text-slate-200 text-sm p-4 resize-none outline-none focus:border-[#a100ff]/40 transition-colors placeholder:text-slate-600"
          />
          {erroGlobal && (
            <p className="text-[#d6a2b0] text-xs mt-3 font-medium">{erroGlobal}</p>
          )}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => { setCancelandoId(null); setErroGlobal(null); }}
              className="flex-1 h-11 rounded-xl bg-[#0b0b0b] border border-[#2a2a2a] text-slate-400 hover:text-white outline-none focus:outline-none focus:ring-0 transition-colors font-bold"
            >
              Voltar
            </Button>
            <Button
              disabled={!motivoCancelamento.trim() || loadingAcao === cancelandoId}
              onClick={handleConfirmarCancelamento}
              className="flex-1 h-11 rounded-xl bg-[#2a1118] hover:bg-[#3a1a22] text-[#d6a2b0] hover:text-[#f0c2cf] border border-[#5a1f35]/60 outline-none focus:outline-none focus:ring-0 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAcao === cancelandoId ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <PageLayout>
      {renderModalCancelamento()}

      <PageHeader
        title="Pedidos"
        subtitle="Gerencie o fluxo de reserva, pagamento e cancelamento"
        icon={<ShoppingCart className="w-5 h-5" />}
        action={
          <PrimaryActionButton onClick={startCreateFlow}>
            <Plus className="w-5 h-5" />
            Criar pedido
          </PrimaryActionButton>
        }
      />

      {/* Erro global */}
      {erroGlobal && (
        <div className="rounded-xl bg-[#2a1118] border border-[#5a1f35]/60 px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-[#d6a2b0] text-sm font-medium">{erroGlobal}</p>
          <button
            onClick={() => setErroGlobal(null)}
            className="text-[#d6a2b0] hover:text-white text-xs font-bold outline-none"
          >
            ✕
          </button>
                {analiseResultado && (
                  <div className="ml-3 text-sm text-slate-300">Resultado: {analiseResultado.nivelRisco}</div>
                )}
        </div>
      )}
      <PageToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por cliente ou número do pedido"
        rightContent={
          <div className="overflow-x-auto">
            <div className="min-w-[520px] rounded-2xl border border-[#2a2a2a] bg-[#111111] p-2">
              <div className="relative grid grid-cols-4 gap-1">
                <div
                  className="pointer-events-none absolute top-0 bottom-0 left-0 rounded-xl bg-[#a100ff] shadow-[0_0_18px_rgba(161,0,255,0.28)] transition-transform duration-300 ease-out"
                  style={{
                    width: `${100 / statusOptions.length}%`,
                    transform: `translateX(${activeStatusIndex * 100}%)`
                  }}
                />
                {statusOptions.map(status => {
                  const isActive = expandedStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setExpandedStatus(status)}
                      className={`relative z-10 h-10 w-full rounded-xl px-4 text-[11px] font-bold tracking-[0.16em] transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        }
      />

      {/* Tabela de Pedidos */}
      <div className="rounded-2xl overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a]">
        <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-[#a100ff]/60" />
              Listagem de Pedidos
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Status atual: <span className="text-[#d8b4fe] font-bold">{expandedStatus}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loadingList && (
              <span className="text-[11px] text-slate-500 animate-pulse">Carregando...</span>
            )}
            <button
              onClick={carregarPedidos}
              className="text-[11px] font-bold text-slate-600 hover:text-[#a100ff] uppercase tracking-widest transition-colors outline-none"
            >
              ↺ Atualizar
            </button>
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
              {filteredPedidos.length} encontrados
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[1240px]">
            <thead>
              <tr className="text-slate-600 border-b border-[#1a1a1a] text-[10px] font-bold uppercase tracking-widest bg-[#0f0f0f]/40">
                <th className="p-5 font-medium w-[140px]">ID</th>
                <th className="p-5 font-medium w-[160px]">Cliente ID</th>
                <th className="p-5 font-medium w-[160px]">Data Criação</th>
                <th className="p-5 font-medium w-[140px]">Status</th>
                <th className="p-5 font-medium w-[140px]">Total Final</th>
                <th className="p-5 font-medium w-[140px]">Desconto</th>
                <th className="p-5 font-medium text-right w-[290px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]">
              {filteredPedidos.length > 0 ? (
                filteredPedidos.map(pedido => {
                  const isExpanded = expandedRowId === pedido.idPedido;
                  return (
                    <Fragment key={pedido.idPedido}>
                      <tr
                        className="group hover:bg-[#ffffff]/[0.015] transition-colors cursor-pointer"
                        onClick={() => setExpandedRowId(isExpanded ? null : pedido.idPedido)}
                      >
                        <td className="p-5 font-mono text-xs font-bold text-slate-400 group-hover:text-white transition-colors align-middle truncate whitespace-nowrap">
                          #{pedido.idPedido}
                        </td>
                        <td className="p-5 text-sm text-slate-300 group-hover:text-slate-100 transition-colors align-middle truncate whitespace-nowrap">
                          Cliente #{pedido.clienteId}
                        </td>
                        <td className="p-5 text-xs text-slate-500 align-middle truncate whitespace-nowrap">
                          {formatData(pedido.dataCriacao)}
                        </td>
                        <td className="p-5 align-middle" onClick={e => e.stopPropagation()}>
                          {renderStatusChip(pedido.status as PedidoStatus)}
                        </td>
                        <td className="p-5 font-bold text-white tracking-tight align-middle truncate whitespace-nowrap">
                          {formatBRL(pedido.totalFinal)}
                        </td>
                        <td className="p-5 text-xs text-[#ff9292] align-middle truncate whitespace-nowrap">
                          {pedido.desconto > 0 ? `- ${formatBRL(pedido.desconto)}` : '-'}
                        </td>
                        <td className="p-5 text-right align-middle" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2 justify-end flex-nowrap">
                            <Button
                              onClick={() => openPedidoDetail(pedido.idPedido)}
                              className="bg-[#111111] hover:bg-[#161616] text-[#d8b4fe] hover:text-white border border-[#a100ff]/20 hover:border-[#a100ff]/40 rounded-xl h-8 px-3 text-[11px] font-bold outline-none focus:outline-none focus:ring-0 transition-colors shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                              VER
                            </Button>
                            {renderActionButtons(pedido.status as PedidoStatus, pedido.idPedido, true)}
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : pedido.idPedido)}
                              className={`w-8 h-8 rounded-lg bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-500 hover:text-slate-300 outline-none focus:outline-none focus:ring-0 transition-colors shrink-0 ${isExpanded ? 'bg-[#151515] border-[#a100ff]/50 text-[#a100ff]' : ''}`}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Linha expandida */}
                      {isExpanded && (
                        <tr className="bg-[#0f0f0f]/60 animate-in fade-in slide-in-from-top-1 duration-200">
                          <td colSpan={7} className="p-0 border-b border-[#1a1a1a]">
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">

                              {/* Resumo financeiro */}
                              <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 hover:border-[#a100ff]/20 transition-colors">
                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Wallet className="w-3 h-3" /> RESUMO FINANCEIRO
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 tracking-tight">Total Bruto</span>
                                    <span className="text-slate-300">{formatBRL(pedido.totalBruto)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 tracking-tight">Desconto</span>
                                    <span className="text-[#ff9292]">{formatBRL(pedido.desconto)}</span>
                                  </div>
                                  <div className="pt-2 border-t border-[#1a1a1a] flex justify-between">
                                    <span className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Total Final</span>
                                    <span className="text-white font-black">{formatBRL(pedido.totalFinal)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Datas */}
                              <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 hover:border-[#a100ff]/20 transition-colors">
                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Clock3 className="w-3 h-3" /> DATAS
                                </div>
                                <div className="text-xs text-slate-400 space-y-2">
                                  <p><span className="text-slate-600 mr-2">Criação:</span><span className="font-medium text-slate-300">{formatData(pedido.dataCriacao)}</span></p>
                                  <p><span className="text-slate-600 mr-2">Reserva:</span><span className="font-medium text-slate-300">{formatData(pedido.dataReserva)}</span></p>
                                  <p><span className="text-slate-600 mr-2">Pagamento:</span><span className="font-medium text-slate-300">{formatData(pedido.dataPagamento)}</span></p>
                                  <p><span className="text-slate-600 mr-2">Cancelamento:</span><span className="font-medium text-slate-300">{formatData(pedido.dataCancelamento)}</span></p>
                                </div>
                              </div>

                              {/* Motivo cancelamento (se houver) */}
                              {pedido.motivoCancelamento && (
                                <div className="rounded-2xl border border-[#5a1f35]/40 bg-[#2a1118] p-5">
                                  <div className="text-[10px] font-bold text-[#d6a2b0] uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Ban className="w-3 h-3" /> MOTIVO CANCELAMENTO
                                  </div>
                                  <p className="text-xs text-[#d6a2b0] leading-relaxed">{pedido.motivoCancelamento}</p>
                                </div>
                              )}

                              {/* Itens do pedido */}
                              {pedido.itens && pedido.itens.length > 0 && (
                                <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 hover:border-[#a100ff]/20 transition-colors xl:col-span-3">
                                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <PackageCheck className="w-3 h-3" /> ITENS
                                  </div>
                                  <div className="space-y-2">
                                    {pedido.itens.map(item => (
                                      <div key={item.produtoId} className="flex justify-between text-xs text-slate-400">
                                        <span>{item.nomeProduto} <span className="text-slate-600">× {item.quantidade}</span></span>
                                        <span className="text-white font-bold">{formatBRL(item.subtotal)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-700">
                        <Filter className="w-8 h-8" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        {loadingList ? 'Carregando pedidos...' : 'Nenhum pedido encontrado nesta categoria.'}
                      </p>
                      {!loadingList && (
                        <button onClick={() => setSearchTerm('')} className="text-[#a100ff] text-sm font-semibold hover:underline">
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );

  const renderCreateView = () => {
    // Calcula o total do carrinho dinamicamente
    const itensParaCalcular = itensCarrinho.length > 0 ? itensCarrinho : [{ produtoId: selectedProductId, quantidade: 1 }];
    const currentCreateTotalValue = itensParaCalcular.reduce((acc, item) => {
      const prod = produtos.find(p => p.id === item.produtoId);
      return acc + (prod?.preco ?? 0) * item.quantidade;
    }, 0);
    const currentCreateTotal = formatBRL(currentCreateTotalValue);

    return (
      <PageLayout>
        {renderModalCancelamento()}

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

        {erroGlobal && (
          <div className="rounded-xl bg-[#2a1118] border border-[#5a1f35]/60 px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-[#d6a2b0] text-sm font-medium">{erroGlobal}</p>
            <button onClick={() => setErroGlobal(null)} className="text-[#d6a2b0] hover:text-white text-xs font-bold outline-none">✕</button>
          </div>
        )}

        {/* Create Flow Card */}
        <div className="rounded-[24px] overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a] shadow-2xl">

          {/* Step Header */}
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
                    <SearchInput value={clienteSearch} onChange={setClienteSearch} placeholder="Nome, CPF ou telefone do cliente..." />
                    <div className="mt-6 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredClientes.map(cliente => {
                        const isSelected = cliente.id === selectedClientId;
                        return (
                          <button
                            key={cliente.id}
                            onClick={() => setSelectedClientId(cliente.id!)}
                            className={`w-full text-left rounded-2xl border p-4 transition-all duration-300 ${isSelected ? 'border-[#a100ff]/60 bg-[#a100ff]/5' : 'border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#2a2a2a] hover:bg-[#111111]'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${isSelected ? 'bg-white text-[#a100ff] border-white' : 'bg-[#1a1a1a] text-slate-500 border-[#2a2a2a]'}`}>
                                  {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div>
                                  <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>{cliente.nome}</div>
                                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{cliente.cpf}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter mb-0.5">Saldo</div>
                                <div className="text-xs font-black text-[#a1ffdb]">{formatBRL(cliente.contaCorrente?.saldo ?? 0)}</div>
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
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">INFO COMPLEMENTAR</div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[#0b0b0b] border border-[#1a1a1a]">
                        <div className="text-xs text-slate-500 mb-1">Cliente Selecionado</div>
                        <div className="text-sm font-bold text-white">{selectedCliente?.nome ?? 'Nenhum selecionado'}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#0b0b0b] border border-[#1a1a1a]">
                        <div className="text-xs text-slate-500 mb-1">Endereço (CEP)</div>
                        <div className="text-sm font-bold text-white">{selectedCliente?.endereco?.cep ?? '-'}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#0b0b0b] border border-[#a100ff]/10">
                        <div className="text-xs text-slate-500 mb-1">Saldo em Conta</div>
                        <div className="text-sm font-black text-[#a1ffdb]">{formatBRL(selectedCliente?.contaCorrente?.saldo ?? 0)}</div>
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
                      <SearchInput value={productSearch} onChange={setProductSearch} placeholder="Nome ou SKU..." className="h-11" />
                    </div>
                    <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6">
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Item em Seleção</div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-white font-bold">{selectedProduto?.nome ?? 'Selecione'}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{selectedProduto?.sku ?? '...'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-[#d8b4fe]">{selectedProduto ? formatBRL(selectedProduto.preco) : '...'}</div>
                          <div className="text-[10px] text-slate-600 mt-0.5">{selectedProduto?.estoque ?? 0} un. estoque</div>
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
                                <div className="text-sm font-bold text-[#a1ffdb]">{formatBRL(produto.preco)}</div>
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
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-6">ITENS ADICIONADOS</div>
                    {itensCarrinho.length === 0 ? (
                      <p className="text-xs text-slate-600 italic">Nenhum item adicionado ainda.</p>
                    ) : (
                      <div className="space-y-3">
                        {itensCarrinho.map(item => {
                          const prod = produtos.find(p => p.id === item.produtoId);
                          return (
                            <div key={item.produtoId} className="flex justify-between text-xs text-slate-400">
                              <span>{prod?.nome ?? `Produto #${item.produtoId}`}</span>
                              <span className="text-white font-bold">× {item.quantidade}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                    <div className="text-white font-bold">{selectedCliente?.nome}</div>
                    <div className="text-xs text-slate-500 mt-1 font-mono tracking-tighter">{selectedCliente?.cpf}</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#111111] border border-[#2a2a2a] hover:border-[#a100ff]/30 transition-all">
                    <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.2em] mb-4">VOLUME DOCUMENTADO</div>
                    <div className="text-white font-bold">{itensCarrinho.length > 0 ? `${itensCarrinho.length} Tipos de Item` : 'Produto selecionado'}</div>
                    <div className="text-xs text-slate-500 mt-1">Conformidade de estoque em dia</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#111111] border border-[#a100ff]/20 hover:border-[#a100ff]/40 transition-all bg-gradient-to-br from-[#111111] to-[#a100ff]/[0.03]">
                    <div className="text-[10px] font-extrabold text-[#d8b4fe] uppercase tracking-[0.2em] mb-4">MÉTRICA FINAL</div>
                    <div className="text-2xl font-black text-white">{currentCreateTotal}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Calculado pelo backend</div>
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
                        <th className="p-5">Produto</th>
                        <th className="p-5 text-center">Quant.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141414]">
                      {(itensCarrinho.length > 0 ? itensCarrinho : [{ produtoId: selectedProductId, quantidade: 1 }]).map(item => {
                        const prod = produtos.find(p => p.id === item.produtoId);
                        return (
                          <tr key={item.produtoId} className="text-sm hover:bg-[#ffffff]/[0.02] transition-colors">
                            <td className="p-5 text-white font-medium">{prod?.nome ?? `Produto #${item.produtoId}`}</td>
                            <td className="p-5 text-center text-slate-400">{String(item.quantidade).padStart(2, '0')}</td>
                          </tr>
                        );
                      })}
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
                  className="flex-1 sm:flex-initial h-12 px-8 rounded-xl bg-[#111111] hover:bg-[#161616] text-slate-300 hover:text-white border border-[#2a2a2a] hover:border-[#a100ff]/40 outline-none focus:outline-none focus:ring-0 transition-colors font-bold"
                >
                  VOLTAR
                </Button>
                {createStep === 2 && (
                  <Button
                    onClick={adicionarItemCarrinho}
                    className="flex-1 sm:flex-initial h-12 px-8 rounded-xl bg-[#111111] hover:bg-[#161616] text-[#d8b4fe] hover:text-white border border-[#a100ff]/20 hover:border-[#a100ff]/40 outline-none focus:outline-none focus:ring-0 transition-colors uppercase tracking-widest text-xs font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Itens
                  </Button>
                )}
                <Button
                  disabled={salvando || (!selectedClientId && createStep === 1)}
                  onClick={() => {
                    if (createStep < 3) {
                      setCreateStep((createStep + 1) as CreateStep);
                    } else {
                      handleSalvarPedido();
                    }
                  }}
                  className="flex-1 sm:flex-initial h-12 px-10 rounded-xl bg-[#a100ff] hover:bg-[#b933ff] text-white border border-[#a100ff] outline-none focus:outline-none focus:ring-0 transition-colors font-black disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createStep === 3 ? (salvando ? 'SALVANDO...' : 'SALVAR PEDIDO') : 'CONTINUAR'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  };

  const renderDetailView = () => {
  if (!selectedPedido) {
      return (
        <PageLayout>
          <div className="flex flex-col items-center gap-4 py-24">
            <p className="text-slate-500">Pedido não encontrado.</p>
            <button onClick={() => setScreen('list')} className="text-[#a100ff] text-sm font-semibold hover:underline">
              Voltar para lista
            </button>
          </div>
        </PageLayout>
      );
    }

    const pedidoExibido = selectedPedidoCompleto ?? selectedPedido;
    
    const isAberto   = pedidoExibido.status === 'CRIADO';   // era selectedPedido
    const isReservado = pedidoExibido.status === 'RESERVADO';
    const isPago     = pedidoExibido.status === 'PAGO';

    return (
      <PageLayout className="animate-in fade-in duration-700">
        {renderModalCancelamento()}

        {erroGlobal && (
          <div className="rounded-xl bg-[#2a1118] border border-[#5a1f35]/60 px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-[#d6a2b0] text-sm font-medium">{erroGlobal}</p>
            <button onClick={() => setErroGlobal(null)} className="text-[#d6a2b0] hover:text-white text-xs font-bold outline-none">✕</button>
          </div>
        )}

        {/* Detail Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setScreen('list')}
              className="w-11 h-11 rounded-xl bg-[#0b0b0b] border border-[#2a2a2a] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#a100ff]/40 outline-none focus:outline-none focus:ring-0 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-white tracking-tight italic">#{selectedPedido.idPedido}</h1>
                {renderStatusChip(selectedPedido.status as PedidoStatus)}
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Fluxo de venda e liquidação financeira</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 text-[10px] font-bold text-slate-500">
              <Clock3 className="w-3.5 h-3.5" />
              CRIADO EM {formatData(selectedPedido.dataCriacao)}
            </div>
            {selectedPedido.dataPagamento && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#a1ffdb]/10 text-[10px] font-bold text-[#a1ffdb]">
                <CreditCard className="w-3.5 h-3.5" />
                PAGO EM {formatData(selectedPedido.dataPagamento)}
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
              <h4 className="text-sm font-black text-white uppercase tracking-tight">Próxima Ação Recomendada</h4>
              <p className="text-xs text-slate-500 font-medium">
                {isAberto    ? 'Registre a reserva dos itens no estoque para garantir a entrega.'
                : isReservado ? 'Processar o pagamento utilizando o saldo disponível do cliente.'
                : isPago      ? 'O pedido está liquidado. Acompanhe a entrega no painel de relatórios.'
                              : 'Consulte os logs para entender a falha ou motivo do cancelamento.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderActionButtons(selectedPedido.status as PedidoStatus, selectedPedido.idPedido)}
            <Button
              onClick={async () => {
                setAnaliseLoading(true);
                try {
                  const res = await analiseRiscoService.analisarPedido(selectedPedido.idPedido);
                  setAnaliseResultado(res);
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : 'Erro ao analisar o pedido.';
                  setErroGlobal(msg);
                } finally {
                  setAnaliseLoading(false);
                }
              }}
              disabled={analiseLoading}
              className="h-10 px-4 rounded-xl bg-[#111111] border border-[#a100ff]/20 text-[#d8b4fe] hover:bg-[#161616]"
            >
              {analiseLoading ? 'Analisando...' : 'Analisar risco'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#2a2a2a] hover:border-[#a100ff]/20 transition-all">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">ENTIDADE</div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#151515] flex items-center justify-center text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => navigate('/clientes')}
                className="text-left text-white font-bold text-sm truncate hover:text-[#d8b4fe] transition-colors outline-none focus:outline-none focus:ring-0"
              >
                Cliente #{selectedPedido.clienteId}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#2a2a2a] hover:border-[#a100ff]/20 transition-all">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">TOTAL BRUTO</div>
            <div className="text-[#a1ffdb] font-black text-lg tracking-tight">{formatBRL(selectedPedido.totalBruto)}</div>
            <div className="text-[9px] text-slate-600 mt-1 font-bold">Antes de descontos</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#2a2a2a] hover:border-[#a100ff]/20 transition-all">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">DESCONTO</div>
            <div className="text-[#ff9292] font-black text-lg tracking-tight">{formatBRL(selectedPedido.desconto)}</div>
            <div className="text-[9px] text-slate-600 mt-1 font-bold">Aplicado ao pedido</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#a100ff]/20 hover:border-[#a100ff]/40 transition-all bg-gradient-to-br from-[#0b0b0b] to-[#a100ff]/[0.02]">
            <div className="text-[10px] font-bold text-[#d8b4fe] uppercase tracking-widest mb-4">VALOR FINAL</div>
            <div className="text-2xl font-black text-white tracking-tighter">{formatBRL(selectedPedido.totalFinal)}</div>
            <div className="text-[9px] text-slate-500 mt-1 font-bold flex items-center gap-1.5 uppercase">
              <div className="w-1 h-1 rounded-full bg-[#a100ff]/60" />
              Dedução Fiscal Aplicada
            </div>
          </div>
        </div>

        {/* Itens + Sidebar */}
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
                  {selectedPedido.itens && selectedPedido.itens.length > 0 ? (
                    selectedPedido.itens.map(item => (
                      <tr key={item.produtoId} className="group hover:bg-[#ffffff]/[0.015] transition-colors">
                        <td className="p-6 text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{item.nomeProduto}</td>
                        <td className="p-6 text-sm text-slate-500 font-mono italic">{String(item.quantidade).padStart(2, '0')}</td>
                        <td className="p-6 text-sm text-slate-500">{formatBRL(item.precoUnitario)}</td>
                        <td className="p-6 text-right px-8 font-black text-white">{formatBRL(item.subtotal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-xs text-slate-600">
                        Itens não disponíveis nesta visualização.
                      </td>
                    </tr>
                  )}
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
                  <span className="text-slate-300 font-bold">{formatBRL(selectedPedido.totalBruto)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase tracking-tighter">Descontos</span>
                  <span className="text-[#ff9292] font-bold">{formatBRL(selectedPedido.desconto)}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex justify-between items-baseline">
                  <span className="text-[11px] font-black text-white uppercase tracking-tighter">Líquido Final</span>
                  <span className="text-2xl font-black text-white">{formatBRL(selectedPedido.totalFinal)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
              <h3 className="text-xs font-black text-white tracking-widest uppercase mb-6">Linha do Tempo Status</h3>
              <div className="space-y-6 relative ml-1">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#1a1a1a]" />
                {statusOptions.map(status => {
                  const isCurrent = selectedPedido.status === status;
                  return (
                    <div key={status} className="flex items-center gap-4 relative z-10 group">
                      <div className={`w-3 h-3 rounded-full border-2 transition-all group-hover:scale-125 ${
                        isCurrent
                          ? 'bg-[#a100ff] border-[#a100ff] shadow-[0_0_8px_rgba(161,0,255,0.6)]'
                          : 'bg-[#0f0f0f] border-[#2a2a2a]'
                      }`} />
                      <span className={`text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${isCurrent ? 'text-white' : 'text-slate-700'}`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedPedido.motivoCancelamento && (
              <div className="rounded-2xl border border-[#5a1f35]/40 bg-[#2a1118] p-5">
                <div className="text-[10px] font-bold text-[#d6a2b0] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Ban className="w-3 h-3" /> MOTIVO CANCELAMENTO
                </div>
                <p className="text-xs text-[#d6a2b0] leading-relaxed">{selectedPedido.motivoCancelamento}</p>
              </div>
            )}

            <div className="rounded-2xl border border-[#a100ff]/10 bg-[#a100ff]/[0.02] p-5">
              <p className="text-[10px] font-medium text-[#d8b4fe] leading-relaxed flex gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                {isPago      ? 'Liquidação confirmada pelo motor de pagamentos Accentur-Engine.'
                : isReservado ? 'Reserva em processamento. Verifique se o saldo já foi debitado na conta do cliente.'
                : isAberto   ? 'Pedido aguardando acionamento da reserva de estoque manual.'
                             : 'Fluxo finalizado.'}
              </p>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-8 rounded-3xl bg-[#0b0b0b] border border-[#2a2a2a] opacity-60">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#a100ff]" />
            Transação Segura Accenture-Cloud
          </div>
          <div className="text-[11px] font-medium text-slate-500 max-w-sm md:text-right">
            {selectedPedido.status === 'CRIADO'    && 'PRÓXIMO: Reservar itens e validar logística.'}
            {selectedPedido.status === 'RESERVADO' && 'PRÓXIMO: Debitar saldo do cliente e confirmar pagamento.'}
            {selectedPedido.status === 'PAGO'      && 'PRÓXIMO: Gerar nota fiscal e despachar pedido.'}
            {selectedPedido.status === 'CANCELADO' && 'PRÓXIMO: Auditoria de cancelamento.'}
          </div>
        </div>
      </PageLayout>
    );
  };

  return (
    <div className="text-slate-100 font-sans antialiased">
      {screen === 'list'   && renderListView()}
      {screen === 'create' && renderCreateView()}
      {screen === 'detail' && renderDetailView()}
    </div>
  );
}