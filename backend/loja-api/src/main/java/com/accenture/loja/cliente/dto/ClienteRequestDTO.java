package com.accenture.loja.cliente.dto;
import com.accenture.loja.endereco.dto.EnderecoRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
    private String cpf;

    @Email(message = "O Email é obrigatório.")
    private String email;

    @Valid
    private EnderecoRequestDTO endereco;
}