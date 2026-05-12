package com.accenture.loja.conta.model;

import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.RegraNegocioException;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "contas_correntes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContaCorrente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String numeroConta;

    @Column(nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal saldo = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoTitularConta tipoTitular;

    public void debitar(BigDecimal valor) {
        validarValorPositivo(valor);

        if (saldo.compareTo(valor) < 0) {
            throw new RegraNegocioException("Saldo insuficiente.");
        }

        saldo = saldo.subtract(valor);
    }

    public void creditar(BigDecimal valor) {
        validarValorPositivo(valor);
        saldo = saldo.add(valor);
    }

    private void validarValorPositivo(BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("Valor deve ser maior que zero.");
        }
    }

    @PrePersist
    @PreUpdate
    private void validarContaCorrente() {
        if (saldo == null) {
            saldo = BigDecimal.ZERO;
        }

        if (saldo.compareTo(BigDecimal.ZERO) < 0) {
            throw new RegraNegocioException("Saldo da conta não pode ser negativo.");
        }

        if (tipoTitular == null) {
            throw new RegraNegocioException("Tipo do titular da conta é obrigatório.");
        }
    }
}