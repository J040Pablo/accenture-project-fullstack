import { useEffect, useMemo, useState } from 'react';
import { clienteService } from '../../services/clienteService';
import { enderecoService } from '../../services/enderecoService';
import type { Cliente, ClienteRequest } from '../../types/Cliente';
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
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageToolbar } from '../../components/ui/PageToolbar';
import { PrimaryActionButton } from '../../components/ui/PrimaryActionButton';
import { FilterDropdown, FilterGroup, FilterOption } from '../../components/ui/FilterDropdown';



//  Style helpers 

const inputClassName =
  'w-full bg-[#151515] border border-[#2a2a2a] h-11 rounded-xl px-4 text-sm text-white placeholder-slate-500 outline-none focus:outline-none focus:ring-0 focus:border-[#a100ff] transition-colors duration-200';
const inputReadonlyClassName =
  'w-full bg-[#0b0b0b] border border-[#1a1a1a] h-11 rounded-xl px-4 text-sm text-slate-500 placeholder-slate-600 outline-none cursor-not-allowed';

//  Helpers 

const stripCpf = (v: string) => v.replace(/\D/g, '');
const stripCep = (v: string) => v.replace(/\D/g, '');
const formatSaldo = (saldo?: number) =>
  saldo != null
    ? saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 0,00';

const emptyForm = { nome: '', cpf: '', email: '', cep: '', numero: '', complemento: '' };
const emptyAddress = { rua: '', bairro: '', cidade: '', uf: '' };

// Component 

