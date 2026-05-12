package com.accenture.loja.movimentacao.dto;

import com.accenture.loja.shared.enums.TipoMovimentacao;
import com.accenture.loja.shared.enums.TipoTitularConta;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovimentacaoContaResponse(
        Long id,
        Long contaId,
        String numeroConta,
        TipoTitularConta tipoTitular,
        TipoMovimentacao tipo,
        BigDecimal valor,
        LocalDateTime dataHora,
        String descricao,
        Long pedidoId
) {
}