import { useState } from 'react';
import {
  Barcode,
  Box,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Pencil,
  Plus,
  Package,
  Search,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ProdutoMock {
  id: string;
  nome: string;
  sku: string;
  categoria: string;
  preco: string;
  estoque: string;
  ativo: boolean;
}

const mockProdutos: ProdutoMock[] = [
  {
    id: '1',
    nome: 'Batata',
    sku: 'BAT-001',
    categoria: 'Hortifruti',
    preco: 'R$ 8,90',
    estoque: '120 unidades',
    ativo: true
  },
  {
    id: '2',
    nome: 'O nome',
    sku: 'PROD-002',
    categoria: 'Categoria',
    preco: 'R$ 0,00',
    estoque: '0 unidades',
    ativo: false
  }
];

const inputClassName =
  'w-full bg-[#2a2a2a] h-12 rounded-full px-4 text-sm text-white placeholder-slate-400 border border-transparent focus:border-[#c000ff] focus:outline-none transition-colors';

const ProdutosList: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderProdutoForm = (mode: 'create' | 'edit') => {
    const isCreate = mode === 'create';

    return (
      <div className={isCreate ? 'p-5 sm:p-6' : 'p-6'}>
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-slate-300">
                <Package className="w-4 h-4" />
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-100">
                  Dados do produto
                </h3>

                {isCreate && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Preencha as informações básicas do produto
                  </p>
                )}
              </div>
            </div>

            {!isCreate && (
              <div className="flex items-center gap-3 text-xs font-medium text-white/80">
                <button className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
              </div>
            )}
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isCreate ? '' : 'md:ml-12'
              }`}
          >
            <input type="text" placeholder="Nome do produto" className={inputClassName} />
            <input type="text" placeholder="SKU" className={inputClassName} />
            <input type="text" placeholder="Categoria" className={inputClassName} />
            <input type="text" placeholder="Preço" className={inputClassName} />
            <input type="text" placeholder="Estoque inicial" className={inputClassName} />
          </div>
        </section>

        <div
          className={`flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-[#2a2a2a] ${isCreate ? 'justify-end' : 'justify-between md:ml-12'
            }`}
        >
          {!isCreate && (
            <Button className="bg-[#b31414] hover:bg-[#df1b1b] text-white border border-transparent focus:border-[#c000ff] rounded-full px-6 h-12 outline-none focus:outline-none">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Produto
            </Button>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
            <Button
              onClick={() => isCreate && setShowCreateForm(false)}
              className="bg-[#4a136f] hover:bg-[#5a1786] text-[#e0c7f2] border border-transparent focus:border-[#c000ff] rounded-full px-6 h-12 outline-none focus:outline-none"
            >
              Cancelar
            </Button>

            <Button className="bg-[#c000ff] hover:bg-[#da3dff] text-white border border-transparent focus:border-[#c000ff] rounded-full px-8 h-12 font-bold text-center outline-none focus:outline-none">
              <Plus className="w-4 h-4 mr-2" />
              {isCreate ? 'Cadastrar Produto' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex w-full mb-8 relative">
        <input
          type="text"
          placeholder="Pesquisar"
          className="w-full h-12 bg-[#1a1a1a] rounded-full px-6 pr-14 text-slate-200 placeholder-slate-500 border border-transparent focus:border-[#c000ff] focus:outline-none transition-colors"
        />

        <button className="absolute right-0 top-0 h-12 w-12 bg-[#c000ff] rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all border border-transparent focus:border-[#c000ff] outline-none focus:outline-none">
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-300">
              <Box className="w-5 h-5" />
            </div>

            <h1 className="text-3xl font-bold text-white">Produtos</h1>
          </div>

          <p className="text-slate-300">Lista de produtos cadastrados</p>
        </div>

        <Button
          onClick={() => setShowCreateForm(prev => !prev)}
          className="bg-[#421d63] hover:bg-[#52257a] text-white border border-[#52257a] focus:border-[#c000ff] gap-2 rounded-xl h-11 px-5 outline-none focus:outline-none"
        >
          {showCreateForm ? (
            <>
              <X className="w-4 h-4" />
              Fechar cadastro
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Cadastrar Produto
            </>
          )}
        </Button>
      </div>

      {showCreateForm && (
        <div className="rounded-[20px] overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl shadow-black/20">
          <div className="bg-[#5b148a] px-5 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg">
                Cadastrar novo produto
              </h2>

              <p className="text-white/70 text-sm mt-0.5">
                Complete os dados abaixo para criar um novo produto
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

          {renderProdutoForm('create')}
        </div>
      )}

      <div className="space-y-4">
        {mockProdutos.map(produto => {
          const isExpanded = expandedId === produto.id;

          return (
            <div
              key={produto.id}
              className="rounded-[20px] overflow-hidden bg-[#111111]"
            >
              <button
                onClick={() => toggleExpand(produto.id)}
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
                    <Barcode className="w-5 h-5" />
                  </div>

                  <div className="text-left">
                    <span className="block text-white font-medium">{produto.nome}</span>
                    <span className="block text-xs text-white/70 mt-0.5">
                      {produto.categoria} · {produto.sku}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span className="hidden sm:inline">
                    {isExpanded ? 'Ocultar dados do produto' : 'Mostrar dados do produto'}
                  </span>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {isExpanded && renderProdutoForm('edit')}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-400 mt-8 mb-4">
        Lista de produtos (10-10 reload)
      </div>
    </div>
  );
};

export default ProdutosList;
