package com.accenture.loja.endereco.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnderecoResponseDTO {

    private Long id;

    private String cep;

    private String rua;

    private String numero;

    private String complemento;

    private String bairro;

    private String cidade;

    private String uf;
}