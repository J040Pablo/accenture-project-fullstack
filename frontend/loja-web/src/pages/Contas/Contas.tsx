import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  ReceiptText,
  User,
  Wallet,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { contaService } from '../../services/contaService';
import { movimentacaoService } from '../../services/movimentacaoService';
import type { Conta } from '../../types/Conta';
import type { Movimentacao } from '../../types/Movimentacao';

type AccountView = 'overview' | 'detail';

type MovementBadge = 'DEPOSITO' | 'SAQUE' | 'PAGAMENTO_PEDIDO' | 'RECEBIMENTO_EMPRESA' | 'ESTORNO_CLIENTE' | 'ESTORNO_EMPRESA';

const movementLabels: Record<MovementBadge, string> = {
  DEPOSITO: 'Depósito',
  SAQUE: 'Saque',
  PAGAMENTO_PEDIDO: 'Pagamento',
  RECEBIMENTO_EMPRESA: 'Recebimento',
  ESTORNO_CLIENTE: 'Estorno cliente',
  ESTORNO_EMPRESA: 'Estorno empresa',
};

const movementStyles: Record<MovementBadge, string> = {
  DEPOSITO: 'bg-[#a100ff]/10 text-[#d8b4fe] border-[#a100ff]/20',
  SAQUE: 'bg-[#2a1118] text-[#d6a2b0] border-[#5a1f35]/40',
  PAGAMENTO_PEDIDO: 'bg-[#151515] text-slate-200 border-[#3a3a3a]',
  RECEBIMENTO_EMPRESA: 'bg-[#7c3aed]/10 text-[#c4b5fd] border-[#7c3aed]/20',
  ESTORNO_CLIENTE: 'bg-[#1a1024] text-[#c4b5fd] border-[#5b21b6]/30',
  ESTORNO_EMPRESA: 'bg-[#2a1118] text-[#d6a2b0] border-[#5a1f35]/40',
};

const accountTypeStyles = {
  EMPRESA: 'bg-[#a100ff]/10 text-[#d8b4fe] border-[#a100ff]/20',
  CLIENTE: 'bg-[#111111] text-slate-400 border-[#2a2a2a]',
} as const;

