package com.accenture.loja.conta.mapper;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class ContaCorrenteMapperTest {

    private final ContaCorrenteMapper mapper = new ContaCorrenteMapper();

    @Test
    void deveRetornarNullQuandoContaForNull() {
        ContaCorrenteResponseDTO dto = mapper.toResponseDTO(null);

        assertNull(dto);
    }

    @Test
    void deveConverterContaClienteParaDTO() {
        ContaCorrente conta = ContaCorrente.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(new BigDecimal("1000.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        ContaCorrenteResponseDTO dto = mapper.toResponseDTO(conta);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("12345", dto.getNumeroConta());
        assertEquals(0, new BigDecimal("1000.00").compareTo(dto.getSaldo()));
        assertEquals(TipoTitularConta.CLIENTE, dto.getTipoTitular());
    }

    @Test
    void deveConverterContaEmpresaParaDTO() {
        ContaCorrente conta = ContaCorrente.builder()
                .id(2L)
                .numeroConta("99999")
                .saldo(new BigDecimal("5000.00"))
                .tipoTitular(TipoTitularConta.EMPRESA)
                .build();

        ContaCorrenteResponseDTO dto = mapper.toResponseDTO(conta);

        assertNotNull(dto);
        assertEquals(2L, dto.getId());
        assertEquals("99999", dto.getNumeroConta());
        assertEquals(0, new BigDecimal("5000.00").compareTo(dto.getSaldo()));
        assertEquals(TipoTitularConta.EMPRESA, dto.getTipoTitular());
    }
}