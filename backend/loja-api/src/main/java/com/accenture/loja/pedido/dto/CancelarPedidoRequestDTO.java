package com.accenture.loja.pedido.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelarPedidoRequestDTO {

    @NotBlank(message = "O motivo do cancelamento deve ser informado.")
    private String motivoCancelamento;
}