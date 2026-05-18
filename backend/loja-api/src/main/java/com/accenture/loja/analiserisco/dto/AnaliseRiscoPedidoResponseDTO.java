package com.accenture.loja.analiserisco.dto;

import com.accenture.loja.shared.enums.NivelRisco;
import com.accenture.loja.shared.enums.StatusPedido;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnaliseRiscoPedidoResponseDTO {
    private Long id;
    private Long pedidoId;
    private Long clienteId;
    private String clienteNome;
    private BigDecimal valorTotal;
    private BigDecimal saldoCliente;
    private StatusPedido statusPedido;
    private NivelRisco nivelRisco;
    private Integer score;
    private List<String> motivos;
    private String motivo;
    private String recomendacao;
    private Boolean aprovado;
    private LocalDateTime dataAnalise;
}