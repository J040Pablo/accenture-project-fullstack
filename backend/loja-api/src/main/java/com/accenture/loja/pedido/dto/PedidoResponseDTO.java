package com.accenture.loja.pedido.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponseDTO {

    private Long idPedido;
    private Long clienteId;
    private String status;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataReserva;
    private BigDecimal desconto;
    private BigDecimal totalBruto;
    private BigDecimal totalFinal;
}