package com.accenture.loja.produto.service;

import com.accenture.loja.produto.dto.ProdutoRequestDTO;
import com.accenture.loja.produto.dto.ProdutoResponseDTO;
import com.accenture.loja.produto.model.Produto;
import com.accenture.loja.produto.repository.ProdutoRepository;
import com.accenture.loja.shared.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProdutoServiceTest {

    private static final Long PRODUTO_ID = 1L;
    private static final Long OUTRO_PRODUTO_ID = 2L;

    @Mock
    private ProdutoRepository produtoRepository;

    @InjectMocks
    private ProdutoService produtoService;

    @Test
    void deveCadastrarProdutoComSucesso() {
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10);
        Produto produtoSalvo = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produtoSalvo.setId(PRODUTO_ID);

        when(produtoRepository.existsBySku("SKU-001")).thenReturn(false);
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        ProdutoResponseDTO response = produtoService.cadastrar(request);

        assertEquals(PRODUTO_ID, response.id());
        assertEquals("SKU-001", response.sku());
        assertEquals("Notebook", response.nome());
        assertEquals("Eletrônicos", response.categoria());
        assertEquals(BigDecimal.valueOf(3000), response.preco());
        assertEquals(10, response.estoque());
        assertTrue(response.ativo());
        verify(produtoRepository).existsBySku("SKU-001");
        verify(produtoRepository).save(any(Produto.class));
    }

    @Test
    void deveLancarBusinessExceptionQuandoCadastrarComSkuJaExistente() {
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10);

        when(produtoRepository.existsBySku("SKU-001")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.cadastrar(request));

        assertEquals("SKU já cadastrado", exception.getMessage());
        verify(produtoRepository).existsBySku("SKU-001");
        verify(produtoRepository, never()).save(any());
    }

    @Test
    void deveLancarBusinessExceptionQuandoCadastrarComPrecoNull() {
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook", "Eletrônicos", null, 10);

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.cadastrar(request));

        assertEquals("Preço deve ser maior que zero", exception.getMessage());
        verify(produtoRepository, never()).existsBySku(anyString());
        verify(produtoRepository, never()).save(any());
    }

    @Test
    void deveLancarBusinessExceptionQuandoCadastrarComPrecoZero() {
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook", "Eletrônicos", BigDecimal.ZERO, 10);

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.cadastrar(request));

        assertEquals("Preço deve ser maior que zero", exception.getMessage());
        verify(produtoRepository, never()).existsBySku(anyString());
        verify(produtoRepository, never()).save(any());
    }

    @Test
    void deveLancarBusinessExceptionQuandoCadastrarComPrecoNegativo() {
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(-1), 10);

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.cadastrar(request));

        assertEquals("Preço deve ser maior que zero", exception.getMessage());
        verify(produtoRepository, never()).existsBySku(anyString());
        verify(produtoRepository, never()).save(any());
    }

    @Test
    void deveLancarBusinessExceptionQuandoCadastrarComEstoqueNull() {
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), null);

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.cadastrar(request));

        assertEquals("Estoque não pode ser negativo", exception.getMessage());
        verify(produtoRepository, never()).existsBySku(anyString());
        verify(produtoRepository, never()).save(any());
    }

    @Test
    void deveLancarBusinessExceptionQuandoCadastrarComEstoqueNegativo() {
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), -1);

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.cadastrar(request));

        assertEquals("Estoque não pode ser negativo", exception.getMessage());
        verify(produtoRepository, never()).existsBySku(anyString());
        verify(produtoRepository, never()).save(any());
    }

    @Test
    void deveListarProdutosEConverterParaResponseDTO() {
        Produto produto1 = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produto1.setId(PRODUTO_ID);
        Produto produto2 = criarProduto("SKU-002", "Mouse", "Periféricos", BigDecimal.valueOf(100), 20, false);
        produto2.setId(OUTRO_PRODUTO_ID);

        when(produtoRepository.findAll()).thenReturn(List.of(produto1, produto2));

        List<ProdutoResponseDTO> response = produtoService.listar();

        assertEquals(2, response.size());
        assertEquals(PRODUTO_ID, response.get(0).id());
        assertEquals("SKU-001", response.get(0).sku());
        assertTrue(response.get(0).ativo());
        assertEquals(OUTRO_PRODUTO_ID, response.get(1).id());
        assertEquals("SKU-002", response.get(1).sku());
        assertFalse(response.get(1).ativo());
        verify(produtoRepository).findAll();
    }

    @Test
    void deveBuscarPorIdQuandoProdutoExistente() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produto.setId(PRODUTO_ID);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));

        ProdutoResponseDTO response = produtoService.buscarPorId(PRODUTO_ID);

        assertEquals(PRODUTO_ID, response.id());
        assertEquals("SKU-001", response.sku());
        assertEquals("Notebook", response.nome());
        assertEquals("Eletrônicos", response.categoria());
        assertEquals(BigDecimal.valueOf(3000), response.preco());
        assertEquals(10, response.estoque());
        assertTrue(response.ativo());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveLancarBusinessExceptionQuandoBuscarPorIdInexistente() {
        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.buscarPorId(PRODUTO_ID));

        assertEquals("Produto não encontrado", exception.getMessage());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveAtualizarProdutoMantendoMesmoSku() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produto.setId(PRODUTO_ID);
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook Pro", "Eletrônicos", BigDecimal.valueOf(3500), 12);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));

        ProdutoResponseDTO response = produtoService.atualizar(PRODUTO_ID, request);

        assertEquals(PRODUTO_ID, response.id());
        assertEquals("SKU-001", response.sku());
        assertEquals("Notebook Pro", response.nome());
        assertEquals("Eletrônicos", response.categoria());
        assertEquals(BigDecimal.valueOf(3500), response.preco());
        assertEquals(12, response.estoque());
        verify(produtoRepository).findById(PRODUTO_ID);
        verify(produtoRepository, never()).existsBySku(anyString());
    }

    @Test
    void deveAtualizarProdutoComNovoSkuDisponivel() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produto.setId(PRODUTO_ID);
        ProdutoRequestDTO request = criarRequestValido("SKU-002", "Notebook Pro", "Eletrônicos", BigDecimal.valueOf(3500), 12);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));
        when(produtoRepository.existsBySku("SKU-002")).thenReturn(false);

        ProdutoResponseDTO response = produtoService.atualizar(PRODUTO_ID, request);

        assertEquals("SKU-002", response.sku());
        assertEquals("Notebook Pro", response.nome());
        assertEquals(BigDecimal.valueOf(3500), response.preco());
        assertEquals(12, response.estoque());
        verify(produtoRepository).findById(PRODUTO_ID);
        verify(produtoRepository).existsBySku("SKU-002");
    }

    @Test
    void deveLancarBusinessExceptionQuandoAtualizarComSkuDeOutroProduto() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produto.setId(PRODUTO_ID);
        ProdutoRequestDTO request = criarRequestValido("SKU-002", "Notebook Pro", "Eletrônicos", BigDecimal.valueOf(3500), 12);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));
        when(produtoRepository.existsBySku("SKU-002")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.atualizar(PRODUTO_ID, request));

        assertEquals("SKU já cadastrado", exception.getMessage());
        assertEquals("SKU-001", produto.getSku());
        verify(produtoRepository).findById(PRODUTO_ID);
        verify(produtoRepository).existsBySku("SKU-002");
    }

    @Test
    void deveLancarBusinessExceptionQuandoAtualizarProdutoInexistente() {
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.atualizar(PRODUTO_ID, request));

        assertEquals("Produto não encontrado", exception.getMessage());
        verify(produtoRepository).findById(PRODUTO_ID);
        verify(produtoRepository, never()).existsBySku(anyString());
    }

    @Test
    void deveLancarBusinessExceptionQuandoAtualizarComPrecoInvalido() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produto.setId(PRODUTO_ID);
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook Pro", "Eletrônicos", BigDecimal.ZERO, 12);

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.atualizar(PRODUTO_ID, request));

        assertEquals("Preço deve ser maior que zero", exception.getMessage());
        assertEquals("Notebook", produto.getNome());
        verify(produtoRepository, never()).existsBySku(anyString());
        verify(produtoRepository, never()).findById(anyLong());
    }

    @Test
    void deveLancarBusinessExceptionQuandoAtualizarComEstoqueInvalido() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produto.setId(PRODUTO_ID);
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook Pro", "Eletrônicos", BigDecimal.valueOf(3500), -1);

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.atualizar(PRODUTO_ID, request));

        assertEquals("Estoque não pode ser negativo", exception.getMessage());
        assertEquals(10, produto.getEstoque());
        verify(produtoRepository, never()).existsBySku(anyString());
        verify(produtoRepository, never()).findById(anyLong());
    }

    @Test
    void deveInativarProduto() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produto.setId(PRODUTO_ID);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));

        produtoService.inativar(PRODUTO_ID);

        assertFalse(produto.getAtivo());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveLancarBusinessExceptionQuandoInativarProdutoInexistente() {
        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.inativar(PRODUTO_ID));

        assertEquals("Produto não encontrado", exception.getMessage());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveBaixarEstoqueQuandoProdutoAtivoEQuantidadeValida() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produto.setId(PRODUTO_ID);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));

        produtoService.baixarEstoque(PRODUTO_ID, 3);

        assertEquals(7, produto.getEstoque());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveLancarBusinessExceptionQuandoBaixarEstoqueComQuantidadeNull() {
        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.baixarEstoque(PRODUTO_ID, null));

        assertEquals("Quantidade deve ser maior que zero", exception.getMessage());
        verify(produtoRepository, never()).findById(anyLong());
    }

    @Test
    void deveLancarBusinessExceptionQuandoBaixarEstoqueComQuantidadeZero() {
        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.baixarEstoque(PRODUTO_ID, 0));

        assertEquals("Quantidade deve ser maior que zero", exception.getMessage());
        verify(produtoRepository, never()).findById(anyLong());
    }

    @Test
    void deveLancarBusinessExceptionQuandoBaixarEstoqueComQuantidadeNegativa() {
        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.baixarEstoque(PRODUTO_ID, -1));

        assertEquals("Quantidade deve ser maior que zero", exception.getMessage());
        verify(produtoRepository, never()).findById(anyLong());
    }

    @Test
    void deveLancarBusinessExceptionQuandoBaixarEstoqueComProdutoInativo() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, false);
        produto.setId(PRODUTO_ID);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.baixarEstoque(PRODUTO_ID, 1));

        assertEquals("Produto inativo não pode ser vendido", exception.getMessage());
        assertEquals(10, produto.getEstoque());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveLancarBusinessExceptionQuandoBaixarEstoqueComEstoqueInsuficiente() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 2, true);
        produto.setId(PRODUTO_ID);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.baixarEstoque(PRODUTO_ID, 3));

        assertEquals("Estoque insuficiente", exception.getMessage());
        assertEquals(2, produto.getEstoque());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveLancarBusinessExceptionQuandoBaixarEstoqueNaoPodeFicarNegativo() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 1, true);
        produto.setId(PRODUTO_ID);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.baixarEstoque(PRODUTO_ID, 2));

        assertEquals("Estoque insuficiente", exception.getMessage());
        assertEquals(1, produto.getEstoque());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveDevolverEstoqueQuandoQuantidadeValida() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 5, true);
        produto.setId(PRODUTO_ID);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));

        produtoService.devolverEstoque(PRODUTO_ID, 4);

        assertEquals(9, produto.getEstoque());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveLancarBusinessExceptionQuandoDevolverEstoqueComQuantidadeNull() {
        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.devolverEstoque(PRODUTO_ID, null));

        assertEquals("Quantidade deve ser maior que zero", exception.getMessage());
        verify(produtoRepository, never()).findById(anyLong());
    }

    @Test
    void deveLancarBusinessExceptionQuandoDevolverEstoqueComQuantidadeZero() {
        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.devolverEstoque(PRODUTO_ID, 0));

        assertEquals("Quantidade deve ser maior que zero", exception.getMessage());
        verify(produtoRepository, never()).findById(anyLong());
    }

    @Test
    void deveLancarBusinessExceptionQuandoDevolverEstoqueComQuantidadeNegativa() {
        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.devolverEstoque(PRODUTO_ID, -1));

        assertEquals("Quantidade deve ser maior que zero", exception.getMessage());
        verify(produtoRepository, never()).findById(anyLong());
    }

    @Test
    void deveBuscarProdutoPorIdQuandoProdutoExistente() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produto.setId(PRODUTO_ID);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));

        ProdutoResponseDTO response = produtoService.buscarPorId(PRODUTO_ID);

        assertEquals(PRODUTO_ID, response.id());
        assertEquals("SKU-001", response.sku());
        assertEquals("Notebook", response.nome());
        assertEquals("Eletrônicos", response.categoria());
        assertEquals(BigDecimal.valueOf(3000), response.preco());
        assertEquals(10, response.estoque());
        assertTrue(response.ativo());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveLancarBusinessExceptionQuandoBuscarProdutoPorIdInexistente() {
        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.buscarPorId(PRODUTO_ID));

        assertEquals("Produto não encontrado", exception.getMessage());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveBuscarProdutoPorIdRetornandoEntidadeExistente() {
        Produto produto = criarProduto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10, true);
        produto.setId(PRODUTO_ID);

        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.of(produto));

        Produto response = produtoService.buscarProdutoPorId(PRODUTO_ID);

        assertEquals(PRODUTO_ID, response.getId());
        assertEquals("SKU-001", response.getSku());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    @Test
    void deveLancarBusinessExceptionQuandoBuscarProdutoPorIdInexistenteNaConsultaDeEntidade() {
        when(produtoRepository.findById(PRODUTO_ID)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> produtoService.buscarProdutoPorId(PRODUTO_ID));

        assertEquals("Produto não encontrado", exception.getMessage());
        verify(produtoRepository).findById(PRODUTO_ID);
    }

    private ProdutoRequestDTO criarRequestValido(String sku, String nome, String categoria, BigDecimal preco, Integer estoque) {
        return new ProdutoRequestDTO(sku, nome, categoria, preco, estoque);
    }

    private Produto criarProduto(String sku, String nome, String categoria, BigDecimal preco, Integer estoque, boolean ativo) {
        Produto produto = new Produto(sku, nome, categoria, preco, estoque);
        produto.setAtivo(ativo);
        return produto;
    }
}