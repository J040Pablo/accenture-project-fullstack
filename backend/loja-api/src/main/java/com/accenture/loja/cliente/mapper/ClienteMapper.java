package com.accenture.loja.cliente.mapper;

import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class ClienteMapper {

    public ClienteResponseDTO toResponseDTO(Cliente cliente) {
        if (cliente == null) return null;

        return ClienteResponseDTO.builder()
                .id(cliente.getId())
                .nome(cliente.getNome())
                .cpf(cliente.getCpf())
                .email(cliente.getEmail())
                .endereco(
                        EnderecoResponseDTO.builder()
                                .id(cliente.getEndereco().getId())
                                .cep(cliente.getEndereco().getCep())
                                .rua(cliente.getEndereco().getRua())
                                .numero(cliente.getEndereco().getNumero())
                                .bairro(cliente.getEndereco().getBairro())
                                .cidade(cliente.getEndereco().getCidade())
                                .uf(cliente.getEndereco().getUf())
                                .build()
                )
                .contaCorrente(
                        ContaCorrenteResponseDTO.builder()
                                .id(cliente.getContaCorrente().getId())
                                .numeroConta(cliente.getContaCorrente().getNumeroConta())
                                .saldo(cliente.getContaCorrente().getSaldo())
                                .build()
                )
                .build();
    }
}