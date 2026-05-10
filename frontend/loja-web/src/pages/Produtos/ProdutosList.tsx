import { useMemo, useState, Fragment, type FC } from 'react';
import {
  Barcode,
  Box,
  ChevronDown,
  ChevronUp,
  Plus,
  Package,
  Search,
  Trash2,
  X,
  DollarSign,
  Layers,
  Archive,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProdutoMock {
  id: string;
  nome: string;
  sku: string;
  categoria: string;
  preco: string;
  estoque: string;
  ativo: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

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
    nome: 'Arroz 5kg',
    sku: 'ARR-050',
    categoria: 'Mercearia',
    preco: 'R$ 32,50',
    estoque: '48 unidades',
    ativo: true
  },
  {
    id: '3',
    nome: 'Coca cola 2L',
    sku: 'REF-220',
    categoria: 'Bebidas',
    preco: 'R$ 9,99',
    estoque: '85 unidades',
    ativo: false
  }
];

// ─── Style helpers ────────────────────────────────────────────────────────────

const inputClassName =
  'w-full bg-[#111111] h-11 rounded-xl px-4 text-sm text-white placeholder-slate-600 border border-[#2a2a2a] focus:border-[#a100ff]/60 focus:outline-none transition-all';

// ─── Component ────────────────────────────────────────────────────────────────

