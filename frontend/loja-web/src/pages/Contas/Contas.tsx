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
  ListOrdered,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  Wallet,
  ReceiptText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

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

const movementStyles: Record<MovementType, string> = {
  DEPOSITO: 'bg-[#064e3b] text-[#a7f3d0] border-[#10b981]',
  SAQUE: 'bg-[#7f1d1d] text-[#fecaca] border-[#ef4444]',
  PAGAMENTO_PEDIDO: 'bg-[#4a136f] text-[#e8c7ff] border-[#c000ff]',
  CREDITO_EMPRESA: 'bg-[#1e3a8a] text-[#dbeafe] border-[#3b82f6]',
  ESTORNO_PEDIDO: 'bg-[#581c87] text-[#f3e8ff] border-[#c084fc]',
  DEBITO_EMPRESA: 'bg-[#7f1d1d] text-[#fecaca] border-[#ef4444]'
};

const movementLabels: Record<MovementType, string> = {
  DEPOSITO: 'Depósito',
  SAQUE: 'Saque',
  PAGAMENTO_PEDIDO: 'Pagamento do pedido',
  CREDITO_EMPRESA: 'Crédito empresa',
  ESTORNO_PEDIDO: 'Estorno do pedido',
  DEBITO_EMPRESA: 'Débito empresa'
};

const inputClassName =
  'w-full bg-[#2a2a2a] h-12 rounded-full px-4 text-sm text-white placeholder-slate-400 border border-transparent focus:border-[#c000ff] focus:outline-none transition-colors';

