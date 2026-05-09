import { useState } from 'react';
import {
  Search,
  UserPlus,
  User,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

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

const mockClientes: ClienteMock[] = [
  {
    id: '1',
    nome: 'O nome',
    cpf: '',
    email: '',
    telefone: '',
    cep: '',
    cidade: '',
    rua: '',
    bairro: '',
    numero: '',
    complemento: '',
    conta: '',
    saldo: ''
  },
  {
    id: '2',
    nome: 'O nome',
    cpf: '',
    email: '',
    telefone: '',
    cep: '',
    cidade: '',
    rua: '',
    bairro: '',
    numero: '',
    complemento: '',
    conta: '',
    saldo: ''
  }
];

const inputClassName =
  'w-full bg-[#1e1e1e] h-10 rounded-lg px-4 text-sm text-white placeholder-slate-400 border border-transparent focus:border-[#a100ff] focus:outline-none transition-colors';

export default function ClientesList() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderClientForm = (mode: 'create' | 'edit') => {
    const isCreate = mode === 'create';

    return (
      <div className={isCreate ? 'p-5 sm:p-6' : 'p-6'}>
        {/* Dados Pessoais */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                <User className="w-4 h-4" />
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-100">
                  Dados pessoais
                </h3>

                {isCreate && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Preencha os dados básicos do cliente
                  </p>
                )}
              </div>
            </div>

            {!isCreate && (
              <div className="flex items-center gap-4 text-xs font-medium text-white/80">
                <button className="hover:text-white transition-colors">
                  Editar
                </button>
              </div>
            )}
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isCreate ? '' : 'md:ml-12'
              }`}
          >
            <input type="text" placeholder="Nome" className={inputClassName} />
            <input type="text" placeholder="CPF" className={inputClassName} />
            <input type="email" placeholder="E-mail" className={inputClassName} />
            <input type="text" placeholder="Telefone" className={inputClassName} />
          </div>
        </section>

        {/* Endereço */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
              <span className="text-xs font-semibold">UF</span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-100">Endereço</h3>

              {isCreate && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Informe o CEP e complete os dados do endereço
                </p>
              )}
            </div>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isCreate ? '' : 'md:ml-12'
              }`}
          >
            <input type="text" placeholder="CEP" className={inputClassName} />
            <input type="text" placeholder="UF" className={inputClassName} />
            <input type="text" placeholder="Rua" className={inputClassName} />
            <input type="text" placeholder="Cidade" className={inputClassName} />
            <input type="text" placeholder="Número" className={inputClassName} />
            <input type="text" placeholder="Bairro" className={inputClassName} />

            <input
              type="text"
              placeholder="Complemento"
              className="w-full md:col-span-2 bg-[#1e1e1e] h-10 rounded-lg px-4 text-sm text-white placeholder-slate-400 border border-transparent focus:border-[#a100ff] focus:outline-none transition-colors"
            />
          </div>
        </section>

        {/* Conta Corrente */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
              <span className="text-xs font-semibold">R$</span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-100">
                Conta corrente
              </h3>

              {isCreate && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Cadastre os dados iniciais da conta do cliente
                </p>
              )}
            </div>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isCreate ? '' : 'md:ml-12'
              }`}
          >
            <input
              type="text"
              placeholder="Número da conta"
              className={inputClassName}
            />

            <input
              type="text"
              placeholder="Saldo inicial"
              className={inputClassName}
            />
          </div>
        </section>

        {/* Actions */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-[#2a2a2a] ${isCreate ? 'justify-end' : 'justify-between md:ml-12'
            }`}
        >
          {!isCreate && (
            <Button className="bg-[#b31414] hover:bg-[#df1b1b] text-white border border-transparent focus:border-[#a100ff] rounded-full px-6 h-10 outline-none focus:outline-none">
              Excluir Cliente
            </Button>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
            <Button
              onClick={() => isCreate && setShowCreateForm(false)}
              className="bg-[#3c1063] hover:bg-[#4f1585] text-[#d4bbee] border border-transparent focus:border-[#a100ff] rounded-full px-6 h-10 outline-none focus:outline-none"
            >
              Cancelar
            </Button>

            <Button className="bg-[#c000ff] hover:bg-[#d840ff] text-white border border-transparent focus:border-[#a100ff] rounded-full px-8 h-10 font-bold text-center outline-none focus:outline-none">
              {isCreate ? 'Cadastrar cliente' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Search Bar */}
      <div className="flex w-full mb-8 relative">
        <input
          type="text"
          placeholder="Pesquisar"
          className="w-full h-12 bg-[#1a1a1a] rounded-full px-6 pr-14 text-slate-200 placeholder-slate-500 border border-transparent focus:border-[#a100ff] focus:outline-none transition-colors"
        />

        <button className="absolute right-0 top-0 h-12 w-12 bg-[#a100ff] rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all border border-transparent focus:border-[#c000ff] outline-none focus:outline-none">
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Clientes</h1>
          <p className="text-slate-300">Lista de clientes cadastrados</p>
        </div>

        <Button
          onClick={() => setShowCreateForm(prev => !prev)}
          className="bg-[#421d63] hover:bg-[#52257a] text-white border border-[#52257a] focus:border-[#a100ff] gap-2 rounded-xl h-11 px-5 outline-none focus:outline-none"
        >
          {showCreateForm ? (
            <>
              <X className="w-4 h-4" />
              Fechar cadastro
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Cadastrar Cliente
            </>
          )}
        </Button>
      </div>

      {/* Formulário de cadastro inline */}
      {showCreateForm && (
        <div className="rounded-[20px] overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl shadow-black/20">
          <div className="bg-[#5b148a] px-5 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg">
                Cadastrar novo cliente
              </h2>

              <p className="text-white/70 text-sm mt-0.5">
                Complete os dados abaixo para criar um novo cliente
              </p>
            </div>

            <button
              onClick={() => setShowCreateForm(false)}
              className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
              aria-label="Fechar formulário de cadastro"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {renderClientForm('create')}
        </div>
      )}

      {/* List of Clients */}
      <div className="space-y-4">
        {mockClientes.map(cliente => {
          const isExpanded = expandedId === cliente.id;

          return (
            <div
              key={cliente.id}
              className="rounded-[20px] overflow-hidden bg-[#111111]"
            >
              <button
                onClick={() => toggleExpand(cliente.id)}
                className={`w-full flex items-center justify-between p-4 cursor-pointer transition-colors duration-300 ${isExpanded ? 'bg-[#5b148a]' : 'bg-[#1e1e1e]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border ${isExpanded
                        ? 'border-white/30 text-white/70'
                        : 'border-slate-600 text-slate-400'
                      }`}
                  >
                    <User className="w-5 h-5" />
                  </div>

                  <span className="text-white font-medium">{cliente.nome}</span>
                </div>

                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span className="hidden sm:inline">
                    {isExpanded
                      ? 'Ocultar Dados do Cliente'
                      : 'Mostrar Dados do Cliente'}
                  </span>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {isExpanded && renderClientForm('edit')}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-400 mt-8 mb-4">
        Lista de Clientes (10-10 reload)
      </div>
    </div>
  );
}