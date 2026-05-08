package com.accenture.loja.endereco.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnderecoRequestDTO {

    @NotBlank
    private String cep;

    @NotBlank
    private String numero;

    private String complemento;
}