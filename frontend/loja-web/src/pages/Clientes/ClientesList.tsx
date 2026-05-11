import { useState, useMemo, Fragment } from 'react';
import {
  Search,
  UserPlus,
  User,
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  Wallet,
  Mail,
  CreditCard,
  Trash2,
  Sparkles,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClienteMock {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cep: string;
  cidade: string;
  rua: string;
  bairro: string;
  numero: string;
  complemento: string;
  conta: string;
  saldo: string;
  uf?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockClientes: ClienteMock[] = [
  {
    id: '1',
    nome: 'O nome',
    cpf: '000.000.000-00',
    email: 'cliente@exemplo.com',
    telefone: '(11) 98888-0000',
    cep: '01001-000',
    cidade: 'São Paulo',
    uf: 'SP',
    rua: 'Rua Principal',
    bairro: 'Centro',
    numero: '100',
    complemento: 'Sala 4',
    conta: 'CC-1001',
    saldo: 'R$ 1.250,00'
  },
  {
    id: '2',
    nome: 'Maria Silva',
    cpf: '111.111.111-11',
    email: 'maria.silva@email.com',
    telefone: '(11) 97777-1111',
    cep: '13010-000',
    cidade: 'Campinas',
    uf: 'SP',
    rua: 'Av. das Flores',
    bairro: 'Jardins',
    numero: '25',
    complemento: 'Ap 12',
    conta: 'CC-1002',
    saldo: 'R$ 2.580,00'
  },
  {
    id: '3',
    nome: 'João Pedro',
    cpf: '222.222.222-22',
    email: 'joao.pedro@web.com',
    telefone: '(21) 96666-2222',
    cep: '20010-000',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    rua: 'Rua do Ouvidor',
    bairro: 'Centro',
    numero: '500',
    complemento: '',
    conta: 'CC-1003',
    saldo: 'R$ 480,00'
  }
];

// ─── Style helpers ────────────────────────────────────────────────────────────

const inputClassName =
  'w-full bg-[#111111] h-11 rounded-xl px-4 text-sm text-white placeholder-slate-600 border border-[#2a2a2a] focus:border-[#a100ff]/60 focus:outline-none transition-all';

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientesList() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClientes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return mockClientes;

    return mockClientes.filter(
      c =>
        c.nome.toLowerCase().includes(term) ||
        c.cpf.includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.telefone.includes(term) ||
        c.cidade.toLowerCase().includes(term) ||
        c.conta.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderClientForm = (mode: 'create' | 'edit') => {
    const isCreate = mode === 'create';

    return (
      <div className={isCreate ? 'p-6 sm:p-8' : 'p-8 bg-[#0b0b0b] border-t border-[#1a1a1a]'}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          
          <div className="space-y-8">
            {/* Dados Pessoais */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#a100ff]/10 flex items-center justify-center text-[#a100ff]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Dados Pessoais</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Informações de identificação do cliente</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Nome Completo</label>
                  <input type="text" placeholder="Ex: João Silva" className={inputClassName} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">CPF</label>
                  <input type="text" placeholder="000.000.000-00" className={inputClassName} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">E-mail</label>
                  <input type="email" placeholder="cliente@email.com" className={inputClassName} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Telefone</label>
                  <input type="text" placeholder="(00) 00000-0000" className={inputClassName} />
                </div>
              </div>
            </section>

            {/* Endereço */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#a100ff]/10 flex items-center justify-center text-[#a100ff]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Endereço Residencial</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Localização física para faturamento</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">CEP</label>
                  <input type="text" placeholder="00000-000" className={inputClassName} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Cidade</label>
                  <input type="text" placeholder="São Paulo" className={inputClassName} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">UF</label>
                   <input type="text" placeholder="SP" className={inputClassName} />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Rua / Avenida</label>
                  <input type="text" placeholder="Nome da rua..." className={inputClassName} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Número</label>
                  <input type="text" placeholder="123" className={inputClassName} />
                </div>
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Complemento</label>
                  <input type="text" placeholder="Bloco A, Sala 4..." className={inputClassName} />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            {/* Conta Corrente */}
            <section className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#1a1a1a]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#a100ff]/10 flex items-center justify-center text-[#a100ff]">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-tight">Financeiro</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Número da Conta</label>
                  <input type="text" placeholder="CC-0000" className={inputClassName} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Saldo Inicial (R$)</label>
                  <input type="text" placeholder="0,00" className={inputClassName} />
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                 <div className="p-3 rounded-xl bg-[#a100ff]/[0.02] border border-[#a100ff]/10">
                    <p className="text-[10px] text-slate-500 italic leading-relaxed">Os dados bancários são integrados ao módulo de faturamento automático.</p>
                 </div>
              </div>
            </section>

            {/* Status Info (Only Edit) */}
            {!isCreate && (
              <div className="p-5 rounded-2xl border border-[#2a2a2a] bg-[#111111] space-y-4">
                 <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600 font-bold uppercase">Estado Cadastral</span>
                    <span className="text-[#a1ffdb] font-black uppercase tracking-widest">Ativo</span>
                 </div>
                 <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600 font-bold uppercase">Última Compra</span>
                    <span className="text-slate-400 font-bold tracking-tighter">09/05/2026</span>
                 </div>
              </div>
            )}
          </aside>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-[#1a1a1a]">
          {!isCreate ? (
            <Button className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#111111] border border-[#5a1f35]/40 text-[#d6a2b0] font-bold hover:bg-[#2a1118] hover:border-[#5a1f35]/60 transition-all uppercase tracking-tighter text-xs">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Cliente
            </Button>
          ) : (
            <div className="text-xs text-slate-600 italic">Preencha todos os campos obrigatórios para registrar o cliente.</div>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={() => isCreate && setShowCreateForm(false)}
              className="flex-1 sm:flex-initial h-11 px-8 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-400 font-bold hover:text-white transition-all text-xs"
            >
              CANCELAR
            </Button>

            <Button className="flex-1 sm:flex-initial h-11 px-10 rounded-xl bg-[#a100ff] text-white font-black hover:bg-[#b833ff] shadow-lg shadow-[#a100ff]/20 transition-all text-xs">
              {isCreate ? 'FINALIZAR CADASTRO' : 'SALVAR ALTERAÇÕES'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      
      {/* 1. Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#0b0b0b] border border-[#2a2a2a] flex items-center justify-center text-[#a100ff]">
              <UserPlus className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Clientes</h1>
          </div>
          <p className="text-slate-400 text-sm">Gerencie cadastros, endereços e contas financeiras</p>
        </div>

        <Button
          onClick={() => setShowCreateForm(prev => !prev)}
          className={`h-11 px-6 rounded-xl font-black transition-all shadow-lg gap-2 ${
            showCreateForm 
              ? 'bg-[#111111] border border-[#2a2a2a] text-slate-400 hover:text-white' 
              : 'bg-[#a100ff] text-white hover:bg-[#b833ff] shadow-[#a100ff]/20'
          }`}
        >
          {showCreateForm ? (
            <Fragment>
              <X className="w-4 h-4" />
              FECHAR FORMULÁRIO
            </Fragment>
          ) : (
            <Fragment>
              <UserPlus className="w-4 h-4" />
              CADASTRAR CLIENTE
            </Fragment>
          )}
        </Button>
      </div>

      {/* 2. Barra de Busca e Filtro */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nome, CPF, e-mail, telefone, cidade ou conta..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            className="w-full h-12 bg-[#0b0b0b] rounded-2xl px-6 pr-14 text-slate-200 placeholder-slate-700 border border-[#2a2a2a] focus:border-[#a100ff]/50 focus:outline-none transition-all"
          />
          <button className="absolute right-0 top-0 h-12 w-16 flex items-center justify-center text-slate-500 hover:text-[#a100ff] transition-colors border-l border-[#2a2a2a] my-2 h-8">
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 h-12 rounded-2xl bg-[#0b0b0b] border border-[#2a2a2a] text-slate-500 text-[10px] font-bold uppercase tracking-widest">
           <Filter className="w-4 h-4 mr-1 text-[#a100ff]/60" />
           {filteredClientes.length} CLIENTES ENCONTRADOS
        </div>
      </div>

      {/* 3. Cadastro Form */}
      {showCreateForm && (
        <div className="rounded-[24px] overflow-hidden bg-[#0b0b0b] border border-[#2a2a2a] shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="bg-[#0f0f0f] px-8 py-6 border-b border-[#1a1a1a] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#a100ff]/10 border border-[#a100ff]/20 flex items-center justify-center text-[#a100ff]">
                 <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-black text-xl tracking-tight">Novo Cadastro</h2>
                <p className="text-xs text-slate-500 font-medium">Preencha o dossiê completo do novo cliente</p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateForm(false)}
              className="w-9 h-9 rounded-full bg-[#111111] hover:bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-inner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {renderClientForm('create')}
        </div>
      )}

      {/* 4. List of Clients */}
      <div className="grid grid-cols-1 gap-4">
        {filteredClientes.length > 0 ? (
          filteredClientes.map(cliente => {
            const isExpanded = expandedId === cliente.id;

            return (
              <div
                key={cliente.id}
                className={`rounded-[24px] overflow-hidden border transition-all duration-300 ${
                  isExpanded 
                    ? 'bg-[#0b0b0b] border-[#a100ff]/40 shadow-2xl shadow-[#a100ff]/5' 
                    : 'bg-[#0b0b0b] border-[#1a1a1a] hover:border-[#2a2a2a]'
                }`}
              >
                <button
                  onClick={() => toggleExpand(cliente.id)}
                  className={`w-full flex flex-col md:flex-row md:items-center justify-between p-6 cursor-pointer text-left gap-6 transition-all ${
                    isExpanded ? 'bg-[#0f0f0f]/60' : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shrink-0 ${
                        isExpanded
                          ? 'bg-[#a100ff] text-white border-[#a100ff] shadow-lg shadow-[#a100ff]/20'
                          : 'bg-[#111111] border-[#2a2a2a] text-slate-500'
                      }`}
                    >
                      <User className={isExpanded ? 'w-7 h-7' : 'w-6 h-6'} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-white font-black text-lg tracking-tight truncate">{cliente.nome}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                         <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                            <CreditCard className="w-3 h-3 text-[#a100ff]/40" />
                            {cliente.cpf || 'Cpf não informado'}
                         </div>
                         <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-slate-700" />
                            {cliente.email || 'E-mail não informado'}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-x-10 gap-y-4">
                     {/* Info Tags */}
                     <div className="hidden lg:flex items-center gap-8 text-right">
                        <div>
                           <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-0.5">LOCALIZAÇÃO</div>
                           <div className="text-xs text-slate-400 font-bold flex items-center justify-end gap-1.5">
                              <MapPin className="w-3 h-3" />
                              {cliente.cidade ? `${cliente.cidade}/${cliente.uf}` : 'Local não informado'}
                           </div>
                        </div>
                        <div>
                           <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-0.5">SALDO DISPONÍVEL</div>
                           <div className="text-sm text-[#a1ffdb] font-black uppercase">{cliente.saldo || 'R$ 0,00'}</div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                       <span className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-[#111111] border border-[#2a2a2a] text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-all">
                          {isExpanded ? 'FECHAR DOSSIÊ' : 'ABRIR DOSSIÊ'}
                       </span>
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                          isExpanded 
                            ? 'bg-[#a100ff]/10 border-[#a100ff]/30 text-[#d8b4fe]' 
                            : 'bg-[#111111] border-[#2a2a2a] text-slate-600'
                        }`}>
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                     </div>
                  </div>
                </button>

                {isExpanded && renderClientForm('edit')}
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] bg-[#0b0b0b] border border-[#1a1a1a] p-20 flex flex-col items-center text-center">
             <div className="w-20 h-20 rounded-3xl bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-700 mb-6 shadow-inner">
                <Search className="w-10 h-10" />
             </div>
             <h3 className="text-white font-black text-xl mb-2">Nenhum cliente encontrado</h3>
             <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Não localizamos nenhum registro correspondente ao termo "{searchTerm}".</p>
             
             <Button 
                onClick={() => setSearchTerm('')} 
                className="mt-8 bg-[#111111] border border-[#a100ff]/30 text-[#d8b4fe] hover:bg-[#a100ff]/10 hover:border-[#a100ff]/50 px-8 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
             >
                Limpar Busca
             </Button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between p-8 rounded-3xl bg-[#0b0b0b] border border-[#1a1a1a] opacity-60">
         <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#a100ff]" />
            Relatório de Auditoria {new Date().getFullYear()}
         </div>
         <div className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">
            Sincronizado via Accenture-Cloud
         </div>
      </div>
    </div>
  );
}