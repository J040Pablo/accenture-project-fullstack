package com.accenture.loja.analiserisco.mapper;

import com.accenture.loja.analiserisco.dto.AnaliseRiscoPedidoResponseDTO;
import com.accenture.loja.analiserisco.model.AnaliseRiscoPedido;
import org.springframework.stereotype.Component;

@Component
public class AnaliseRiscoPedidoMapper {

    public AnaliseRiscoPedidoResponseDTO toResponseDTO(AnaliseRiscoPedido analise) {
        if (analise == null) {
            return null;
        }

        return AnaliseRiscoPedidoResponseDTO.builder()
                .id(analise.getId())
                .pedidoId(analise.getPedido() != null ? analise.getPedido().getIdPedido() : null)
            .clienteId(analise.getClienteId())
            .clienteNome(analise.getClienteNome())
            .valorTotal(analise.getValorTotal())
            .saldoCliente(analise.getSaldoCliente())
            .statusPedido(analise.getStatusPedido())
                .nivelRisco(analise.getNivelRisco())
            .score(analise.getScore())
            .motivos(analise.getMotivos())
                .motivo(analise.getMotivo())
            .recomendacao(analise.getRecomendacao())
            .aprovado(analise.getAprovado())
                .dataAnalise(analise.getDataAnalise())
                .build();
    }
}