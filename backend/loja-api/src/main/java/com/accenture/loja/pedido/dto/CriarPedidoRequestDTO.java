package com.accenture.loja.pedido.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CriarPedidoRequestDTO {
    @NotNull(message = "O cliente é obrigatório")
    private Long clienteId;

    private BigDecimal desconto = BigDecimal.ZERO;

    @NotEmpty(message = "O pedido deve ter pelo menos um item")
    private List<ItemPedidoRequestDTO> itens;
}