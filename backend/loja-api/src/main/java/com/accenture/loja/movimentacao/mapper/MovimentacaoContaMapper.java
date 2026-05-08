package com.accenture.loja.movimentacao.mapper;

import com.accenture.loja.movimentacao.dto.MovimentacaoContaRequestDTO;
import com.accenture.loja.movimentacao.dto.MovimentacaoContaResponseDTO;
import com.accenture.loja.movimentacao.model.MovimentacaoConta;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.pedido.model.Pedido;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class MovimentacaoContaMapper {

    public MovimentacaoContaResponseDTO toResponseDTO(MovimentacaoConta movimentacao) {
        if (movimentacao == null) {
            return null;
        }

        return MovimentacaoContaResponseDTO.builder()
                .id(movimentacao.getId())
                .contaCorrenteId(movimentacao.getContaCorrente() != null ? movimentacao.getContaCorrente().getId() : null)
                .tipoMovimentacao(movimentacao.getTipoMovimentacao())
                .valor(movimentacao.getValor())
                .dataHora(movimentacao.getDataHora())
                .pedidoId(movimentacao.getPedido() != null ? movimentacao.getPedido().getId() : null)
                .build();
    }

    public MovimentacaoConta toEntity(MovimentacaoContaRequestDTO requestDTO, ContaCorrente conta, Pedido pedido) {
        if (requestDTO == null) {
            return null;
        }

        return MovimentacaoConta.builder()
                .contaCorrente(conta)
                .tipoMovimentacao(requestDTO.getTipoMovimentacao())
                .valor(requestDTO.getValor())
                .pedido(pedido)
                .dataHora(LocalDateTime.now())
                .build();
    }
}