package com.accenture.loja.cliente.dto;

import com.accenture.loja.endereco.dto.EnderecoRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteRequestDTO {

    @NotBlank(message = "O Nome é obrigatório.")
    private String nome;

    @NotBlank(message = "O CPF é obrigatório.")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos.")
    private String cpf;

    @NotBlank(message = "O Email é obrigatório.")
    @Email(message = "Email inválido.")
    private String email;

    @Valid
    @NotNull(message = "O Endereco é obrigatório.")
    private EnderecoRequestDTO endereco;
}