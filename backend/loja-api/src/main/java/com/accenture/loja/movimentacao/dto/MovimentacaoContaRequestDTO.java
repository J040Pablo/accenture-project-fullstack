package com.accenture.loja.movimentacao.dto;

import com.accenture.loja.shared.enums.TipoMovimentacao;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimentacaoContaRequestDTO {
    private Long contaCorrenteId;
    private TipoMovimentacao tipoMovimentacao;
    private BigDecimal valor;
    private Long pedidoId;
}