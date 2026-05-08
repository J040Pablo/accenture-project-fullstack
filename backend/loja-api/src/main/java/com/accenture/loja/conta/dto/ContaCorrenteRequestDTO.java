package com.accenture.loja.conta.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContaCorrenteRequestDTO {

    @NotBlank
    private String numeroConta;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal saldo;
}