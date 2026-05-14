package com.accenture.loja.endereco.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnderecoRequestDTO {

    @NotBlank(message = "O CEP é obrigatório.")
    @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 dígitos.")
    private String cep;

    @NotBlank(message = "O número é obrigatório.")
    private String numero;

    private String complemento;
}