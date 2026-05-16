import { useEffect, useMemo, useState, type FC } from 'react';
import { toast } from 'react-toastify';
import {
  Barcode,
  Box,
  ChevronDown,
  ChevronUp,
  Plus,
  Package,
  X,
  DollarSign,
  Layers,
  Archive,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageToolbar } from '../../components/ui/PageToolbar';
import { PrimaryActionButton } from '../../components/ui/PrimaryActionButton';
import { FilterDropdown, FilterGroup, FilterOption } from '../../components/ui/FilterDropdown';
import {
  listarProdutos,
  cadastrarProduto,
  atualizarProduto,
  excluirProduto,
  ativarProduto,
  inativarProduto,
  type ProdutoPayload,
  extrairErroProduto
} from '../../services/produtoService';
import type { Produto } from '../../types/Produto';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const formatarPreco = (preco: number) => currencyFormatter.format(preco);
const formatarEstoque = (estoque: number) => `${estoque} unidade${estoque === 1 ? '' : 's'}`;

const produtoInicial: ProdutoPayload = {
  sku: '',
  nome: '',
  categoria: '',
  preco: 0,
  estoque: 0
};

// Tipo para erros de campo
interface ErrosCampo {
  sku?: string;
  nome?: string;
  categoria?: string;
  preco?: string;
  estoque?: string;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const inputClassName =
  'w-full bg-[#151515] border border-[#2a2a2a] h-11 rounded-xl px-4 text-sm text-white placeholder-slate-500 outline-none focus:outline-none focus:ring-0 focus:border-[#a100ff] transition-colors duration-200';
// ─── SKU Helpers ──────────────────────────────────────────────────────────────

function extrairPartesSku(valor: string): { letras: string; numeros: string } {
  const limpo = valor.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const letras = limpo.replace(/[^A-Z]/g, '').slice(0, 3);
  const numeros = limpo.replace(/\D/g, '').slice(0, 6);

  return { letras, numeros };
}

function formatarSkuDuranteDigitacao(valor: string): string {
  const { letras, numeros } = extrairPartesSku(valor);

  if (!letras && !numeros) return '';

  if (letras.length < 3) {
    return letras;
  }

  return numeros ? `${letras}-${numeros}` : `${letras}-`;
}

function normalizarSku(valor: string): string {
  const { letras, numeros } = extrairPartesSku(valor);

  if (letras.length !== 3 || !numeros) return '';

  return `${letras}-${numeros.padStart(6, '0')}`;
}
// ─── Component ────────────────────────────────────────────────────────────────

const ProdutosList: FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formProduto, setFormProduto] = useState<ProdutoPayload>(produtoInicial);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [stockFilter, setStockFilter] = useState<'todos' | 'pouco' | 'sem'>('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Estados para validação de formulário
  const [errosCriacao, setErrosCriacao] = useState<ErrosCampo>({});
  const [errosEdicao, setErrosEdicao] = useState<ErrosCampo>({});
  const [erroGeralCriacao, setErroGeralCriacao] = useState<string | null>(null);
  const [erroGeralEdicao, setErroGeralEdicao] = useState<string | null>(null);

  async function carregarProdutos() {
    try {
      setLoading(true);
      setErro(null);

      const data = await listarProdutos();
      setProdutos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setErro('Erro ao carregar produtos.');
      toast.error('Erro ao carregar produtos. Verifique se o backend está ativo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregarProdutos();
  }, []);

  function handleChangeProduto(campo: keyof ProdutoPayload, valor: string) {
    setFormProduto((prev) => {
      if (campo === 'sku') {
        return {
          ...prev,
          sku: formatarSkuDuranteDigitacao(valor)
        };
      }

      return {
        ...prev,
        [campo]: campo === 'preco' || campo === 'estoque' ? Number(valor) : valor
      };
    });

    // Limpar erro do campo correspondente
    if (produtoEditando) {
      setErrosEdicao((prev) => ({
        ...prev,
        [campo]: undefined
      }));
    } else {
      setErrosCriacao((prev) => ({
        ...prev,
        [campo]: undefined
      }));
    }
  }

  function validarProduto(produto: ProdutoPayload): ErrosCampo {
    const erros: ErrosCampo = {};

    // Validar Nome
    if (!produto.nome.trim()) {
      erros.nome = 'Nome é obrigatório.';
    }

    // Validar SKU
    const skuNormalizado = normalizarSku(produto.sku);
    if (!skuNormalizado) {
      erros.sku = 'SKU deve seguir o padrão AAA-000000.';
    }

    // Validar Categoria
    if (!produto.categoria.trim()) {
      erros.categoria = 'Categoria é obrigatória.';
    }

    // Validar Preço
    if (produto.preco <= 0) {
      erros.preco = 'Preço deve ser maior que zero.';
    }

    // Validar Estoque
    if (produto.estoque < 0) {
      erros.estoque = 'Estoque não pode ser negativo.';
    }

    return erros;
  }

  function cancelarFormulario() {
    setShowCreateForm(false);
    setProdutoEditando(null);
    setFormProduto(produtoInicial);
    setExpandedId(null);
    setErrosCriacao({});
    setErrosEdicao({});
    setErroGeralCriacao(null);
    setErroGeralEdicao(null);
  }

  function iniciarEdicao(produto: Produto) {
    setProdutoEditando(produto);
    setFormProduto({
      sku: produto.sku,
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco,
      estoque: produto.estoque
    });
    setExpandedId(produto.id);
    setShowCreateForm(false);
  }

  function handleToggleProduto(produto: Produto) {
    const jaEstaExpandido = expandedId === produto.id;

    if (jaEstaExpandido) {
      setExpandedId(null);
      setProdutoEditando(null);
      setFormProduto(produtoInicial);
      return;
    }

    iniciarEdicao(produto);
  }

  async function handleCadastrarProduto() {
    try {
      // Validar localmente
      const errosValidacao = validarProduto(formProduto);

      if (Object.keys(errosValidacao).length > 0) {
        setErrosCriacao(errosValidacao);
        return;
      }

      // Limpar erros anteriores
      setErrosCriacao({});
      setErroGeralCriacao(null);
      setSalvando(true);

      const payload: ProdutoPayload = {
        ...formProduto,
        sku: normalizarSku(formProduto.sku)
      };

      await cadastrarProduto(payload);
      setFormProduto(produtoInicial);
      setProdutoEditando(null);
      setShowCreateForm(false);
      toast.success('Produto cadastrado com sucesso.');
      await carregarProdutos();
        
    } catch (error) {
      console.error(error);
      
      // Extrair erros do backend
      const erroResposta = extrairErroProduto(error);
      
      if (erroResposta.errosCampo.length > 0) {
        // Mapear erros por campo
        const errosPorCampo: ErrosCampo = {};
        erroResposta.errosCampo.forEach(({ campo, mensagem }) => {
          // Apenas adicionar erro se for um campo de entrada (não ativo)
          if (campo !== 'ativo') {
            errosPorCampo[campo] = mensagem;
          }
        });
        setErrosCriacao(errosPorCampo);
      }

      // Se houver mensagem geral, exibir no topo ou toast
      if (erroResposta.mensagemGeral) {
        if (erroResposta.statusCode && erroResposta.statusCode >= 500) {
          toast.error(erroResposta.mensagemGeral);
        } else {
          setErroGeralCriacao(erroResposta.mensagemGeral);
        }
      }
    } finally {
      setSalvando(false);
    }
  }

  async function handleEditarProduto() {
    if (!produtoEditando) return;

    try {
      // Validar localmente
      const errosValidacao = validarProduto(formProduto);

      if (Object.keys(errosValidacao).length > 0) {
        setErrosEdicao(errosValidacao);
        return;
      }

      // Limpar erros anteriores
      setErrosEdicao({});
      setErroGeralEdicao(null);
      setSalvando(true);

      const payload: ProdutoPayload = {
        ...formProduto,
        sku: normalizarSku(formProduto.sku)
      };

      await atualizarProduto(produtoEditando.id, payload);
      setProdutoEditando(null);
      setFormProduto(produtoInicial);
      setExpandedId(null);
      toast.success('Produto atualizado com sucesso.');
      await carregarProdutos();
        
    } catch (error) {
      console.error(error);
      
      // Extrair erros do backend
      const erroResposta = extrairErroProduto(error);
      
      if (erroResposta.errosCampo.length > 0) {
        // Mapear erros por campo
        const errosPorCampo: ErrosCampo = {};
        erroResposta.errosCampo.forEach(({ campo, mensagem }) => {
          // Apenas adicionar erro se for um campo de entrada (não ativo)
          if (campo !== 'ativo') {
            errosPorCampo[campo] = mensagem;
          }
        });
        setErrosEdicao(errosPorCampo);
      }

      // Se houver mensagem geral, exibir no topo ou toast
      if (erroResposta.mensagemGeral) {
        if (erroResposta.statusCode && erroResposta.statusCode >= 500) {
          toast.error(erroResposta.mensagemGeral);
        } else {
          setErroGeralEdicao(erroResposta.mensagemGeral);
        }
      }
    } finally {
      setSalvando(false);
    }
  }

  async function handleAlterarStatusProduto(produto: Produto, ativo: boolean) {
    const confirmar = window.confirm(
      ativo
        ? 'Tem certeza que deseja ativar este produto?'
        : 'Tem certeza que deseja inativar este produto?'
    );

    if (!confirmar) return;

    try {
      setSalvando(true);
      setErro(null);

      if (ativo) {
        await ativarProduto(produto.id);
        toast.success('Produto ativado com sucesso.');
      } else {
        await inativarProduto(produto.id);
        toast.success('Produto inativado com sucesso.');
      }

      setProdutoEditando(null);
      setExpandedId(null);
      setFormProduto(produtoInicial);
      setErrosCriacao({});
      setErrosEdicao({});
      setErroGeralCriacao(null);
      setErroGeralEdicao(null);
      await carregarProdutos();
        
    } catch (error) {
      console.error(error);
      const erroResposta = extrairErroProduto(error);
      if (erroResposta.statusCode && erroResposta.statusCode >= 500) {
        toast.error(erroResposta.mensagemGeral || (ativo ? 'Erro ao ativar produto.' : 'Erro ao inativar produto.'));
      } else {
        toast.error(ativo ? 'Erro ao ativar produto.' : 'Erro ao inativar produto.');
      }
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluirProduto(produto: Produto) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir definitivamente este produto? Essa ação não poderá ser desfeita.'
    );

    if (!confirmar) return;

    try {
      setSalvando(true);
      setErro(null);

      await excluirProduto(produto.id);

      setProdutoEditando(null);
      setExpandedId(null);
      setFormProduto(produtoInicial);
      setErrosCriacao({});
      setErrosEdicao({});
      setErroGeralCriacao(null);
      setErroGeralEdicao(null);

      toast.success('Produto excluído com sucesso.');
      await carregarProdutos();
        
    } catch (error) {
      console.error(error);
      const erroResposta = extrairErroProduto(error);
      if (erroResposta.statusCode && erroResposta.statusCode >= 500) {
        toast.error(erroResposta.mensagemGeral || 'Erro ao excluir produto.');
      } else {
        toast.error('Erro ao excluir produto. Se ele possuir vínculo com pedidos, inative em vez de excluir.');
      }
    } finally {
      setSalvando(false);
    }
  }

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          produtos
            .map((produto) => produto.categoria)
            .filter((categoria): categoria is string => Boolean(categoria))
        )
      ),
    [produtos]
  );

  const produtosFiltrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return produtos.filter((produto) => {
      const correspondeBusca =
        produto.nome.toLowerCase().includes(termo) ||
        produto.sku.toLowerCase().includes(termo) ||
        produto.categoria.toLowerCase().includes(termo) ||
        formatarPreco(produto.preco).toLowerCase().includes(termo) ||
        String(produto.estoque).toLowerCase().includes(termo) ||
        (produto.ativo ? 'ativo' : 'inativo').includes(termo);

      const correspondeStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'ativos' && produto.ativo) ||
        (statusFilter === 'inativos' && !produto.ativo);

      const stockNum = produto.estoque ?? 0;

      const correspondeStock =
        stockFilter === 'todos' ||
        (stockFilter === 'pouco' && stockNum > 0 && stockNum <= 10) ||
        (stockFilter === 'sem' && stockNum === 0);

      const correspondeCategoria = !categoryFilter || produto.categoria === categoryFilter;

      return correspondeBusca && correspondeStatus && correspondeStock && correspondeCategoria;
    });
  }, [searchTerm, statusFilter, stockFilter, categoryFilter, produtos]);

  const produtosEstoqueBaixo = useMemo(() => {
    return produtos.filter((produto) => produto.ativo && produto.estoque > 0 && produto.estoque <= 10);
  }, [produtos]);

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
    const isEdit = !isCreate;
    const erros = isCreate ? errosCriacao : errosEdicao;
    const erroGeral = isCreate ? erroGeralCriacao : erroGeralEdicao;

    return (
      <div className={isCreate ? 'p-8' : 'p-8 bg-[#0b0b0b] border-t border-[#1a1a1a]'}>
        {erroGeral && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-800/40 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-400">{erroGeral}</p>
            </div>
          </div>
        )}

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
                   <input
                     type="text"
                     value={formProduto.nome}
                     onChange={(e) => handleChangeProduto('nome', e.target.value)}
                     placeholder="Ex: Batata Lavada"
                     className={`${inputClassName} ${erros.nome ? 'border-red-500 focus:border-red-500' : ''}`}
                   />
                   {erros.nome && (
                     <p className="text-[10px] text-red-500 ml-1 font-medium">{erros.nome}</p>
                   )}
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">SKU do Produto</label>
                   <input
                     type="text"
                     value={formProduto.sku}
                     onChange={(e) => handleChangeProduto('sku', e.target.value)}
                     onBlur={(e) =>
                       setFormProduto((prev) => ({
                         ...prev,
                         sku: normalizarSku(e.target.value)
                       }))
                     }
                     placeholder="SKU-000001"
                     maxLength={10}
                     className={`${inputClassName} ${erros.sku ? 'border-red-500 focus:border-red-500' : ''}`}
                   />
                   {erros.sku ? (
                     <p className="text-[10px] text-red-500 ml-1 font-medium">{erros.sku}</p>
                   ) : (
                     <p className="text-[10px] text-slate-600 ml-1">
                       Padrão: 3 letras + hífen + 6 números. Ex: SKU-000123.
                     </p>
                   )}
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Categoria</label>
                   <input
                     type="text"
                     value={formProduto.categoria}
                     onChange={(e) => handleChangeProduto('categoria', e.target.value)}
                     placeholder="Ex: Hortifruti"
                     className={`${inputClassName} ${erros.categoria ? 'border-red-500 focus:border-red-500' : ''}`}
                   />
                   {erros.categoria && (
                     <p className="text-[10px] text-red-500 ml-1 font-medium">{erros.categoria}</p>
                   )}
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
                   <input
                     type="number"
                     min="0"
                     step="0.01"
                     value={formProduto.preco}
                     onChange={(e) => handleChangeProduto('preco', e.target.value)}
                     placeholder="0,00"
                     className={`${inputClassName} ${erros.preco ? 'border-red-500 focus:border-red-500' : ''}`}
                   />
                   {erros.preco && (
                     <p className="text-[10px] text-red-500 ml-1 font-medium">{erros.preco}</p>
                   )}
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Estoque Inicial</label>
                   <input
                     type="number"
                     min="0"
                     step="1"
                     value={formProduto.estoque}
                     onChange={(e) => handleChangeProduto('estoque', e.target.value)}
                     placeholder="Ex: 100 unidades"
                     className={`${inputClassName} ${erros.estoque ? 'border-red-500 focus:border-red-500' : ''}`}
                   />
                   {erros.estoque && (
                     <p className="text-[10px] text-red-500 ml-1 font-medium">{erros.estoque}</p>
                   )}
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
                         <span className="text-sm font-bold text-white">{isCreate ? 'Novo produto' : produtoEditando?.ativo ? 'Disponível' : 'Inativo'}</span>
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
          {isEdit && produtoEditando ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {produtoEditando.ativo ? (
                <Button
                  type="button"
                  onClick={() => handleAlterarStatusProduto(produtoEditando, false)}
                  disabled={salvando}
                  className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#111111] border border-[#5a1f35]/40 text-[#d6a2b0] font-bold hover:bg-[#2a1118] hover:border-[#5a1f35]/60 transition-all uppercase tracking-tighter text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  INATIVAR PRODUTO
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleAlterarStatusProduto(produtoEditando, true)}
                  disabled={salvando}
                  className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#111111] border border-[#a100ff]/40 text-[#d8b4fe] font-bold hover:bg-[#1a1024] hover:border-[#a100ff]/60 transition-all uppercase tracking-tighter text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  ATIVAR PRODUTO
                </Button>
              )}

              <Button
                type="button"
                onClick={() => handleExcluirProduto(produtoEditando)}
                disabled={salvando}
                className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#111111] border border-red-900/40 text-red-300 font-bold hover:bg-red-950/30 hover:border-red-800/60 transition-all uppercase tracking-tighter text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                EXCLUIR DEFINITIVAMENTE
              </Button>
            </div>
          ) : (
            <div className="text-xs text-slate-600 italic">Preencha os dados do dossiê técnico para registrar o novo item.</div>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              onClick={cancelarFormulario}
              disabled={salvando}
              className="flex-1 sm:flex-initial h-11 px-8 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-400 font-bold hover:text-white transition-all text-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              CANCELAR
            </Button>

            <Button
              type="button"
              onClick={isCreate ? handleCadastrarProduto : handleEditarProduto}
              disabled={salvando}
              className="flex-1 sm:flex-initial h-11 px-10 rounded-xl bg-[#a100ff] text-white font-black hover:bg-[#b833ff] shadow-lg shadow-[#a100ff]/20 transition-all text-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {salvando ? 'SALVANDO...' : isCreate ? 'FINALIZAR REGISTRO' : 'SALVAR ALTERAÇÕES'}
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
              type="button"
              onClick={cancelarFormulario}
              className="w-full md:w-auto h-11 px-6 rounded-xl bg-[#111111] border border-[#2a2a2a] text-slate-400 font-black hover:text-white transition-all gap-2"
            >
              <X className="w-4 h-4" />
              FECHAR CADASTRO
            </Button>
          ) : (
            <PrimaryActionButton
              onClick={() => {
                setProdutoEditando(null);
                setExpandedId(null);
                setFormProduto(produtoInicial);
                setShowCreateForm(true);
              }}
            >
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

              <div className="border-t border-[#1a1a1a] pt-4 mt-4">
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#2a2a2a] text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all"
                >
                  Limpar filtros
                </button>
              </div>
            </FilterDropdown>

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
              type="button"
              onClick={cancelarFormulario}
              className="w-9 h-9 rounded-full bg-[#111111] hover:bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-inner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {renderProdutoForm('create')}
        </div>
      )}

      {/* 4. List of Products */}
      {produtosEstoqueBaixo.length > 0 && (
        <div className="rounded-[24px] bg-[#0b0b0b] border border-amber-400/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg">Produtos com estoque baixo</h3>
              <p className="text-xs text-slate-500">Itens que merecem reposição imediata.</p>
            </div>
          </div>

          <div className="space-y-2">
            {produtosEstoqueBaixo.map((produto) => (
              <p key={produto.id} className="text-sm text-slate-400">
                {produto.nome} — estoque: {produto.estoque}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="rounded-[24px] bg-[#0b0b0b] border border-[#1a1a1a] p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-slate-700 mb-6 shadow-inner animate-pulse">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-white font-black text-xl mb-2">Carregando produtos...</h3>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Consultando o backend para montar a lista real do catálogo.</p>
          </div>
        ) : erro ? (
          <div className="rounded-[24px] bg-[#0b0b0b] border border-[#1a1a1a] p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-[#d6a2b0] mb-6 shadow-inner">
              <X className="w-10 h-10" />
            </div>
            <h3 className="text-white font-black text-xl mb-2">{erro}</h3>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Verifique se o backend está ativo e tente novamente.</p>
          </div>
        ) : produtosFiltrados.length > 0 ? (
          produtosFiltrados.map((produto) => {
            const isExpanded = expandedId === produto.id;
            const estoqueClasse =
              produto.estoque === 0
                ? 'text-[#d6a2b0]'
                : produto.estoque <= 10
                  ? 'text-amber-400'
                  : 'text-slate-400';

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
                  onClick={() => handleToggleProduto(produto)}
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
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                            produto.ativo
                              ? 'bg-[#a100ff]/10 text-[#d8b4fe] border-[#a100ff]/20'
                              : 'bg-black text-slate-600 border-[#1a1a1a]'
                          }`}
                        >
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
                          {formatarPreco(produto.preco)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-0.5">ESTOQUE FÍSICO</div>
                        <div className={`text-xs font-bold uppercase tracking-tight ${estoqueClasse}`}>
                          {formatarEstoque(produto.estoque)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                          isExpanded
                            ? 'bg-[#a100ff]/10 border-[#a100ff]/30 text-[#d8b4fe]'
                            : 'bg-[#111111] border-[#2a2a2a] text-slate-600'
                        }`}
                      >
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
            <h3 className="text-white font-black text-xl mb-2">
              {produtos.length === 0 ? 'Nenhum produto cadastrado.' : 'Sem resultados de catálogo'}
            </h3>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              {produtos.length === 0 ? 'Cadastre produtos no backend para exibi-los aqui.' : 'Tente ajustar sua busca ou filtros.'}
            </p>
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
          Exibindo {produtosFiltrados.length} de {produtos.length} unidades registradas
         </div>
      </div>
    </PageLayout>
  );
};

export default ProdutosList;