package com.accenture.loja.endereco.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViaCepResponseDTO {

    private String cep;

    private String logradouro;

    private String bairro;

    private String localidade;

    private String uf;
}