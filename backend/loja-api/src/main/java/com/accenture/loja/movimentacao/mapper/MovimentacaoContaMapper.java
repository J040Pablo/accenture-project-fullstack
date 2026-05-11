package com.accenture.loja.movimentacao.mapper;

import com.accenture.loja.movimentacao.dto.MovimentacaoContaResponse;
import com.accenture.loja.movimentacao.model.MovimentacaoConta;
import org.springframework.stereotype.Component;

@Component
public class MovimentacaoContaMapper {

    public MovimentacaoContaResponse toResponse(MovimentacaoConta m) {
        return new MovimentacaoContaResponse(
                m.getId(),
                m.getConta().getId(),
                m.getConta().getNumeroConta(),
                m.getTipo(),
                m.getValor(),
                m.getDataHora(),
                m.getPedido() != null ? m.getPedido().getIdPedido() : null
        );
    }
}