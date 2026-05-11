package com.accenture.loja.conta.dto;

import lombok.*;

import java.math.BigDecimal;


@Builder
public class ContaCorrenteResponseDTO {

    private Long id;

    private String numeroConta;

    private BigDecimal saldo;
}