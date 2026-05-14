package com.accenture.loja.pedido.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ItemPedidoRequestDTO {
    @NotNull(message = "O produto é obrigatório")
    private Long produtoId;

    @Min(value = 1, message = "A quantidade mínima permitida é 1")
    private Integer quantidade;
}