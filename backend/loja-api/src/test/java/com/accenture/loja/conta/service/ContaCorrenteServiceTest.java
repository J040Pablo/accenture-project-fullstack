package com.accenture.loja.conta.service;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.RegraNegocioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ContaCorrenteServiceTest {

    private ContaCorrenteRepository contaCorrenteRepository;
    private ContaCorrenteService contaCorrenteService;

    private ContaCorrente contaCliente;
    private ContaCorrente contaEmpresa;

    @BeforeEach
    void setup() {
        contaCorrenteRepository = Mockito.mock(ContaCorrenteRepository.class);
        contaCorrenteService = new ContaCorrenteService(contaCorrenteRepository);

        contaCliente = ContaCorrente.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(new BigDecimal("1000.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        contaEmpresa = ContaCorrente.builder()
                .id(2L)
                .numeroConta("67890")
                .saldo(new BigDecimal("5000.00"))
                .tipoTitular(TipoTitularConta.EMPRESA)
                .build();
    }

    @Test
    void deveListarContas() {
        when(contaCorrenteRepository.findAll())
                .thenReturn(List.of(contaCliente, contaEmpresa));

        List<ContaCorrenteResponseDTO> resultado =
                contaCorrenteService.listarContas();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());

        assertEquals(1L, resultado.get(0).getId());
        assertEquals("12345", resultado.get(0).getNumeroConta());
        assertEquals(0, new BigDecimal("1000.00").compareTo(resultado.get(0).getSaldo()));
        assertEquals(TipoTitularConta.CLIENTE, resultado.get(0).getTipoTitular());

        assertEquals(2L, resultado.get(1).getId());
        assertEquals("67890", resultado.get(1).getNumeroConta());
        assertEquals(0, new BigDecimal("5000.00").compareTo(resultado.get(1).getSaldo()));
        assertEquals(TipoTitularConta.EMPRESA, resultado.get(1).getTipoTitular());

        verify(contaCorrenteRepository, times(1)).findAll();
    }

    @Test
    void deveListarContasVazia() {
        when(contaCorrenteRepository.findAll())
                .thenReturn(List.of());

        List<ContaCorrenteResponseDTO> resultado =
                contaCorrenteService.listarContas();

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());

        verify(contaCorrenteRepository, times(1)).findAll();
    }

    @Test
    void deveBuscarContaClientePorId() {
        when(contaCorrenteRepository.findById(1L))
                .thenReturn(Optional.of(contaCliente));

        ContaCorrenteResponseDTO resultado =
                contaCorrenteService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("12345", resultado.getNumeroConta());
        assertEquals(0, new BigDecimal("1000.00").compareTo(resultado.getSaldo()));
        assertEquals(TipoTitularConta.CLIENTE, resultado.getTipoTitular());

        verify(contaCorrenteRepository, times(1)).findById(1L);
    }

    @Test
    void deveBuscarContaEmpresaPorId() {
        when(contaCorrenteRepository.findById(2L))
                .thenReturn(Optional.of(contaEmpresa));

        ContaCorrenteResponseDTO resultado =
                contaCorrenteService.buscarPorId(2L);

        assertNotNull(resultado);
        assertEquals(2L, resultado.getId());
        assertEquals("67890", resultado.getNumeroConta());
        assertEquals(0, new BigDecimal("5000.00").compareTo(resultado.getSaldo()));
        assertEquals(TipoTitularConta.EMPRESA, resultado.getTipoTitular());

        verify(contaCorrenteRepository, times(1)).findById(2L);
    }

    @Test
    void deveLancarExcecaoQuandoContaNaoEncontrada() {
        when(contaCorrenteRepository.findById(999L))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> contaCorrenteService.buscarPorId(999L)
        );

        assertEquals("Conta não encontrada", exception.getMessage());

        verify(contaCorrenteRepository, times(1)).findById(999L);
    }

    @Test
    void deveBuscarContaEmpresa() {
        when(contaCorrenteRepository.findByTipoTitular(TipoTitularConta.EMPRESA))
                .thenReturn(Optional.of(contaEmpresa));

        ContaCorrente resultado = contaCorrenteService.buscarContaEmpresa();

        assertNotNull(resultado);
        assertEquals(2L, resultado.getId());
        assertEquals("67890", resultado.getNumeroConta());
        assertEquals(TipoTitularConta.EMPRESA, resultado.getTipoTitular());

        verify(contaCorrenteRepository, times(1))
                .findByTipoTitular(TipoTitularConta.EMPRESA);
    }

    @Test
    void deveLancarExcecaoQuandoContaEmpresaNaoEncontrada() {
        when(contaCorrenteRepository.findByTipoTitular(TipoTitularConta.EMPRESA))
                .thenReturn(Optional.empty());

        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.buscarContaEmpresa()
        );

        assertEquals("Conta da empresa não encontrada.", exception.getMessage());

        verify(contaCorrenteRepository, times(1))
                .findByTipoTitular(TipoTitularConta.EMPRESA);
    }

    @Test
    void deveTransferirComSucesso() {
        contaCorrenteService.transferir(
                contaCliente,
                contaEmpresa,
                new BigDecimal("100.00")
        );

        assertEquals(0, new BigDecimal("900.00").compareTo(contaCliente.getSaldo()));
        assertEquals(0, new BigDecimal("5100.00").compareTo(contaEmpresa.getSaldo()));

        verify(contaCorrenteRepository, times(1)).save(contaCliente);
        verify(contaCorrenteRepository, times(1)).save(contaEmpresa);
    }

    @Test
    void deveLancarExcecaoAoTransferirComSaldoInsuficiente() {
        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.transferir(
                        contaCliente,
                        contaEmpresa,
                        new BigDecimal("2000.00")
                )
        );

        assertEquals("Saldo insuficiente.", exception.getMessage());

        verify(contaCorrenteRepository, never()).save(any(ContaCorrente.class));
    }

    @Test
        void deveLancarExcecaoAoTransferirComContaOrigemNula() {
                RegraNegocioException exception = assertThrows(
            RegraNegocioException.class,
                        () -> contaCorrenteService.transferir(
                         null,
                                contaEmpresa,
                                new BigDecimal("100.00")
                )
        );

                assertEquals("Conta de origem não encontrada.", exception.getMessage());

                verify(contaCorrenteRepository, never()).save(any(ContaCorrente.class));
        }

   @Test
        void deveLancarExcecaoAoTransferirComContaDestinoNula() {
                RegraNegocioException exception = assertThrows(
            RegraNegocioException.class,
                         () -> contaCorrenteService.transferir(
                                 contaCliente,
                        null,
                                 new BigDecimal("100.00")
            )
        );

                assertEquals("Conta de destino não encontrada.", exception.getMessage());

                verify(contaCorrenteRepository, never()).save(any(ContaCorrente.class));
        }

    @Test
    void deveLancarExcecaoAoTransferirComValorZero() {
        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.transferir(
                        contaCliente,
                        contaEmpresa,
                        BigDecimal.ZERO
                )
        );

        assertEquals("Valor deve ser maior que zero.", exception.getMessage());

        verify(contaCorrenteRepository, never()).save(any(ContaCorrente.class));
    }

    @Test
    void deveLancarExcecaoAoTransferirComValorNegativo() {
        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.transferir(
                        contaCliente,
                        contaEmpresa,
                        new BigDecimal("-100.00")
                )
        );

        assertEquals("Valor deve ser maior que zero.", exception.getMessage());

        verify(contaCorrenteRepository, never()).save(any(ContaCorrente.class));
    }

    @Test
    void deveSalvarConta() {
        when(contaCorrenteRepository.save(any(ContaCorrente.class)))
                .thenReturn(contaCliente);

        ContaCorrente resultado = contaCorrenteService.salvar(contaCliente);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("12345", resultado.getNumeroConta());
        assertEquals(TipoTitularConta.CLIENTE, resultado.getTipoTitular());

        verify(contaCorrenteRepository, times(1)).save(contaCliente);
    }
}