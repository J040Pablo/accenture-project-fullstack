package com.accenture.loja.cliente.dto;
import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteResponseDTO {

    private Long id;

    private String nome;

    private String cpf;

    private String email;

    private EnderecoResponseDTO endereco;

    private ContaCorrenteResponseDTO contaCorrente;
}