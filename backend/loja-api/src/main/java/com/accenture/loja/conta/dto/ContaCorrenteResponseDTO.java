package com.accenture.loja.conta.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContaCorrenteResponseDTO {

    private Long id;

    private String numeroConta;

    private BigDecimal saldo;
}