const ProdutosList: FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const produtosFiltrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return mockProdutos.filter(produto => {
      const correspondeBusca =
        produto.nome.toLowerCase().includes(termo) ||
        produto.sku.toLowerCase().includes(termo) ||
        produto.categoria.toLowerCase().includes(termo) ||
        produto.preco.toLowerCase().includes(termo) ||
        produto.estoque.toLowerCase().includes(termo) ||
        (produto.ativo ? 'ativo' : 'inativo').includes(termo);

      const correspondeStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'ativos' && produto.ativo) ||
        (statusFilter === 'inativos' && !produto.ativo);

      return correspondeBusca && correspondeStatus;
    });
  }, [searchTerm, statusFilter]);

  const limparFiltros = () => {
    setSearchTerm('');
    setStatusFilter('todos');
  };

  const renderProdutoForm = (mode: 'create' | 'edit') => {
    const isCreate = mode === 'create';

    return (
      <div className={isCreate ? 'p-8' : 'p-8 bg-[#0b0b0b] border-t border-[#1a1a1a]'}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          
          <div className="space-y-8">
            {/* Dados do Produto */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#a100ff]/10 flex items-center justify-center text-[#a100ff]">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Informações Técnicas</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Especificações e identificação do item</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Nome do Produto</label>
                   <input type="text" placeholder="Ex: Batata Lavada" className={inputClassName} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">SKU do Produto</label>
                   <input type="text" placeholder="PRO-0000" className={inputClassName} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Categoria</label>
                   <input type="text" placeholder="Ex: Hortifruti" className={inputClassName} />
                </div>
              </div>
            </section>

            {/* Inventário e Preço */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#a100ff]/10 flex items-center justify-center text-[#a100ff]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Estoque e Preificação</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Valores de venda e quantidades disponíveis</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Preço de Venda (R$)</label>
                   <input type="text" placeholder="0,00" className={inputClassName} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Estoque Inicial</label>
                   <input type="text" placeholder="Ex: 100 unidades" className={inputClassName} />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
             <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Archive className="w-3.5 h-3.5" /> MÉTRICAS
                </div>
                <div className="space-y-4">
                   <div className="p-4 rounded-xl bg-[#111111] border border-[#1a1a1a]">
                      <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Status Operacional</div>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-[#a1ffdb]" />
                         <span className="text-sm font-bold text-white">Disponível</span>
                      </div>
                   </div>
                   <div className="p-4 rounded-xl bg-[#111111] border border-[#1a1a1a]">
                      <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Impacto Financeiro</div>
                      <div className="text-sm font-black text-[#d8b4fe]">MARGEM PREVISTA 15%</div>
                   </div>
                </div>
             </div>

             <div className="p-5 rounded-2xl border border-[#a100ff]/10 bg-[#a100ff]/[0.02]">
                <p className="text-[10px] text-slate-500 leading-relaxed italic">Certifique-se de validar o SKU antes de finalizar o cadastro para evitar duplicidade no inventário.</p>
             </div>
          </aside>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-[#1a1a1a]">
          {!isCreate ? (
            <Button className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#111111] border border-[#5a1f35]/40 text-[#d6a2b0] font-bold hover:bg-[#2a1118] hover:border-[#5a1f35]/60 transition-all uppercase tracking-tighter text-xs">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Produto
            </Button>
          ) : (
            <div className="text-xs text-slate-600 italic">Preencha os dados do dossiê técnico para registrar o novo item.</div>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={() => isCreate && setShowCreateForm(false)}
              className="flex-1 sm:flex-initial h-11 px-8 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-400 font-bold hover:text-white transition-all text-xs"
            >
              CANCELAR
            </Button>

            <Button className="flex-1 sm:flex-initial h-11 px-10 rounded-xl bg-[#a100ff] text-white font-black hover:bg-[#b833ff] shadow-lg shadow-[#a100ff]/20 transition-all text-xs">
              {isCreate ? 'FINALIZAR REGISTRO' : 'SALVAR ALTERAÇÕES'}
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
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Produtos</h1>
          </div>
          <p className="text-slate-400 text-sm">Gerencie o catálogo, preços e níveis de estoque</p>
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
              FECHAR CADASTRO
            </Fragment>
          ) : (
            <Fragment>
              <Plus className="w-4 h-4" />
              CADASTRAR PRODUTO
            </Fragment>
          )}
        </Button>
      </div>

      {/* 2. Barra de Busca e Filtros Integrados */}
      <div className="rounded-[24px] bg-[#0b0b0b] border border-[#2a2a2a] p-2 flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
         <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Pesquisar por nome, SKU, categoria..."
              className="w-full h-11 bg-transparent rounded-xl px-12 text-sm text-slate-200 placeholder-slate-700 border-none focus:outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
         </div>
         
         <div className="h-px lg:h-8 lg:w-px bg-[#1a1a1a] mx-2" />

         <div className="flex items-center gap-2 p-1">
            {[
              { id: 'todos', label: 'TODOS' },
              { id: 'ativos', label: 'ATIVOS' },
              { id: 'inativos', label: 'INATIVOS' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`flex-1 lg:flex-initial px-4 h-9 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                  statusFilter === f.id
                    ? 'bg-[#a100ff] text-white shadow-inner'
                    : 'text-slate-600 hover:text-slate-300 hover:bg-[#111111]'
                }`}
              >
                {f.label}
              </button>
            ))}
         </div>

         {(searchTerm || statusFilter !== 'todos') && (
           <Fragment>
             <div className="h-px lg:h-8 lg:w-px bg-[#1a1a1a] mx-2" />
             <button
               onClick={limparFiltros}
               className="h-11 px-4 text-[10px] font-black text-[#d6a2b0] hover:text-white uppercase tracking-[0.2em] transition-colors"
             >
               Limpar
             </button>
           </Fragment>
         )}

         <div className="lg:ml-auto px-6 h-11 hidden xl:flex items-center border-l border-[#1a1a1a] text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            {produtosFiltrados.length} ENCONTRADOS
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
                <h2 className="text-white font-black text-xl tracking-tight">Registro de Catálogo</h2>
                <p className="text-xs text-slate-500 font-medium">Inclusão de novas unidades e especificações</p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateForm(false)}
              className="w-9 h-9 rounded-full bg-[#111111] hover:bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-inner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {renderProdutoForm('create')}
        </div>
      )}

      {/* 4. List of Products */}
      <div className="grid grid-cols-1 gap-4">
        {produtosFiltrados.length > 0 ? (
          produtosFiltrados.map(produto => {
            const isExpanded = expandedId === produto.id;

            return (
              <div
                key={produto.id}
                className={`rounded-[24px] overflow-hidden border transition-all duration-300 ${
                  isExpanded 
                    ? 'bg-[#0b0b0b] border-[#a100ff]/40 shadow-2xl shadow-[#a100ff]/5' 
                    : 'bg-[#0b0b0b] border-[#1a1a1a] hover:border-[#2a2a2a]'
                }`}
              >
                <button
                  onClick={() => toggleExpand(produto.id)}
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
                      <Package className={isExpanded ? 'w-7 h-7' : 'w-6 h-6'} />
                    </div>

                    <div className="min-w-0">
                       <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-white font-black text-lg tracking-tight truncate">{produto.nome}</h4>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                            produto.ativo 
                              ? 'bg-[#a100ff]/10 text-[#d8b4fe] border-[#a100ff]/20' 
                              : 'bg-black text-slate-600 border-[#1a1a1a]'
                          }`}>
                            {produto.ativo ? 'ATIVO' : 'INATIVO'}
                          </span>
                       </div>
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                         <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                            <Barcode className="w-3 h-3 text-[#a100ff]/40" />
                            {produto.sku}
                         </div>
                         <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                            <Layers className="w-3.5 h-3.5 text-slate-700" />
                            {produto.categoria}
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-x-12 gap-y-4">
                     {/* Financial Info */}
                     <div className="hidden sm:flex items-center gap-8 text-right">
                        <div>
                           <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-0.5">VALOR UNITÁRIO</div>
                           <div className="text-sm text-white font-black flex items-center justify-end gap-1.5 leading-none">
                              <DollarSign className="w-3 h-3 text-[#a1ffdb]" />
                              {produto.preco}
                           </div>
                        </div>
                        <div>
                           <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-0.5">ESTOQUE FÍSICO</div>
                           <div className={`text-xs font-bold uppercase tracking-tight ${produto.estoque.includes('0') ? 'text-[#d6a2b0]' : 'text-slate-400'}`}>
                              {produto.estoque}
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 ml-auto">
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

                {isExpanded && renderProdutoForm('edit')}
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] bg-[#0b0b0b] border border-[#1a1a1a] p-20 flex flex-col items-center text-center">
             <div className="w-20 h-20 rounded-3xl bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-700 mb-6 shadow-inner">
                <Box className="w-10 h-10" />
             </div>
             <h3 className="text-white font-black text-xl mb-2">Sem resultados de catálogo</h3>
             <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Não localizamos nenhum produto com os critérios "{searchTerm || statusFilter}".</p>
             
             <Button 
                onClick={limparFiltros} 
                className="mt-8 bg-[#111111] border border-[#a100ff]/30 text-[#d8b4fe] hover:bg-[#a100ff]/10 hover:border-[#a100ff]/50 px-8 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
             >
                Resetar Filtros
             </Button>
          </div>
        )}
      </div>

      {/* 5. Footer Info */}
      <div className="flex items-center justify-between p-8 rounded-3xl bg-[#0b0b0b] border border-[#1a1a1a] opacity-60">
         <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#a100ff]" />
            Inventário Consolidado {new Date().getFullYear()}
         </div>
         <div className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">
            Exibindo {produtosFiltrados.length} de {mockProdutos.length} unidades registradas
         </div>
      </div>
    </div>
  );
};

export default ProdutosList;