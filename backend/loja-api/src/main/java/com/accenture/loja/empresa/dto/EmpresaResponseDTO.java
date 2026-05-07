package com.accenture.loja.empresa.dto;

public record EmpresaResponseDTO(
        Long id,
        String razaoSocial,
        String nomeFantasia,
        String cnpj,
        String email,
        String telefone,
        Boolean ativo
) {
}