const formatMoney = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export default function Contas() {
  const navigate = useNavigate();
  const [view, setView] = useState<AccountView>('overview');
  const [contas, setContas] = useState<Conta[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [isLoadingContas, setIsLoadingContas] = useState(false);
  const [isLoadingMovimentacoes, setIsLoadingMovimentacoes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entradas24h, setEntradas24h] = useState<number | null>(null);
  const [saidas24h, setSaidas24h] = useState<number | null>(null);
  const [isLoadingResumo24h, setIsLoadingResumo24h] = useState(false);

  useEffect(() => {
    async function carregarContas() {
      setIsLoadingContas(true);
      setError(null);
      try {
        const response = await contaService.listar();
        const contasRecebidas = response.data ?? [];
        setContas(contasRecebidas);
        setSelectedAccountId((atual) => atual ?? contasRecebidas[0]?.id ?? null);
      } catch {
        setError('Não foi possível carregar as contas.');
      } finally {
        setIsLoadingContas(false);
      }
    }

    carregarContas();
  }, []);

  useEffect(() => {
    if (!selectedAccountId) {
      setMovimentacoes([]);
      return;
    }

    const contaId = selectedAccountId;

    async function carregarMovimentacoes() {
      setIsLoadingMovimentacoes(true);
      setError(null);
      try {
        const response = await movimentacaoService.listarPorConta(contaId);
        setMovimentacoes(response.data ?? []);
      } catch {
        setMovimentacoes([]);
        setError('Não foi possível carregar as movimentações.');
      } finally {
        setIsLoadingMovimentacoes(false);
      }
    }

    carregarMovimentacoes();
  }, [selectedAccountId]);



  const empresaConta = useMemo(() => contas.find((conta) => conta.tipoTitular === 'EMPRESA'), [contas]);
  const contasCliente = useMemo(() => contas.filter((conta) => conta.tipoTitular === 'CLIENTE'), [contas]);
  const selectedAccount = useMemo(
    () => contas.find((conta) => conta.id === selectedAccountId) ?? null,
    [contas, selectedAccountId],
  );

  useEffect(() => {
    // Compute 24h summary for company account
    let mounted = true;
    async function carregarResumo24h() {
      setIsLoadingResumo24h(true);
      setEntradas24h(null);
      setSaidas24h(null);
      if (!empresaConta?.id) {
        setEntradas24h(0);
        setSaidas24h(0);
        setIsLoadingResumo24h(false);
        return;
      }

      try {
        const res = await movimentacaoService.listarPorConta(empresaConta.id);
        const movs: Movimentacao[] = (res.data ?? []) as Movimentacao[];
        const agora = Date.now();
        const umDiaMs = 24 * 60 * 60 * 1000;

        // Types defined in project — classify correctly for the company's account
        const entradasTipos: Movimentacao['tipo'][] = ['DEPOSITO', 'RECEBIMENTO_EMPRESA'];
        const saidasTipos: Movimentacao['tipo'][] = ['SAQUE', 'ESTORNO_EMPRESA'];

        let entradas = 0;
        let saidas = 0;

        for (const m of movs) {
          const dt = new Date(m.dataHora);
          if (Number.isNaN(dt.getTime())) continue;
          const diff = agora - dt.getTime();
          if (diff < 0 || diff > umDiaMs) continue;

          const valor = Number(m.valor ?? 0) || 0;
          if (entradasTipos.includes(m.tipo)) {
            entradas += valor;
          } else if (saidasTipos.includes(m.tipo)) {
            // aggregate absolute value for outflows
            saidas += Math.abs(valor);
          }
        }

        if (!mounted) return;
        setEntradas24h(entradas);
        setSaidas24h(saidas);
      } catch (err) {
        if (!mounted) return;
        setEntradas24h(0);
        setSaidas24h(0);
      } finally {
        if (!mounted) return;
        setIsLoadingResumo24h(false);
      }
    }

    carregarResumo24h();
    return () => { mounted = false; };
  }, [empresaConta?.id]);

  const renderAccountChip = (tipo: Conta['tipoTitular']) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest ${accountTypeStyles[tipo]}`}>
      {tipo}
    </span>
  );

  const renderMovementChip = (tipo: Movimentacao['tipo']) => {
    const key = tipo as MovementBadge;
    return (
      <span className={`inline-flex items-center px-3 py-0.5 rounded-full border text-[10px] font-semibold tracking-tight ${movementStyles[key] ?? movementStyles.PAGAMENTO_PEDIDO}`}>
        {movementLabels[key] ?? tipo}
      </span>
    );
  };

  const openDetail = (accountId: number) => {
    setSelectedAccountId(accountId);
    setView('detail');
  };

  const renderOverview = () => (
    <PageLayout>
      <PageHeader
        title="Contas"
        subtitle="Visão geral das contas da empresa e dos clientes"
        icon={<CreditCard className="w-5 h-5" />}
        action={
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0b0b0b] border border-[#2a2a2a] rounded-xl">
            <Wallet className="w-4 h-4 text-[#a100ff]" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-none">Saldo consolidado e extratos</span>
          </div>
        }
      />

      {isLoadingContas ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 text-slate-400">Carregando contas...</div>
      ) : error && contas.length === 0 ? (
        <div className="rounded-2xl border border-[#5a1f35]/40 bg-[#2a1118]/40 p-6 text-[#d6a2b0]">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-[24px] overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a] p-6 lg:col-span-2 shadow-2xl relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Landmark className="w-24 h-24 text-[#a100ff]" />
            </div>

            <div className="flex items-center justify-between gap-3 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-300">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-white font-bold text-xl tracking-tight">Conta da empresa</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium">Gestão de saldos operacionais e impactos em conta</p>
              </div>
              {renderAccountChip('EMPRESA')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5">
                <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Saldo disponível</div>
                <div className="text-2xl font-black text-white">{empresaConta ? formatMoney(empresaConta.saldo) : '--'}</div>
              </div>
              <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5">
                <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Identificador</div>
                <div className="text-lg font-bold text-white font-mono">{empresaConta?.numeroConta ?? '--'}</div>
              </div>
              <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5">
                <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Tipo</div>
                <div className="text-[#d8b4fe] font-black text-xs uppercase tracking-tighter">{empresaConta?.tipoTitular ?? '--'}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 sm:flex-initial sm:ml-auto">
                <Button onClick={() => selectedAccountId && openDetail(selectedAccountId)} className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#a100ff] hover:bg-[#b933ff] text-white border border-[#a100ff] outline-none focus:outline-none focus:ring-0 transition-colors font-black">
                  Ver detalhes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a] p-6 shadow-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-[#a100ff]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Resumo Rápido</h3>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Conferência da operação</p>
              </div>
            </div>

              <div className="space-y-4 text-sm flex-1">
              <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                <span className="text-slate-500 font-medium">Conta principal</span>
                <span className="text-white font-bold tracking-tight">Ativa em operação</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                <span className="text-slate-500 font-medium tracking-tight">Carteiras gerenciadas</span>
                <span className="text-[#d8b4fe] font-black">{contasCliente.length} Clientes</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                <span className="text-slate-500 font-medium tracking-tight">Entradas da empresa (24h)</span>
                <span className="text-[#c4b5fd] font-black">{isLoadingResumo24h ? 'Carregando...' : formatMoney(entradas24h ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                <span className="text-slate-500 font-medium tracking-tight">Saídas da empresa (24h)</span>
                <span className="text-[#d6a2b0] font-black">{isLoadingResumo24h ? 'Carregando...' : formatMoney(saidas24h ?? 0)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl border border-[#2a2a2a] bg-[#a100ff]/[0.02] text-[11px] text-slate-500 leading-relaxed italic">
              Monitoramento em tempo real do caixa e extratos analíticos.
            </div>
          </div>

          <div className="rounded-[24px] overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a] shadow-2xl lg:col-span-3">
            <div className="px-8 py-6 border-b border-[#1a1a1a] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-white font-bold text-xl tracking-tight">Lista de carteiras</h2>
                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Controle de saldos e transações dos clientes</p>
              </div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{contasCliente.length} resultados</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="text-slate-600 border-b border-[#1a1a1a] text-[10px] font-bold uppercase tracking-[0.15em] bg-[#0f0f0f]/40">
                    <th className="p-6">Identificador</th>
                    <th className="p-6">Detalhamento Titular</th>
                    <th className="p-6">Disponível em Conta</th>
                    <th className="p-6">Tipo</th>
                    <th className="p-6 text-right px-8">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]">
                  {contasCliente.map((account) => (
                    <tr key={account.id} className="group hover:bg-[#ffffff]/[0.01] transition-colors">
                      <td className="p-6 font-mono text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{account.numeroConta}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-500 group-hover:border-[#a100ff]/30 transition-all">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-slate-200 font-bold text-sm tracking-tight group-hover:text-white transition-colors">{account.titularNome ?? 'Titular não informado'}</div>
                            <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">Conta: <span className="text-[#a100ff]/60 tracking-tighter">{account.numeroConta}</span></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 font-black text-white group-hover:text-[#c4b5fd] transition-colors">{formatMoney(account.saldo)}</td>
                      <td className="p-6">{renderAccountChip(account.tipoTitular)}</td>
                      <td className="p-6 text-right px-8">
                        <Button onClick={() => openDetail(account.id)} className="bg-[#a100ff] hover:bg-[#b933ff] text-white border border-[#a100ff] rounded-xl h-8 px-4 text-[11px] font-bold outline-none focus:outline-none focus:ring-0 transition-colors">
                          DETALHES
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );

  const renderDetail = () => (
    <PageLayout className="animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setView('overview')}
          className="w-11 h-11 rounded-xl bg-[#0b0b0b] border border-[#2a2a2a] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#a100ff]/40 outline-none focus:outline-none focus:ring-0 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Detalhes do Extrato</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Painel analítico de movimentações</p>
        </div>
      </div>

      <div className="rounded-[24px] overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a] shadow-2xl">
        <div className="bg-[#0f0f0f] px-8 py-6 border-b border-[#1a1a1a] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#111111] border border-[#1a1a1a] flex items-center justify-center text-[#a100ff] shadow-inner">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl tracking-tight">Conta #{selectedAccount?.numeroConta ?? '--'}</h2>
              <p className="text-xs text-slate-500 font-medium">Titular: <span className="text-slate-300 font-bold">{selectedAccount?.titularNome ?? '--'}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedAccount && renderAccountChip(selectedAccount.tipoTitular)}
            <div className="w-px h-8 bg-[#1a1a1a] mx-1 hidden sm:block" />
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#111111] border border-[#2a2a2a]">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Saldo</span>
              <span className="text-lg font-black text-white">{selectedAccount ? formatMoney(selectedAccount.saldo) : '--'}</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#2a2a2a]">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Conta</div>
              <div className="text-white font-bold text-sm font-mono">{selectedAccount?.numeroConta ?? '--'}</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#2a2a2a]">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Tipo</div>
              <div className="text-[#d8b4fe] font-black text-xs uppercase tracking-tighter">{selectedAccount?.tipoTitular ?? '--'} operacional</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#2a2a2a]">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Titular</div>
              <div className="text-white font-bold text-sm truncate">{selectedAccount?.titularNome ?? '--'}</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#a100ff]/20 bg-gradient-to-br from-[#111111] to-[#a100ff]/[0.02]">
              <div className="text-[10px] font-bold text-[#d8b4fe] uppercase tracking-widest mb-3">Liquidez</div>
              <div className="text-white font-black text-base">{selectedAccount ? formatMoney(selectedAccount.saldo) : '--'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden bg-[#0b0b0b] shadow-xl">
              <div className="px-6 py-5 border-b border-[#1a1a1a] bg-[#0f0f0f]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#a100ff] animate-pulse" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Registro Histórico</h3>
                </div>
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{movimentacoes.length} eventos</div>
              </div>

              {isLoadingMovimentacoes ? (
                <div className="p-8 text-slate-400">Carregando movimentações...</div>
              ) : error && movimentacoes.length === 0 ? (
                <div className="p-8 text-[#d6a2b0]">{error}</div>
              ) : movimentacoes.length === 0 ? (
                <div className="p-8 text-slate-500">Nenhuma movimentação encontrada.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-600 border-b border-[#141414] text-[10px] font-bold uppercase tracking-[0.1em] bg-[#0b0b0b]">
                        <th className="p-5">Temporal</th>
                        <th className="p-5">Categoria</th>
                        <th className="p-5">Descrição Analítica</th>
                        <th className="p-5">Valor</th>
                        <th className="p-5 text-right px-8">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141414]">
                      {movimentacoes.map((movimentacao) => (
                        <tr key={movimentacao.id} className="group hover:bg-[#ffffff]/[0.015] transition-colors">
                          <td className="p-5 text-[11px] font-mono text-slate-500 whitespace-nowrap">{new Date(movimentacao.dataHora).toLocaleString('pt-BR')}</td>
                          <td className="p-5">{renderMovementChip(movimentacao.tipo)}</td>
                          <td className="p-5 text-xs text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">{movimentacao.descricao}</td>
                          <td className="p-5 font-bold text-white tracking-tight">{formatMoney(movimentacao.valor)}</td>
                          <td className="p-5 text-right px-8">
                            {movimentacao.pedidoId ? (
                              <Button
                                type="button"
                                onClick={() => navigate('/pedidos')}
                                className="bg-[#151515] hover:bg-[#1a1a1a] text-[#d8b4fe] hover:text-white border border-[#a100ff]/20 hover:border-[#a100ff]/50 rounded-xl h-9 px-4 text-xs outline-none focus:outline-none focus:ring-0 transition-colors"
                              >
                                Ver pedido relacionado
                              </Button>
                            ) : (
                              <span className="text-[10px] uppercase tracking-widest text-slate-600">Sem pedido</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-[#a100ff]/10 bg-[#a100ff]/[0.02] p-6">
                <div className="flex items-center gap-3 mb-4 text-[#d8b4fe]">
                  <Landmark className="w-5 h-5 flex-shrink-0" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Fluxo de movimentações</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  As movimentações são geradas automaticamente pelos fluxos de pagamento e estorno de pedidos. A conta da empresa é creditada conforme os clientes realizam pagamentos.
                </p>
              </div>

              <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
                <div className="flex items-center gap-3 mb-4 text-[#c4b5fd]">
                  <Banknote className="w-5 h-5 flex-shrink-0" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Resumo operacional</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600 uppercase tracking-tighter">Saldo atual</span>
                    <span className="text-white font-black">{selectedAccount ? formatMoney(selectedAccount.saldo) : '--'}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600 uppercase tracking-tighter">Tipo</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border bg-[#c4b5fd]/10 text-[#c4b5fd] border-[#c4b5fd]/20">
                      {selectedAccount?.tipoTitular ?? '--'}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#d8b4fe] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para o dashboard
      </button>
    </PageLayout>
  );

  return <div className="text-slate-100 font-sans antialiased">{view === 'overview' ? renderOverview() : renderDetail()}</div>;
}
