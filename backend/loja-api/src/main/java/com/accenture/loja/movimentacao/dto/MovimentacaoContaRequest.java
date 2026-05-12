package com.accenture.loja.movimentacao.dto;

import com.accenture.loja.shared.enums.TipoMovimentacao;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record MovimentacaoContaRequest(

        @NotNull(message = "O ID da conta é obrigatório")
        Long contaId,

        @NotNull(message = "O tipo de movimentação é obrigatório")
        TipoMovimentacao tipo,

        @NotNull(message = "O valor é obrigatório")
        @Positive(message = "O valor deve ser positivo")
        BigDecimal valor,

        Long pedidoId // opcional
) {}