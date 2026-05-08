package com.accenture.loja.cliente.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_cliente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String cpf;

    // Você pode adicionar outros campos conforme a necessidade do projeto,
    // como telefone, endereço, etc.
}