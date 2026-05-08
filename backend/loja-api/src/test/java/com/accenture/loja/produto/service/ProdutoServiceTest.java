package com.accenture.loja.produto.service;

import com.accenture.loja.produto.model.Produto;
import com.accenture.loja.produto.repository.ProdutoRepository;
import com.accenture.loja.shared.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProdutoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @InjectMocks
    private ProdutoService produtoService;

    @Test
    void deveBaixarEstoqueQuandoProdutoAtivoEQuantidadeValida() {
        Produto produto = new Produto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10);
        produto.setId(1L);
        produto.setAtivo(true);

        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        produtoService.baixarEstoque(1L, 3);

        assertEquals(7, produto.getEstoque());
    }

    @Test
    void naoDeveBaixarEstoqueQuandoProdutoInativo() {
        Produto produto = new Produto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10);
        produto.setId(1L);
        produto.setAtivo(false);

        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> produtoService.baixarEstoque(1L, 1)
        );

        assertEquals("Produto inativo não pode ser vendido", exception.getMessage());
        assertEquals(10, produto.getEstoque());
    }

    @Test
    void naoDeveBaixarEstoqueQuandoQuantidadeMaiorQueEstoque() {
        Produto produto = new Produto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 2);
        produto.setId(1L);
        produto.setAtivo(true);

        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> produtoService.baixarEstoque(1L, 3)
        );

        assertEquals("Estoque insuficiente", exception.getMessage());
        assertEquals(2, produto.getEstoque());
    }

    @Test
    void naoDeveBaixarEstoqueComQuantidadeZero() {
        Produto produto = new Produto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 10);
        produto.setId(1L);
        produto.setAtivo(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> produtoService.baixarEstoque(1L, 0)
        );

        assertEquals("Quantidade deve ser maior que zero", exception.getMessage());
        verify(produtoRepository, never()).findById(anyLong());
    }

    @Test
    void deveDevolverEstoque() {
        Produto produto = new Produto("SKU-001", "Notebook", "Eletrônicos", BigDecimal.valueOf(3000), 5);
        produto.setId(1L);
        produto.setAtivo(true);

        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        produtoService.devolverEstoque(1L, 4);

        assertEquals(9, produto.getEstoque());
    }

    @Test
    void naoDeveDevolverEstoqueComQuantidadeNegativa() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> produtoService.devolverEstoque(1L, -1)
        );

        assertEquals("Quantidade deve ser maior que zero", exception.getMessage());
        verify(produtoRepository, never()).findById(anyLong());
    }
}