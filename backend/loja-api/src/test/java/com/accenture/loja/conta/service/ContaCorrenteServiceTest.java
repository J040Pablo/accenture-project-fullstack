package com.accenture.loja.conta.service;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ContaCorrenteServiceTest {

    private ContaCorrenteRepository contaCorrenteRepository;

    private ContaCorrenteService contaCorrenteService;

    @BeforeEach
    void setup() {

        contaCorrenteRepository =
                Mockito.mock(ContaCorrenteRepository.class);

        contaCorrenteService =
                new ContaCorrenteService(contaCorrenteRepository);
    }

    @Test
    void deveListarContas() {

        ContaCorrente conta = ContaCorrente.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(BigDecimal.ZERO)
                .build();

        when(contaCorrenteRepository.findAll())
                .thenReturn(List.of(conta));

        List<ContaCorrenteResponseDTO> resultado =
                contaCorrenteService.listarContas();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(1L, resultado.get(0).getId());
        assertEquals("12345", resultado.get(0).getNumeroConta());
        assertEquals(BigDecimal.ZERO, resultado.get(0).getSaldo());

        verify(contaCorrenteRepository, times(1))
                .findAll();
    }

    @Test
    void deveBuscarContaPorId() {

        ContaCorrente conta = ContaCorrente.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(BigDecimal.ZERO)
                .build();

        when(contaCorrenteRepository.findById(1L))
                .thenReturn(Optional.of(conta));

        ContaCorrenteResponseDTO resultado =
                contaCorrenteService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("12345", resultado.getNumeroConta());
        assertEquals(BigDecimal.ZERO, resultado.getSaldo());

        verify(contaCorrenteRepository, times(1))
                .findById(1L);
    }

    @Test
    void deveLancarExcecaoQuandoContaNaoEncontrada() {

        when(contaCorrenteRepository.findById(1L))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> contaCorrenteService.buscarPorId(1L)
        );

        assertEquals(
                "Conta não encontrada",
                exception.getMessage()
        );

        verify(contaCorrenteRepository, times(1))
                .findById(1L);
    }
}