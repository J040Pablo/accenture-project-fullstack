package com.accenture.loja.movimentacao.mapper;

import com.accenture.loja.movimentacao.dto.MovimentacaoContaResponse;
import com.accenture.loja.movimentacao.model.MovimentacaoConta;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.springframework.stereotype.Component;

@Component
public class MovimentacaoContaMapper {

    public MovimentacaoContaResponse toResponse(MovimentacaoConta movimentacao) {
        if (movimentacao == null) {
            return null;
        }

        Long contaId = null;
        String numeroConta = null;
        TipoTitularConta tipoTitular = null;

        if (movimentacao.getConta() != null) {
            contaId = movimentacao.getConta().getId();
            numeroConta = movimentacao.getConta().getNumeroConta();
            tipoTitular = movimentacao.getConta().getTipoTitular();
        }

        Long pedidoId = movimentacao.getPedido() != null
                ? movimentacao.getPedido().getIdPedido()
                : null;

        return new MovimentacaoContaResponse(
                movimentacao.getId(),
                contaId,
                numeroConta,
                tipoTitular,
                movimentacao.getTipo(),
                movimentacao.getValor(),
                movimentacao.getDataHora(),
                movimentacao.getDescricao(),
                pedidoId
        );
    }
}