const accountTypeStyles: Record<AccountType, string> = {
  EMPRESA: 'bg-[#4a136f] text-[#e8c7ff] border-[#5b148a]',
  CLIENTE: 'bg-[#1e3a8a] text-[#dbeafe] border-[#3b82f6]'
};

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
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${accountTypeStyles[type]}`}>
      {type}
    </span>
  );

  const renderMovementChip = (type: MovementType) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-semibold ${movementStyles[type]}`}>
      {movementLabels[type]}
    </span>
  );

  const renderOverview = () => (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-white">Contas</h1>
          </div>
          <p className="text-slate-300">Visão geral das contas da empresa e dos clientes</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 py-2">
          <Sparkles className="w-4 h-4 text-[#d482ff]" />
          Saldo consolidado e extratos financeiros
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-[20px] overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl shadow-black/20 p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-white font-semibold text-lg">Conta da empresa</h2>
              </div>
              <p className="text-xs text-slate-400">Saldo atual, total recebido e impacto nas operações</p>
            </div>

            {renderAccountChip('EMPRESA')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="text-xs text-slate-500 mb-2">Saldo atual</div>
              <div className="text-2xl font-bold text-white">{companyAccount.saldo}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="text-xs text-slate-500 mb-2">Total recebido</div>
              <div className="text-2xl font-bold text-[#a7f3d0]">{companyAccount.totalRecebido}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="text-xs text-slate-500 mb-2">Conta</div>
              <div className="text-lg font-semibold text-white">{companyAccount.numeroConta}</div>
              <div className="text-xs text-slate-400 mt-1">Titular: {companyAccount.titular}</div>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button className="bg-[#064e3b] hover:bg-[#0f766e] text-white rounded-full h-12 px-6">
              <Plus className="w-4 h-4 mr-2" />
              Depositar
            </Button>
            <Button className="bg-[#7f1d1d] hover:bg-[#991b1b] text-white rounded-full h-12 px-6">
              <Minus className="w-4 h-4 mr-2" />
              Sacar
            </Button>
            <Button onClick={() => openAccountDetail('empresa')} className="bg-[#4a136f] hover:bg-[#5b148a] text-white rounded-full h-12 px-6">
              Ver detalhes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="rounded-[20px] overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl shadow-black/20 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Resumo rápido</h3>
              <p className="text-xs text-slate-400 mt-0.5">Conferência da operação</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Conta da empresa</span>
              <span className="text-white font-medium">Ativa</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Contas de clientes</span>
              <span className="text-white font-medium">{customerAccounts.length}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Entradas do dia</span>
              <span className="text-[#a7f3d0] font-medium">R$ 434,90</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Saídas do dia</span>
              <span className="text-[#fecaca] font-medium">R$ 50,00</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4 text-sm text-slate-300">
            Mostre nesta área o saldo atual, total recebido e a leitura financeira da empresa.
          </div>
        </div>
      </div>

      <div className="rounded-[20px] overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl shadow-black/20">
        <div className="p-5 border-b border-[#2a2a2a] flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white font-semibold text-lg">Clientes com conta</h2>
            <p className="text-xs text-slate-400 mt-1">Número da conta, saldo e ações</p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 h-11 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-slate-300 text-sm">
            <Filter className="w-4 h-4" />
            {customerAccounts.length} contas
          </div>
        </div>

        <div className="p-5 border-b border-[#2a2a2a]">
          <div className="flex w-full relative">
            <input
              type="text"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar cliente ou número da conta"
              className="w-full h-12 bg-[#1a1a1a] rounded-full px-6 pr-14 text-slate-200 placeholder-slate-500 border border-transparent focus:border-[#c000ff] focus:outline-none transition-colors"
            />
            <button className="absolute right-0 top-0 h-12 w-12 bg-[#c000ff] rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all border border-transparent focus:border-[#c000ff] outline-none focus:outline-none">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-slate-500 border-b border-[#2a2a2a] text-xs font-semibold uppercase">
                <th className="font-medium p-5">Número da conta</th>
                <th className="font-medium p-5">Titular</th>
                <th className="font-medium p-5">Saldo</th>
                <th className="font-medium p-5">Tipo</th>
                <th className="font-medium p-5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredCustomerAccounts.map(account => (
                <tr key={account.id} className="hover:bg-[#161616] transition-colors">
                  <td className="p-5 font-medium text-slate-100">{account.numeroConta}</td>
                  <td className="p-5 text-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{account.titular}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Pedido relacionado: {account.pedidoRelacionado}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 font-semibold text-[#a7f3d0]">{account.saldo}</td>
                  <td className="p-5">{renderAccountChip(account.tipo)}</td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => openAccountDetail(account.id)}
                        className="bg-[#4a136f] hover:bg-[#5b148a] text-white rounded-full h-9 px-4 text-xs"
                      >
                        Detalhes
                      </Button>
                      <Button className="bg-[#1e3a8a] hover:bg-[#2246a8] text-white rounded-full h-9 px-4 text-xs">
                        Ver pedido
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
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <Button onClick={() => setView('overview')} className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white rounded-full h-11 px-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="text-slate-400 text-sm">Contas → Detalhes da Conta</div>
      </div>

      <div className="rounded-[20px] overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl shadow-black/20">
        <div className="bg-[#5b148a] px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-white font-semibold text-lg">Detalhes da conta</h2>
            <p className="text-white/70 text-sm mt-0.5">Conta do cliente ou da empresa</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {renderAccountChip(selectedAccount.tipo)}
            <span className="inline-flex items-center gap-2 text-xs text-white/80 bg-black/20 border border-white/10 px-3 py-1 rounded-full">
              <ListOrdered className="w-4 h-4" />
              {selectedAccount.numeroConta}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
              <div className="text-xs text-slate-500 mb-2">Número da conta</div>
              <div className="text-white font-semibold">{selectedAccount.numeroConta}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
              <div className="text-xs text-slate-500 mb-2">Tipo da conta</div>
              <div className="text-white font-semibold">{selectedAccount.tipo}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
              <div className="text-xs text-slate-500 mb-2">Titular</div>
              <div className="text-white font-semibold">{selectedAccount.titular}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
              <div className="text-xs text-slate-500 mb-2">Saldo atual</div>
              <div className="text-[#a7f3d0] font-semibold">{selectedAccount.saldo}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a2a] bg-[#151515] flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Extrato / movimentações</h3>
                  <p className="text-xs text-slate-400 mt-1">Entradas, saídas, pagamentos e estornos</p>
                </div>
                <div className="text-xs text-slate-400">{movements.length} movimentações</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-[#2a2a2a] text-xs uppercase">
                      <th className="font-medium p-4">Data/hora</th>
                      <th className="font-medium p-4">Tipo de movimentação</th>
                      <th className="font-medium p-4">Descrição</th>
                      <th className="font-medium p-4">Valor</th>
                      <th className="font-medium p-4">Pedido relacionado</th>
                      <th className="font-medium p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a] bg-[#111111]">
                    {movements.map(movimentacao => (
                      <tr key={movimentacao.id} className="hover:bg-[#161616] transition-colors">
                        <td className="p-4 text-slate-300">{movimentacao.dataHora}</td>
                        <td className="p-4">{renderMovementChip(movimentacao.tipo)}</td>
                        <td className="p-4 text-white">{movimentacao.descricao}</td>
                        <td className="p-4 font-semibold text-[#d482ff]">{movimentacao.valor}</td>
                        <td className="p-4 text-slate-300">{movimentacao.pedidoRelacionado}</td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button className="bg-[#1e3a8a] hover:bg-[#2246a8] text-white rounded-full h-9 px-4 text-xs">
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Ver pedido relacionado
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-5">
                <h3 className="text-white font-semibold mb-4">Ações</h3>
                <div className="flex flex-col gap-3">
                  <Button className="bg-[#064e3b] hover:bg-[#0f766e] text-white rounded-full h-12 px-6 justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Depositar
                  </Button>
                  <Button className="bg-[#7f1d1d] hover:bg-[#991b1b] text-white rounded-full h-12 px-6 justify-start">
                    <Minus className="w-4 h-4 mr-2" />
                    Sacar
                  </Button>
                  <Button className="bg-[#4a136f] hover:bg-[#5b148a] text-white rounded-full h-12 px-6 justify-start">
                    <ReceiptText className="w-4 h-4 mr-2" />
                    Ver pedido relacionado
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 text-sm text-slate-300">
                <div className="flex items-center gap-2 mb-2"><Landmark className="w-4 h-4 text-[#d482ff]" /> Impacto financeiro</div>
                <p>
                  Nesta conta você pode mostrar o saldo do cliente, o saldo da empresa e o efeito de pagamento ou estorno.
                </p>
              </div>

              <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 text-sm text-slate-300">
                <div className="flex items-center gap-2 mb-2"><Banknote className="w-4 h-4 text-[#10b981]" /> Resumo da conta</div>
                <p>Saldo atual: {selectedAccount.saldo}</p>
                <p className="mt-1">Status: {selectedAccount.status}</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );

  return <div>{view === 'overview' ? renderOverview() : renderDetail()}</div>;
}
