import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  CreditCard,
  Filter,
  HandCoins,
  Landmark,
  Minus,
  Plus,
  Search,
  Sparkles,
  User,
  Wallet,
  ReceiptText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountView = 'overview' | 'detail';
type AccountType = 'EMPRESA' | 'CLIENTE';
type MovementType =
  | 'DEPOSITO'
  | 'SAQUE'
  | 'PAGAMENTO_PEDIDO'
  | 'CREDITO_EMPRESA'
  | 'ESTORNO_PEDIDO'
  | 'DEBITO_EMPRESA';

type AccountSummary = {
  id: string;
  numeroConta: string;
  titular: string;
  tipo: AccountType;
  saldo: string;
  status: 'ATIVA' | 'INATIVA';
  totalRecebido?: string;
  pedidoRelacionado?: string;
  saldoEmpresaImpacto?: string;
};

type Movement = {
  id: string;
  dataHora: string;
  tipo: MovementType;
  descricao: string;
  valor: string;
  pedidoRelacionado: string;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const customerAccounts: AccountSummary[] = [
  {
    id: '1',
    numeroConta: 'CC-1001',
    titular: 'O nome',
    tipo: 'CLIENTE',
    saldo: 'R$ 1.250,00',
    status: 'ATIVA',
    totalRecebido: 'R$ 3.120,00',
    pedidoRelacionado: 'PED-1024'
  },
  {
    id: '2',
    numeroConta: 'CC-1002',
    titular: 'Maria Silva',
    tipo: 'CLIENTE',
    saldo: 'R$ 2.580,00',
    status: 'ATIVA',
    totalRecebido: 'R$ 4.890,00',
    pedidoRelacionado: 'PED-1025'
  },
  {
    id: '3',
    numeroConta: 'CC-1003',
    titular: 'João Pedro',
    tipo: 'CLIENTE',
    saldo: 'R$ 480,00',
    status: 'INATIVA',
    totalRecebido: 'R$ 1.040,00',
    pedidoRelacionado: 'PED-1026'
  }
];

const companyAccount: AccountSummary = {
  id: 'empresa',
  numeroConta: 'CC-0000',
  titular: 'Loja Empresa',
  tipo: 'EMPRESA',
  saldo: 'R$ 29.402,00',
  status: 'ATIVA',
  totalRecebido: 'R$ 87.220,00',
  saldoEmpresaImpacto: 'R$ 29.402,00'
};

const movementsByAccount: Record<string, Movement[]> = {
  empresa: [
    {
      id: '1',
      dataHora: '09/05/2026 08:40',
      tipo: 'CREDITO_EMPRESA',
      descricao: 'Crédito por pagamento de pedido',
      valor: 'R$ 145,00',
      pedidoRelacionado: 'PED-1024'
    },
    {
      id: '2',
      dataHora: '08/05/2026 16:20',
      tipo: 'DEBITO_EMPRESA',
      descricao: 'Estorno do pedido cancelado',
      valor: 'R$ 89,90',
      pedidoRelacionado: 'PED-1022'
    },
    {
      id: '3',
      dataHora: '08/05/2026 11:10',
      tipo: 'CREDITO_EMPRESA',
      descricao: 'Crédito de pedido pago',
      valor: 'R$ 240,00',
      pedidoRelacionado: 'PED-1021'
    }
  ],
  '1': [
    {
      id: '1',
      dataHora: '09/05/2026 08:40',
      tipo: 'PAGAMENTO_PEDIDO',
      descricao: 'Pagamento do pedido confirmado',
      valor: 'R$ 145,00',
      pedidoRelacionado: 'PED-1024'
    },
    {
      id: '2',
      dataHora: '08/05/2026 10:00',
      tipo: 'DEPOSITO',
      descricao: 'Depósito realizado pelo cliente',
      valor: 'R$ 300,00',
      pedidoRelacionado: '-'
    },
    {
      id: '3',
      dataHora: '07/05/2026 14:30',
      tipo: 'SAQUE',
      descricao: 'Saque solicitado pelo cliente',
      valor: 'R$ 50,00',
      pedidoRelacionado: '-'
    }
  ],
  '2': [
    {
      id: '1',
      dataHora: '09/05/2026 09:10',
      tipo: 'PAGAMENTO_PEDIDO',
      descricao: 'Pagamento do pedido confirmado',
      valor: 'R$ 89,90',
      pedidoRelacionado: 'PED-1025'
    },
    {
      id: '2',
      dataHora: '08/05/2026 12:10',
      tipo: 'DEPOSITO',
      descricao: 'Depósito em conta do cliente',
      valor: 'R$ 800,00',
      pedidoRelacionado: '-'
    },
    {
      id: '3',
      dataHora: '06/05/2026 17:45',
      tipo: 'ESTORNO_PEDIDO',
      descricao: 'Estorno de pedido cancelado',
      valor: 'R$ 60,00',
      pedidoRelacionado: 'PED-1010'
    }
  ],
  '3': [
    {
      id: '1',
      dataHora: '08/05/2026 15:00',
      tipo: 'DEPOSITO',
      descricao: 'Depósito inicial',
      valor: 'R$ 480,00',
      pedidoRelacionado: '-'
    },
    {
      id: '2',
      dataHora: '07/05/2026 12:20',
      tipo: 'SAQUE',
      descricao: 'Saque parcial',
      valor: 'R$ 120,00',
      pedidoRelacionado: '-'
    }
  ]
};

// ─── Style helpers ────────────────────────────────────────────────────────────

const movementStyles: Record<MovementType, string> = {
  DEPOSITO: 'bg-[#a100ff]/10 text-[#d8b4fe] border-[#a100ff]/20',
  SAQUE: 'bg-[#2a1118] text-[#d6a2b0] border-[#5a1f35]/40',
  PAGAMENTO_PEDIDO: 'bg-[#151515] text-slate-200 border-[#3a3a3a]',
  CREDITO_EMPRESA: 'bg-[#7c3aed]/10 text-[#c4b5fd] border-[#7c3aed]/20',
  ESTORNO_PEDIDO: 'bg-[#1a1024] text-[#c4b5fd] border-[#5b21b6]/30',
  DEBITO_EMPRESA: 'bg-[#2a1118] text-[#d6a2b0] border-[#5a1f35]/40'
};

const movementLabels: Record<MovementType, string> = {
  DEPOSITO: 'Depósito',
  SAQUE: 'Saque',
  PAGAMENTO_PEDIDO: 'Pagamento do pedido',
  CREDITO_EMPRESA: 'Crédito empresa',
  ESTORNO_PEDIDO: 'Estorno do pedido',
  DEBITO_EMPRESA: 'Débito empresa'
};

const accountTypeStyles: Record<AccountType, string> = {
  EMPRESA: 'bg-[#a100ff]/10 text-[#d8b4fe] border-[#a100ff]/20',
  CLIENTE: 'bg-[#111111] text-slate-400 border-[#2a2a2a]'
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Contas() {
  const [view, setView] = useState<AccountView>('overview');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('empresa');
  const [search, setSearch] = useState('');

  const selectedAccount = useMemo(() => {
    if (selectedAccountId === 'empresa') {
      return companyAccount;
    }

    return customerAccounts.find(account => account.id === selectedAccountId) ?? customerAccounts[0];
  }, [selectedAccountId]);

  const movements = movementsByAccount[selectedAccount.id] ?? [];

  const filteredCustomerAccounts = customerAccounts.filter(account =>
    account.titular.toLowerCase().includes(search.toLowerCase()) ||
    account.numeroConta.toLowerCase().includes(search.toLowerCase())
  );

  const openAccountDetail = (accountId: string) => {
    setSelectedAccountId(accountId);
    setView('detail');
  };

  const renderAccountChip = (type: AccountType) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest ${accountTypeStyles[type]}`}>
      {type}
    </span>
  );

  const renderMovementChip = (type: MovementType) => (
    <span className={`inline-flex items-center px-3 py-0.5 rounded-full border text-[10px] font-semibold tracking-tight ${movementStyles[type]}`}>
      {movementLabels[type]}
    </span>
  );

  const renderOverview = () => (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      
      {/* 1. Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#0b0b0b] border border-[#2a2a2a] flex items-center justify-center text-[#a100ff]">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Contas</h1>
          </div>
          <p className="text-slate-400 text-sm">Visão geral das contas da empresa e dos clientes</p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0b0b0b] border border-[#2a2a2a] rounded-2xl">
          <Sparkles className="w-4 h-4 text-[#a100ff]" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-none">Saldo consolidado e extratos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Card Conta Empresa */}
        <div className="rounded-[24px] overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a] p-6 lg:col-span-2 shadow-2xl relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
             <Landmark className="w-24 h-24 text-[#a100ff]" />
          </div>

          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="relative z-10">
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
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 hover:bg-[#151515] transition-colors">
              <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Saldo disponível</div>
              <div className="text-2xl font-black text-white">{companyAccount.saldo}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 hover:bg-[#151515] transition-colors">
              <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Total acumulado</div>
              <div className="text-2xl font-black text-[#c4b5fd]">{companyAccount.totalRecebido}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 hover:bg-[#151515] transition-colors">
              <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Número Identificador</div>
              <div className="text-lg font-bold text-white font-mono">{companyAccount.numeroConta}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">{companyAccount.titular}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 sm:flex-initial h-12 px-6 rounded-xl bg-[#111111] border border-[#a100ff]/30 text-[#d8b4fe] font-bold hover:bg-[#a100ff]/10 hover:border-[#a100ff]/50 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Depositar
            </Button>
            <Button className="flex-1 sm:flex-initial h-12 px-6 rounded-xl bg-[#111111] border border-[#5a1f35]/40 text-[#d6a2b0] font-bold hover:bg-[#2a1118] hover:border-[#5a1f35]/60 transition-all">
              <Minus className="w-4 h-4 mr-2" />
              Sacar
            </Button>
            <div className="flex-1 sm:flex-initial sm:ml-auto">
              <Button onClick={() => openAccountDetail('empresa')} className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#a100ff] text-white font-black hover:bg-[#b833ff] shadow-lg shadow-[#a100ff]/20 transition-all">
                Ver detalhes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Card Resumo Rápido */}
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
              <span className="text-white font-bold tracking-tight">Ativa em Operação</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
              <span className="text-slate-500 font-medium tracking-tight">Carteiras gerenciadas</span>
              <span className="text-[#d8b4fe] font-black">{customerAccounts.length} Clientes</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
              <span className="text-slate-500 font-medium tracking-tight">Entradas (24h)</span>
              <span className="text-[#c4b5fd] font-black">R$ 434,90</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
              <span className="text-slate-500 font-medium tracking-tight">Saídas (24h)</span>
              <span className="text-[#d6a2b0] font-black">R$ 50,00</span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl border border-[#2a2a2a] bg-[#a100ff]/[0.02] text-[11px] text-slate-500 leading-relaxed italic">
            Monitoramento em tempo real do caixa e extratos analíticos.
          </div>
        </div>
      </div>

      {/* 4. Tabela de Clientes */}
      <div className="rounded-[24px] overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a] shadow-2xl">
        <div className="px-8 py-6 border-b border-[#1a1a1a] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight">Lista de Carteiras</h2>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Controle de saldos e transações dos clientes</p>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Titular ou Nº..."
                  className="w-full h-11 bg-[#111111] rounded-xl px-4 pr-12 text-sm text-slate-200 placeholder-slate-700 border border-[#2a2a2a] focus:border-[#a100ff]/50 focus:outline-none transition-all"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
             </div>
             <div className="flex items-center gap-2 px-4 h-11 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-400 text-[11px] font-bold uppercase tracking-widest">
               <Filter className="w-3.5 h-3.5" />
               {customerAccounts.length} CONTAS
             </div>
          </div>
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
              {filteredCustomerAccounts.map(account => (
                <tr key={account.id} className="group hover:bg-[#ffffff]/[0.01] transition-colors">
                  <td className="p-6 font-mono text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{account.numeroConta}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-500 group-hover:border-[#a100ff]/30 transition-all">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-slate-200 font-bold text-sm tracking-tight group-hover:text-white transition-colors">{account.titular}</div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">Último: <span className="text-[#a100ff]/60 tracking-tighter">{account.pedidoRelacionado}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 font-black text-white group-hover:text-[#c4b5fd] transition-colors">{account.saldo}</td>
                  <td className="p-6">{renderAccountChip(account.tipo)}</td>
                  <td className="p-6 text-right px-8">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        onClick={() => openAccountDetail(account.id)}
                        className="bg-[#a100ff] text-white hover:bg-[#b833ff] rounded-lg h-8 px-4 text-[11px] font-bold transition-all shadow-lg shadow-[#a100ff]/10"
                      >
                        DETALHES
                      </Button>
                      <Button className="bg-[#111111] border border-[#2a2a2a] text-slate-400 hover:text-white hover:bg-[#151515] rounded-lg h-8 px-4 text-[11px] font-bold transition-all">
                        PEDIDO
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      
      {/* Detail Breadcrumb */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setView('overview')} 
          className="w-11 h-11 rounded-xl bg-[#0b0b0b] border border-[#2a2a2a] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#a100ff]/40 transition-all shadow-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Detalhes do Extrato</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Painel analítico dE movimentações</p>
        </div>
      </div>

      <div className="rounded-[24px] overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a] shadow-2xl">
        
        {/* Header Detalhe */}
        <div className="bg-[#0f0f0f] px-8 py-6 border-b border-[#1a1a1a] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-[#111111] border border-[#1a1a1a] flex items-center justify-center text-[#a100ff] shadow-inner">
               <ReceiptText className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-white font-bold text-xl tracking-tight">Conta #{selectedAccount.numeroConta}</h2>
               <p className="text-xs text-slate-500 font-medium">Titular: <span className="text-slate-300 font-bold lowercase">@{selectedAccount.titular.toLowerCase().replace(" ", "")}</span></p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            {renderAccountChip(selectedAccount.tipo)}
            <div className="w-px h-8 bg-[#1a1a1a] mx-1 hidden sm:block" />
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#111111] border border-[#2a2a2a]">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Saldo</span>
              <span className="text-lg font-black text-white">{selectedAccount.saldo}</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
             <div className="p-5 rounded-2xl bg-[#111111] border border-[#2a2a2a] hover:border-[#a100ff]/20 transition-all">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">CONTA</div>
                <div className="text-white font-bold text-sm font-mono">{selectedAccount.numeroConta}</div>
             </div>
             <div className="p-5 rounded-2xl bg-[#111111] border border-[#2a2a2a] hover:border-[#a100ff]/20 transition-all">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">TIPO</div>
                <div className="text-[#d8b4fe] font-black text-xs uppercase tracking-tighter">{selectedAccount.tipo} OPERACIONAL</div>
             </div>
             <div className="p-5 rounded-2xl bg-[#111111] border border-[#2a2a2a] hover:border-[#a100ff]/20 transition-all">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">TITULAR</div>
                <div className="text-white font-bold text-sm truncate">{selectedAccount.titular}</div>
             </div>
             <div className="p-5 rounded-2xl bg-[#111111] border border-[#a100ff]/20 hover:border-[#a100ff]/30 transition-all bg-gradient-to-br from-[#111111] to-[#a100ff]/[0.02]">
                <div className="text-[10px] font-bold text-[#d8b4fe] uppercase tracking-widest mb-3">LIQUIDEZ</div>
                <div className="text-white font-black text-base">{selectedAccount.saldo}</div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            
            {/* Movements Table */}
            <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden bg-[#0b0b0b] shadow-xl">
              <div className="px-6 py-5 border-b border-[#1a1a1a] bg-[#0f0f0f]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-[#a100ff] animate-pulse" />
                   <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Registro Histórico</h3>
                </div>
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{movements.length} EVENTOS</div>
              </div>

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
                    {movements.map(movimentacao => (
                      <tr key={movimentacao.id} className="group hover:bg-[#ffffff]/[0.015] transition-colors">
                        <td className="p-5 text-[11px] font-mono text-slate-500 whitespace-nowrap">{movimentacao.dataHora}</td>
                        <td className="p-5">{renderMovementChip(movimentacao.tipo)}</td>
                        <td className="p-5 text-xs text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">{movimentacao.descricao}</td>
                        <td className="p-5 font-bold text-white tracking-tight">{movimentacao.valor}</td>
                        <td className="p-5 text-right px-8">
                          <Button className="bg-[#111111] border border-[#2a2a2a] text-slate-400 hover:text-[#a100ff] hover:border-[#a100ff]/30 rounded-lg h-8 px-3 text-[10px] font-bold transition-all transition-all">
                             VER PEDIDO
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar Detalhe */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6 shadow-xl">
                <h3 className="text-xs font-black text-white tracking-widest uppercase mb-6 flex items-center gap-2">
                   CONTROLES DE CAIXA
                   <HandCoins className="w-4 h-4 text-[#a100ff]/60" />
                </h3>
                <div className="flex flex-col gap-3">
                  <Button className="w-full h-12 px-6 rounded-xl bg-[#111111] border border-[#a100ff]/30 text-[#d8b4fe] font-bold hover:bg-[#a100ff]/10 hover:border-[#a100ff]/50 transition-all justify-start">
                    <Plus className="w-4 h-4 mr-3" />
                    Depositar Fundos
                  </Button>
                  <Button className="w-full h-12 px-6 rounded-xl bg-[#111111] border border-[#5a1f35]/40 text-[#d6a2b0] font-bold hover:bg-[#2a1118] hover:border-[#5a1f35]/60 transition-all justify-start">
                    <Minus className="w-4 h-4 mr-3" />
                    Solicitar Saque
                  </Button>
                  <Button className="w-full h-12 px-6 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-400 font-bold hover:bg-[#151515] hover:text-white transition-all justify-start">
                    <ReceiptText className="w-4 h-4 mr-3" />
                    Pedido Relacionado
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-[#a100ff]/10 bg-[#a100ff]/[0.02] p-6">
                <div className="flex items-center gap-3 mb-4 text-[#d8b4fe]">
                   <Landmark className="w-5 h-5 flex-shrink-0" />
                   <h4 className="text-xs font-black uppercase tracking-widest">Impacto Financeiro</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                  A conciliação bancária deve considerar o tempo de processamento do Accentur-Engine para garantir que o saldo visual reflita a realidade em conta.
                </p>
              </div>

              <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
                <div className="flex items-center gap-3 mb-4 text-[#c4b5fd]">
                  <Banknote className="w-5 h-5 flex-shrink-0" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Resumo Operacional</h4>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between text-xs font-medium"><span className="text-slate-600 uppercase tracking-tighter">Saldo Atual</span><span className="text-white font-black">{selectedAccount.saldo}</span></div>
                   <div className="flex justify-between text-xs font-medium"><span className="text-slate-600 uppercase tracking-tighter">Estado</span><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${selectedAccount.status === 'ATIVA' ? 'bg-[#c4b5fd]/10 text-[#c4b5fd] border-[#c4b5fd]/20' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>{selectedAccount.status}</span></div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans antialiased">
       <div className="py-8 px-4 sm:px-6">
          {view === 'overview' ? renderOverview() : renderDetail()}
       </div>
    </div>
  );
}
