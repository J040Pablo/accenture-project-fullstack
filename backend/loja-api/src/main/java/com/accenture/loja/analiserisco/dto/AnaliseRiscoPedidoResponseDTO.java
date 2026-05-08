package com.accenture.loja.analiserisco.dto;

import com.accenture.loja.shared.enums.NivelRisco;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnaliseRiscoPedidoResponseDTO {
    private Long id;
    private Long pedidoId;
    private NivelRisco nivelRisco;
    private String motivo;
    private LocalDateTime dataAnalise;
}