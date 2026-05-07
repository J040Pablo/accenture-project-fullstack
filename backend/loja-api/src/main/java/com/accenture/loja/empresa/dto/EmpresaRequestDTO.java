package com.accenture.loja.empresa.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmpresaRequestDTO(

        @NotBlank(message = "Razão social é obrigatória")
        String razaoSocial,

        @NotBlank(message = "Nome fantasia é obrigatório")
        String nomeFantasia,

        @NotBlank(message = "CNPJ é obrigatório")
        String cnpj,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        String telefone
) {
}