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

    @NotBlank
    private String nome;

    @NotBlank
    private String cpf;

    @Email
    private String email;

    @Valid
    private EnderecoRequestDTO endereco;
}