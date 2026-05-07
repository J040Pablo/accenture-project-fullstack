package com.accenture.loja.produto.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProdutoRequestDTO(

        @NotBlank(message = "SKU é obrigatório")
        String sku,

        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @NotBlank(message = "Categoria é obrigatória")
        String categoria,

        @NotNull(message = "Preço é obrigatório")
        @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
        BigDecimal preco,

        @NotNull(message = "Estoque é obrigatório")
        @Min(value = 0, message = "Estoque não pode ser negativo")
        Integer estoque
) {
}