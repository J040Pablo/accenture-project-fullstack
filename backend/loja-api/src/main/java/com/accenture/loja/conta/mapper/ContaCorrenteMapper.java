package com.accenture.loja.conta.mapper;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.model.ContaCorrente;
import org.springframework.stereotype.Component;

@Component
public class ContaCorrenteMapper {

    public ContaCorrenteResponseDTO toResponseDTO(ContaCorrente conta) {

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