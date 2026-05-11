package com.accenture.loja.endereco.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "enderecos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String cep;

    private String rua;

    @Column(nullable = false)
    private String numero;

    private String complemento;

    private String bairro;

    private String cidade;

    private String uf;
}