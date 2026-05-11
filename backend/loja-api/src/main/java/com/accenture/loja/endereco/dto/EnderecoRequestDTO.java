package com.accenture.loja.endereco.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnderecoRequestDTO {

    @NotBlank(message = "O CEP é obrigatório.")
    private String cep;

    @NotBlank(message = "O número é obrigatório.")
    private String numero;

    private String complemento;
}