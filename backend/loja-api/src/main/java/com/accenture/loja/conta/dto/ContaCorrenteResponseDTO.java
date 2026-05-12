package com.accenture.loja.conta.dto;

import com.accenture.loja.shared.enums.TipoTitularConta;
import lombok.*;

import java.math.BigDecimal;


@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class ContaCorrenteResponseDTO {

    private Long id;

    private String numeroConta;

    private BigDecimal saldo;

    private TipoTitularConta tipoTitular;
}