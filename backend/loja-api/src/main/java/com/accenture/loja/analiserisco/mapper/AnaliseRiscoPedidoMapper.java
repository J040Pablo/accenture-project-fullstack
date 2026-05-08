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
                .pedidoId(analise.getPedido() != null ? analise.getPedido().getId() : null)
                .nivelRisco(analise.getNivelRisco())
                .motivo(analise.getMotivo())
                .dataAnalise(analise.getDataAnalise())
                .build();
    }
}