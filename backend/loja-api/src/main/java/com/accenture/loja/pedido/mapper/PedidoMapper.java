package com.accenture.loja.pedido.mapper;

import com.accenture.loja.pedido.dto.PedidoResponseDTO;
import com.accenture.loja.pedido.model.Pedido;
import org.springframework.stereotype.Component;

@Component
public class PedidoMapper {

    public PedidoResponseDTO toResponseDTO(Pedido pedido) {
        if (pedido == null) return null;

        return PedidoResponseDTO.builder()
                .idPedido(pedido.getIdPedido())
                .clienteId(pedido.getCliente().getId())
                .status(pedido.getStatus().name())
                .dataCriacao(pedido.getDataCriacao())
                .dataReserva(pedido.getDataReserva())
                .dataPagamento(pedido.getDataPagamento())
                .dataCancelamento(pedido.getDataCancelamento())
                .motivoCancelamento(pedido.getMotivoCancelamento())
                .desconto(pedido.getDesconto())
                .totalBruto(pedido.getTotalBruto())
                .totalFinal(pedido.getTotalFinal())
                .build();
    }
}