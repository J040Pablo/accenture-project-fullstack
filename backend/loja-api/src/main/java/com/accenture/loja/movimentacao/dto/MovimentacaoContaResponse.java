package com.accenture.loja.movimentacao.dto;

import com.accenture.loja.shared.enums.TipoMovimentacao;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovimentacaoContaResponse(
        Long id,
        Long contaId,
        String numeroConta,
        TipoMovimentacao tipo,
        BigDecimal valor,
        LocalDateTime dataHora,
        Long pedidoId
) {}