package com.accenture.loja.conta.model;

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

    private String numeroConta;

    @Column(precision = 19, scale = 2)
    private BigDecimal saldo;
}