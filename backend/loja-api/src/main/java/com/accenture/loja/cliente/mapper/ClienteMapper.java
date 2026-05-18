package com.accenture.loja.cliente.mapper;

import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import org.springframework.stereotype.Component;

@Component
public class ClienteMapper {

    public ClienteResponseDTO toResponseDTO(Cliente cliente) {

        if (cliente == null) {
            return null;
        }

        return ClienteResponseDTO.builder()
                .id(cliente.getId())
                .nome(cliente.getNome())
                .cpf(cliente.getCpf())
                .email(cliente.getEmail())
                .endereco(toEnderecoDTO(cliente.getEndereco()))
                .contaCorrente(toContaDTO(cliente.getContaCorrente()))
                .build();
    }

    private EnderecoResponseDTO toEnderecoDTO(Endereco endereco) {

        if (endereco == null) {
            return null;
        }

        return EnderecoResponseDTO.builder()
                .id(endereco.getId())
                .cep(endereco.getCep())
                .rua(endereco.getRua())
                .numero(endereco.getNumero())
                .bairro(endereco.getBairro())
                .cidade(endereco.getCidade())
                .uf(endereco.getUf())
                .build();
    }

    private ContaCorrenteResponseDTO toContaDTO(ContaCorrente conta) {

        if (conta == null) {
            return null;
        }

        return ContaCorrenteResponseDTO.builder()
                .id(conta.getId())
                .numeroConta(conta.getNumeroConta())
                .saldo(conta.getSaldo())
                .tipoTitular(conta.getTipoTitular())
                .build();
    }
}