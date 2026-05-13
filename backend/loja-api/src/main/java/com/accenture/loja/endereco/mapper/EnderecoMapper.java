package com.accenture.loja.endereco.mapper;

import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import org.springframework.stereotype.Component;

@Component
public class EnderecoMapper {

    public EnderecoResponseDTO toResponseDTO(Endereco endereco) {

        if (endereco == null) {
            return null;
        }

        return EnderecoResponseDTO.builder()
                .id(endereco.getId())
                .cep(endereco.getCep())
                .rua(endereco.getRua())
                .numero(endereco.getNumero())
                .complemento(endereco.getComplemento())
                .bairro(endereco.getBairro())
                .cidade(endereco.getCidade())
                .uf(endereco.getUf())
                .build();
    }
}