package com.accenture.loja.produto.dto;

import java.math.BigDecimal;

public record ProdutoResponseDTO(
        Long id,
        String sku,
        String nome,
        String categoria,
        BigDecimal preco,
        Integer estoque,
        Boolean ativo
) {
}