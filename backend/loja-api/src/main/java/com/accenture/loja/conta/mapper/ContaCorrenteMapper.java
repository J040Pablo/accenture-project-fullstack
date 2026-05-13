package com.accenture.loja.conta.mapper;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.model.ContaCorrente;

public class ContaCorrenteMapper {

    private ContaCorrenteMapper() {
    }

    public static ContaCorrenteResponseDTO toResponseDTO(ContaCorrente conta) {
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