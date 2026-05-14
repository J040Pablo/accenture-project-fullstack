import { useMemo, useState, type FC } from 'react';
import {
  Barcode,
  Box,
  ChevronDown,
  ChevronUp,
  Plus,
  Package,
  Trash2,
  X,
  DollarSign,
  Layers,
  Archive,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageToolbar } from '../../components/ui/PageToolbar';
import { PrimaryActionButton } from '../../components/ui/PrimaryActionButton';
import { FilterDropdown, FilterGroup, FilterOption } from '../../components/ui/FilterDropdown';

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
  'w-full bg-[#151515] border border-[#2a2a2a] h-11 rounded-xl px-4 text-sm text-white placeholder-slate-500 outline-none focus:outline-none focus:ring-0 focus:border-[#a100ff] transition-colors duration-200';

// ─── Component ────────────────────────────────────────────────────────────────

const ProdutosList: FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [stockFilter, setStockFilter] = useState<'todos' | 'pouco' | 'sem'>('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const categories = useMemo(() => Array.from(new Set(mockProdutos.map(p => p.categoria))), []);

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

      // parse numeric stock from produto.estoque (e.g., '120 unidades')
      const stockMatch = produto.estoque.match(/(\d+)/);
      const stockNum = stockMatch ? parseInt(stockMatch[1], 10) : 0;

      const correspondeStock =
        stockFilter === 'todos' ||
        (stockFilter === 'pouco' && stockNum > 0 && stockNum <= 10) ||
        (stockFilter === 'sem' && stockNum === 0);

      const correspondeCategoria = !categoryFilter || produto.categoria === categoryFilter;

      return correspondeBusca && correspondeStatus && correspondeStock && correspondeCategoria;
    });
  }, [searchTerm, statusFilter, stockFilter, categoryFilter]);

  const limparFiltros = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setStockFilter('todos');
    setCategoryFilter('');
  };

  // Count active filters for badge
  const activeFiltersCount = [
    statusFilter !== 'todos' ? 1 : 0,
    stockFilter !== 'todos' ? 1 : 0,
    categoryFilter !== '' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

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
    <PageLayout>
      <PageHeader
        title="Produtos"
        subtitle="Gerencie o catálogo, preços e níveis de estoque"
        icon={<Package className="w-5 h-5" />}
        action={
          showCreateForm ? (
            <Button
              onClick={() => setShowCreateForm(false)}
              className="w-full md:w-auto h-11 px-6 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-400 font-black hover:text-white transition-all gap-2"
            >
              <X className="w-4 h-4" />
              FECHAR CADASTRO
            </Button>
          ) : (
            <PrimaryActionButton onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4" />
              CADASTRAR PRODUTO
            </PrimaryActionButton>
          )
        }
      />

      <PageToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pesquisar por nome, SKU, categoria..."
        rightContent={
          <div className="flex items-center gap-3">
            <FilterDropdown activeFiltersCount={activeFiltersCount}>
              {/* Status Filter */}
              <FilterGroup title="Status">
                {['Todos', 'Ativos', 'Inativos'].map((label) => {
                  const value = label.toLowerCase() as 'todos' | 'ativos' | 'inativos';
                  return (
                    <FilterOption
                      key={value}
                      label={label}
                      isActive={statusFilter === value}
                      onClick={() => setStatusFilter(value)}
                    />
                  );
                })}
              </FilterGroup>

              {/* Stock Filter */}
              <FilterGroup title="Estoque">
                <FilterOption
                  label="Todos"
                  isActive={stockFilter === 'todos'}
                  onClick={() => setStockFilter('todos')}
                />
                <FilterOption
                  label="Pouco estoque"
                  isActive={stockFilter === 'pouco'}
                  onClick={() => setStockFilter('pouco')}
                />
                <FilterOption
                  label="Sem estoque"
                  isActive={stockFilter === 'sem'}
                  onClick={() => setStockFilter('sem')}
                />
              </FilterGroup>

              {/* Category Filter */}
              <FilterGroup title="Categoria">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#2a2a2a] text-slate-300 text-xs font-semibold focus:outline-none focus:border-[#a100ff] transition-all"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </FilterGroup>

              {/* Clear button */}
              <div className="border-t border-[#1a1a1a] pt-4 mt-4">
                <button
                  onClick={limparFiltros}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#2a2a2a] text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all"
                >
                  Limpar filtros
                </button>
              </div>
            </FilterDropdown>

            {/* Counter */}
            <div className="flex items-center gap-2 px-4 h-12 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-500 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
              {produtosFiltrados.length} encontrados
            </div>
          </div>
        }
      />

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
    </PageLayout>
  );
};

export default ProdutosList;