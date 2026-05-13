package com.accenture.loja.conta.mapper;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class ContaCorrenteMapperTest {

    @Test
    void toResponseDTO_deveRetornarNullQuandoContaForNull() {
        ContaCorrenteResponseDTO response = ContaCorrenteMapper.toResponseDTO(null);

        assertNull(response);
    }

    @Test
    void toResponseDTO_deveMapearContaCorrenteParaResponseDTO() {
        ContaCorrente conta = ContaCorrente.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(new BigDecimal("100.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        ContaCorrenteResponseDTO response = ContaCorrenteMapper.toResponseDTO(conta);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("12345", response.getNumeroConta());
        assertEquals(new BigDecimal("100.00"), response.getSaldo());
        assertEquals(TipoTitularConta.CLIENTE, response.getTipoTitular());
    }
}