export default function ClientesList() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'todos' | 'com' | 'sem'>('todos');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [ufFilter, setUfFilter] = useState<string>('');
  const [accountFilter, setAccountFilter] = useState<'todos' | 'com' | 'sem'>('todos');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [form, setForm] = useState(emptyForm);
  const [address, setAddress] = useState(emptyAddress);
  const [formError, setFormError] = useState('');
  const [createCepLoading, setCreateCepLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState(emptyForm);
  const [editAddress, setEditAddress] = useState(emptyAddress);
  const [editError, setEditError] = useState('');
  const [editCepLoading, setEditCepLoading] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.listar();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes', error);
    } finally {
      setLoading(false);
    }
  };

  //  Filter helpers 

  const cities = useMemo(
    () => Array.from(new Set(clientes.map(c => c.endereco?.cidade).filter(Boolean))) as string[],
    [clientes],
  );
  const ufs = useMemo(
    () => Array.from(new Set(clientes.map(c => c.endereco?.uf).filter(Boolean))) as string[],
    [clientes],
  );

  const filteredClientes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return clientes.filter(c => {
      const matchesSearch =
        !term ||
        c.nome.toLowerCase().includes(term) ||
        c.cpf.includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.endereco?.cidade ?? '').toLowerCase().includes(term) ||
        (c.contaCorrente?.numeroConta ?? '').toLowerCase().includes(term);

      const saldo = c.contaCorrente?.saldo ?? 0;
      const matchesBalance =
        balanceFilter === 'todos' ||
        (balanceFilter === 'com' && saldo > 0) ||
        (balanceFilter === 'sem' && saldo === 0);

      const matchesCity = !cityFilter || c.endereco?.cidade === cityFilter;
      const matchesUf = !ufFilter || c.endereco?.uf === ufFilter;

      const matchesAccount =
        accountFilter === 'todos' ||
        (accountFilter === 'com' && !!c.contaCorrente) ||
        (accountFilter === 'sem' && !c.contaCorrente);

      return matchesSearch && matchesBalance && matchesCity && matchesUf && matchesAccount;
    });
  }, [clientes, searchTerm, balanceFilter, cityFilter, ufFilter, accountFilter]);

  const activeFiltersCount = [
    balanceFilter !== 'todos',
    cityFilter !== '',
    ufFilter !== '',
    accountFilter !== 'todos',
  ].filter(Boolean).length;

  //  CEP lookup 

  const buscarCepCreate = async () => {
    const cep = stripCep(form.cep);
    if (cep.length !== 8) return;
    try {
      setCreateCepLoading(true);
      setFormError('');
      const data = await enderecoService.buscarCep(cep);
      setAddress({
        rua: data.logradouro ?? '',
        bairro: data.bairro ?? '',
        cidade: data.localidade ?? '',
        uf: data.uf ?? '',
      });
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem ?? err?.response?.data?.message ?? 'CEP não encontrado ou inválido.';
      setFormError(msg);
      setAddress(emptyAddress);
    } finally {
      setCreateCepLoading(false);
    }
  };

  const buscarCepEdit = async () => {
    const cep = stripCep(editForm.cep);
    if (cep.length !== 8) return;
    try {
      setEditCepLoading(true);
      setEditError('');
      const data = await enderecoService.buscarCep(cep);
      setEditAddress({
        rua: data.logradouro ?? '',
        bairro: data.bairro ?? '',
        cidade: data.localidade ?? '',
        uf: data.uf ?? '',
      });
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem ?? err?.response?.data?.message ?? 'CEP não encontrado ou inválido.';
      setEditError(msg);
      setEditAddress(emptyAddress);
    } finally {
      setEditCepLoading(false);
    }
  };

  //  CRUD actions 

  const toggleExpand = (id: number, cliente: Cliente) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDeletingId(null);
      return;
    }
    setExpandedId(id);
    setDeletingId(null);
    setEditError('');
    setEditForm({
      nome: cliente.nome,
      cpf: cliente.cpf,
      email: cliente.email,
      cep: cliente.endereco?.cep ?? '',
      numero: cliente.endereco?.numero ?? '',
      complemento: cliente.endereco?.complemento ?? '',
    });
    setEditAddress({
      rua: cliente.endereco?.rua ?? '',
      bairro: cliente.endereco?.bairro ?? '',
      cidade: cliente.endereco?.cidade ?? '',
      uf: cliente.endereco?.uf ?? '',
    });
  };

  const salvarCliente = async () => {
    setFormError('');
    if (!form.nome.trim()) { setFormError('Nome é obrigatório.'); return; }
    const cpf = stripCpf(form.cpf);
    if (cpf.length !== 11) { setFormError('CPF deve conter 11 dígitos numéricos.'); return; }
    if (!form.email.trim()) { setFormError('E-mail é obrigatório.'); return; }
    const cep = stripCep(form.cep);
    if (cep.length !== 8) { setFormError('CEP deve conter 8 dígitos.'); return; }
    if (!form.numero.trim()) { setFormError('Número é obrigatório.'); return; }

    const payload: ClienteRequest = {
      nome: form.nome,
      cpf,
      email: form.email,
      endereco: { cep, numero: form.numero, complemento: form.complemento || undefined },
    };
    try {
      await clienteService.cadastrar(payload);
      await carregarClientes();
      setShowCreateForm(false);
      setForm(emptyForm);
      setAddress(emptyAddress);
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem ?? err?.response?.data?.message ?? 'Erro ao cadastrar cliente.';
      setFormError(msg);
    }
  };

  const atualizarCliente = async (id: number) => {
    setEditError('');
    if (!editForm.nome.trim()) { setEditError('Nome é obrigatório.'); return; }
    const cpf = stripCpf(editForm.cpf);
    if (cpf.length !== 11) { setEditError('CPF deve conter 11 dígitos numéricos.'); return; }
    if (!editForm.email.trim()) { setEditError('E-mail é obrigatório.'); return; }
    const cep = stripCep(editForm.cep);
    if (cep.length !== 8) { setEditError('CEP deve conter 8 dígitos.'); return; }
    if (!editForm.numero.trim()) { setEditError('Número é obrigatório.'); return; }

    const payload: ClienteRequest = {
      nome: editForm.nome,
      cpf,
      email: editForm.email,
      endereco: { cep, numero: editForm.numero, complemento: editForm.complemento || undefined },
    };
    try {
      await clienteService.atualizar(id, payload);
      await carregarClientes();
      setExpandedId(null);
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem ?? err?.response?.data?.message ?? 'Erro ao atualizar cliente.';
      setEditError(msg);
    }
  };

  const deletarCliente = async (id: number) => {
    try {
      await clienteService.deletar(id);
      await carregarClientes();
      setExpandedId(null);
      setDeletingId(null);
    } catch (err: any) {
      const msg = err?.response?.data?.mensagem ?? err?.response?.data?.message ?? 'Erro ao excluir cliente.';
      setEditError(msg);
      setDeletingId(null);
    }
  };

  //  Render helpers 

  const renderCreateForm = () => (
    <div className="p-6 sm:p-8">
      {formError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          {formError}
        </div>
      )}
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
                <input type="text" placeholder="Ex: João Silva" className={inputClassName} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">CPF</label>
                <input type="text" placeholder="000.000.000-00" className={inputClassName} value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">E-mail</label>
                <input type="email" placeholder="cliente@email.com" className={inputClassName} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
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
                <div className="relative">
                  <input
                    type="text"
                    placeholder="00000-000"
                    className={inputClassName}
                    value={form.cep}
                    onChange={e => setForm({ ...form, cep: e.target.value })}
                    onBlur={buscarCepCreate}
                  />
                  {createCepLoading && <Loader2 className="absolute right-3 top-3 w-4 h-4 text-[#a100ff] animate-spin" />}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Cidade</label>
                <input type="text" placeholder="Preenchido via CEP" className={inputReadonlyClassName} value={address.cidade} readOnly />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">UF</label>
                <input type="text" placeholder="—" className={inputReadonlyClassName} value={address.uf} readOnly />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Rua / Avenida</label>
                <input type="text" placeholder="Preenchido via CEP" className={inputReadonlyClassName} value={address.rua} readOnly />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Número</label>
                <input type="text" placeholder="123" className={inputClassName} value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Complemento</label>
                <input type="text" placeholder="Bloco A, Sala 4..." className={inputClassName} value={form.complemento} onChange={e => setForm({ ...form, complemento: e.target.value })} />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#1a1a1a]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#a100ff]/10 flex items-center justify-center text-[#a100ff]">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-tight">Financeiro</h3>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#a100ff]/[0.02] border border-[#a100ff]/10">
              <p className="text-[10px] text-slate-500 italic leading-relaxed">A conta corrente é criada automaticamente ao cadastrar o cliente.</p>
            </div>
          </section>
        </aside>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-[#1a1a1a]">
        <div className="text-xs text-slate-600 italic">Preencha todos os campos obrigatórios para registrar o cliente.</div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => { setShowCreateForm(false); setForm(emptyForm); setAddress(emptyAddress); setFormError(''); }}
            className="flex-1 sm:flex-initial h-11 px-8 rounded-xl bg-[#111111] hover:bg-[#161616] text-slate-300 hover:text-white border border-[#2a2a2a] hover:border-[#a100ff]/40 outline-none focus:outline-none focus:ring-0 transition-colors text-xs"
          >
            CANCELAR
          </Button>
          <Button
            onClick={salvarCliente}
            className="flex-1 sm:flex-initial h-11 px-10 rounded-xl bg-[#a100ff] hover:bg-[#b933ff] text-white border border-[#a100ff] font-black outline-none focus:outline-none focus:ring-0 transition-colors text-xs"
          >
            FINALIZAR CADASTRO
          </Button>
        </div>
      </div>
    </div>
  );

  const renderEditForm = (cliente: Cliente) => (
    <div className="p-8 bg-[#0b0b0b] border-t border-[#1a1a1a]">
      {editError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          {editError}
        </div>
      )}
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
                <input type="text" placeholder="Ex: João Silva" className={inputClassName} value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">CPF</label>
                <input type="text" placeholder="000.000.000-00" className={inputClassName} value={editForm.cpf} onChange={e => setEditForm({ ...editForm, cpf: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">E-mail</label>
                <input type="email" placeholder="cliente@email.com" className={inputClassName} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
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
                <div className="relative">
                  <input
                    type="text"
                    placeholder="00000-000"
                    className={inputClassName}
                    value={editForm.cep}
                    onChange={e => setEditForm({ ...editForm, cep: e.target.value })}
                    onBlur={buscarCepEdit}
                  />
                  {editCepLoading && <Loader2 className="absolute right-3 top-3 w-4 h-4 text-[#a100ff] animate-spin" />}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Cidade</label>
                <input type="text" className={inputReadonlyClassName} value={editAddress.cidade} readOnly />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">UF</label>
                <input type="text" className={inputReadonlyClassName} value={editAddress.uf} readOnly />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Rua / Avenida</label>
                <input type="text" className={inputReadonlyClassName} value={editAddress.rua} readOnly />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Número</label>
                <input type="text" placeholder="123" className={inputClassName} value={editForm.numero} onChange={e => setEditForm({ ...editForm, numero: e.target.value })} />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Complemento</label>
                <input type="text" placeholder="Bloco A, Sala 4..." className={inputClassName} value={editForm.complemento} onChange={e => setEditForm({ ...editForm, complemento: e.target.value })} />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          {/* Conta Corrente (read-only on edit) */}
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
                <input type="text" className={inputReadonlyClassName} value={cliente.contaCorrente?.numeroConta ?? '—'} readOnly />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Saldo (R$)</label>
                <input type="text" className={inputReadonlyClassName} value={formatSaldo(cliente.contaCorrente?.saldo)} readOnly />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
              <div className="p-3 rounded-xl bg-[#a100ff]/[0.02] border border-[#a100ff]/10">
                <p className="text-[10px] text-slate-500 italic leading-relaxed">Os dados bancários são integrados ao módulo de faturamento automático.</p>
              </div>
            </div>
          </section>

          <div className="p-5 rounded-2xl border border-[#2a2a2a] bg-[#111111] space-y-4">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-600 font-bold uppercase">Estado Cadastral</span>
              <span className="text-[#a1ffdb] font-black uppercase tracking-widest">Ativo</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-[#1a1a1a]">
        {deletingId === cliente.id ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-red-400 font-medium">Confirmar exclusão?</span>
            <Button onClick={() => deletarCliente(cliente.id!)} className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs">
              Sim, excluir
            </Button>
            <Button onClick={() => setDeletingId(null)} className="h-9 px-4 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-400 hover:text-white font-bold text-xs">
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setDeletingId(cliente.id!)}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#111111] border border-[#5a1f35]/40 text-[#d6a2b0] font-bold hover:bg-[#2a1118] hover:border-[#5a1f35]/60 transition-all uppercase tracking-tighter text-xs"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Cliente
          </Button>
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => { setExpandedId(null); setDeletingId(null); }}
            className="flex-1 sm:flex-initial h-11 px-8 rounded-xl bg-[#111111] hover:bg-[#161616] text-slate-300 hover:text-white border border-[#2a2a2a] hover:border-[#a100ff]/40 outline-none focus:outline-none focus:ring-0 transition-colors text-xs"
          >
            CANCELAR
          </Button>
          <Button
            onClick={() => atualizarCliente(cliente.id!)}
            className="flex-1 sm:flex-initial h-11 px-10 rounded-xl bg-[#a100ff] hover:bg-[#b933ff] text-white border border-[#a100ff] font-black outline-none focus:outline-none focus:ring-0 transition-colors text-xs"
          >
            SALVAR ALTERAÇÕES
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        title="Clientes"
        subtitle="Gerencie cadastros, endereços e contas financeiras"
        icon={<UserPlus className="w-5 h-5" />}
        action={
          showCreateForm ? (
            <Button
              onClick={() => setShowCreateForm(false)}
              className="w-full md:w-auto h-11 px-6 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-400 font-black hover:text-white transition-all gap-2"
            >
              <X className="w-4 h-4" />
              FECHAR FORMULÁRIO
            </Button>
          ) : (
            <PrimaryActionButton onClick={() => setShowCreateForm(true)}>
              <UserPlus className="w-4 h-4" />
              CADASTRAR CLIENTE
            </PrimaryActionButton>
          )
        }
      />

      <PageToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nome, CPF, e-mail, cidade ou conta..."
        rightContent={
          <div className="flex items-center gap-3">
            <FilterDropdown activeFiltersCount={activeFiltersCount}>
              {/* Balance Filter */}
              <FilterGroup title="Saldo">
                <FilterOption label="Todos" isActive={balanceFilter === 'todos'} onClick={() => setBalanceFilter('todos')} />
                <FilterOption label="Com saldo" isActive={balanceFilter === 'com'} onClick={() => setBalanceFilter('com')} />
                <FilterOption label="Sem saldo" isActive={balanceFilter === 'sem'} onClick={() => setBalanceFilter('sem')} />
              </FilterGroup>

              {/* Location Filter */}
              <FilterGroup title="Localização">
                <label className="text-[10px] text-slate-400 font-semibold uppercase mb-2 block">Cidade</label>
                <select
                  value={cityFilter}
                  onChange={e => setCityFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#2a2a2a] text-slate-300 text-xs font-semibold focus:outline-none focus:border-[#a100ff] transition-all mb-3"
                >
                  <option value="">Todas as cidades</option>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>

                <label className="text-[10px] text-slate-400 font-semibold uppercase mb-2 block">Estado</label>
                <select
                  value={ufFilter}
                  onChange={e => setUfFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#2a2a2a] text-slate-300 text-xs font-semibold focus:outline-none focus:border-[#a100ff] transition-all"
                >
                  <option value="">Todos os estados</option>
                  {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </FilterGroup>

              {/* Account Filter */}
              <FilterGroup title="Conta">
                <FilterOption label="Todos" isActive={accountFilter === 'todos'} onClick={() => setAccountFilter('todos')} />
                <FilterOption label="Com conta" isActive={accountFilter === 'com'} onClick={() => setAccountFilter('com')} />
                <FilterOption label="Sem conta" isActive={accountFilter === 'sem'} onClick={() => setAccountFilter('sem')} />
              </FilterGroup>

              {/* Clear button */}
              <div className="border-t border-[#1a1a1a] pt-4 mt-4">
                <button
                  onClick={() => { setSearchTerm(''); setBalanceFilter('todos'); setCityFilter(''); setUfFilter(''); setAccountFilter('todos'); }}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#2a2a2a] text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all"
                >
                  Limpar filtros
                </button>
              </div>
            </FilterDropdown>

            {/* Counter */}
            <div className="flex items-center gap-2 px-4 h-12 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-500 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
              {filteredClientes.length} encontrados
            </div>
          </div>
        }
      />

      {/* Create Form */}
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
          {renderCreateForm()}
        </div>
      )}

      {/* List of Clients */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="rounded-[24px] bg-[#0b0b0b] border border-[#1a1a1a] p-20 flex flex-col items-center text-center">
            <Loader2 className="w-10 h-10 text-[#a100ff] animate-spin mb-4" />
            <p className="text-slate-500 text-sm">Carregando clientes...</p>
          </div>
        ) : filteredClientes.length > 0 ? (
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
                  onClick={() => toggleExpand(cliente.id!, cliente)}
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
                          {cliente.cpf || 'CPF não informado'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-700" />
                          {cliente.email || 'E-mail não informado'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-x-10 gap-y-4">
                    <div className="hidden lg:flex items-center gap-8 text-right">
                      <div>
                        <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-0.5">LOCALIZAÇÃO</div>
                        <div className="text-xs text-slate-400 font-bold flex items-center justify-end gap-1.5">
                          <MapPin className="w-3 h-3" />
                          {cliente.endereco?.cidade
                            ? `${cliente.endereco.cidade}/${cliente.endereco.uf}`
                            : 'Local não informado'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-0.5">SALDO DISPONÍVEL</div>
                        <div className="text-sm text-[#a1ffdb] font-black uppercase">
                          {formatSaldo(cliente.contaCorrente?.saldo)}
                        </div>
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

                {isExpanded && renderEditForm(cliente)}
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] bg-[#0b0b0b] border border-[#1a1a1a] p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-700 mb-6 shadow-inner">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-white font-black text-xl mb-2">Nenhum cliente encontrado</h3>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Tente ajustar sua busca.</p>
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
    </PageLayout>
  );
}
