package com.accenture.loja.produto.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record EstoqueRequestDTO(

        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade deve ser maior que zero")
        Integer quantidade
) {
}