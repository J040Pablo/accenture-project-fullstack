package com.accenture.loja.conta.service;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.mapper.ContaCorrenteMapper;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.RegraNegocioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContaCorrenteServiceTest {

    @Mock
    private ContaCorrenteRepository contaCorrenteRepository;

    @Mock
    private ContaCorrenteMapper contaCorrenteMapper;

    @InjectMocks
    private ContaCorrenteService contaCorrenteService;

    private ContaCorrente contaCliente;
    private ContaCorrente contaEmpresa;

    private ContaCorrenteResponseDTO contaClienteDTO;
    private ContaCorrenteResponseDTO contaEmpresaDTO;

    @BeforeEach
    void setup() {
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

        contaClienteDTO = ContaCorrenteResponseDTO.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(new BigDecimal("1000.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        contaEmpresaDTO = ContaCorrenteResponseDTO.builder()
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

        when(contaCorrenteMapper.toResponseDTO(contaCliente))
                .thenReturn(contaClienteDTO);

        when(contaCorrenteMapper.toResponseDTO(contaEmpresa))
                .thenReturn(contaEmpresaDTO);

        List<ContaCorrenteResponseDTO> resultado =
                contaCorrenteService.listarContas();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());

        assertEquals("12345", resultado.get(0).getNumeroConta());
        assertEquals("67890", resultado.get(1).getNumeroConta());

        verify(contaCorrenteRepository).findAll();
        verify(contaCorrenteMapper, times(2))
                .toResponseDTO(any(ContaCorrente.class));
    }

    @Test
    void deveRetornarListaVazia() {
        when(contaCorrenteRepository.findAll())
                .thenReturn(List.of());

        List<ContaCorrenteResponseDTO> resultado =
                contaCorrenteService.listarContas();

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());

        verify(contaCorrenteRepository).findAll();
        verify(contaCorrenteMapper, never())
                .toResponseDTO(any());
    }

    @Test
    void deveBuscarContaPorId() {
        when(contaCorrenteRepository.findById(1L))
                .thenReturn(Optional.of(contaCliente));

        when(contaCorrenteMapper.toResponseDTO(contaCliente))
                .thenReturn(contaClienteDTO);

        ContaCorrenteResponseDTO resultado =
                contaCorrenteService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("12345", resultado.getNumeroConta());

        verify(contaCorrenteRepository).findById(1L);
        verify(contaCorrenteMapper).toResponseDTO(contaCliente);
    }

    @Test
    void deveLancarExcecaoQuandoContaNaoEncontrada() {
        when(contaCorrenteRepository.findById(99L))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> contaCorrenteService.buscarPorId(99L)
        );

        assertEquals("Conta não encontrada", exception.getMessage());

        verify(contaCorrenteMapper, never())
                .toResponseDTO(any());
    }

    @Test
    void deveBuscarContaEmpresa() {
        when(contaCorrenteRepository.findByTipoTitular(
                TipoTitularConta.EMPRESA))
                .thenReturn(List.of(contaEmpresa));

        ContaCorrente resultado =
                contaCorrenteService.buscarContaEmpresa();

        assertNotNull(resultado);
        assertEquals(TipoTitularConta.EMPRESA,
                resultado.getTipoTitular());
    }

    @Test
    void deveLancarExcecaoQuandoContaEmpresaNaoEncontrada() {
        when(contaCorrenteRepository.findByTipoTitular(
                TipoTitularConta.EMPRESA))
                .thenReturn(List.of());

        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.buscarContaEmpresa()
        );

        assertEquals(
                "Conta da empresa não encontrada.",
                exception.getMessage()
        );
    }

    @Test
    void deveLancarExcecaoQuandoExistirMaisDeUmaContaEmpresa() {
        when(contaCorrenteRepository.findByTipoTitular(
                TipoTitularConta.EMPRESA))
                .thenReturn(List.of(contaEmpresa, contaEmpresa));

        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.buscarContaEmpresa()
        );

        assertEquals(
                "Há mais de uma conta da empresa cadastrada.",
                exception.getMessage()
        );
    }

    @Test
    void deveRetornarTrueQuandoExisteContaEmpresa() {
        when(contaCorrenteRepository.findByTipoTitular(
                TipoTitularConta.EMPRESA))
                .thenReturn(List.of(contaEmpresa));

        assertTrue(contaCorrenteService.existeContaEmpresa());
    }

    @Test
    void deveRetornarFalseQuandoNaoExisteContaEmpresa() {
        when(contaCorrenteRepository.findByTipoTitular(
                TipoTitularConta.EMPRESA))
                .thenReturn(List.of());

        assertFalse(contaCorrenteService.existeContaEmpresa());
    }

    @Test
    void deveTransferirComSucesso() {
        contaCorrenteService.transferir(
                contaCliente,
                contaEmpresa,
                new BigDecimal("100.00")
        );

        assertEquals(
                0,
                new BigDecimal("900.00")
                        .compareTo(contaCliente.getSaldo())
        );

        assertEquals(
                0,
                new BigDecimal("5100.00")
                        .compareTo(contaEmpresa.getSaldo())
        );

        verify(contaCorrenteRepository).save(contaCliente);
        verify(contaCorrenteRepository).save(contaEmpresa);
    }

    @Test
    void deveTransferirValorPequenoComSucesso() {
        contaCorrenteService.transferir(
                contaCliente,
                contaEmpresa,
                new BigDecimal("0.01")
        );

        assertEquals(
                0,
                new BigDecimal("999.99")
                        .compareTo(contaCliente.getSaldo())
        );

        assertEquals(
                0,
                new BigDecimal("5000.01")
                        .compareTo(contaEmpresa.getSaldo())
        );

        verify(contaCorrenteRepository).save(contaCliente);
        verify(contaCorrenteRepository).save(contaEmpresa);
    }

    @Test
    void deveLancarExcecaoQuandoContaOrigemForNula() {
        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.transferir(
                        null,
                        contaEmpresa,
                        new BigDecimal("100")
                )
        );

        assertEquals(
                "Conta de origem não encontrada.",
                exception.getMessage()
        );

        verify(contaCorrenteRepository, never())
                .save(any());
    }

    @Test
    void deveLancarExcecaoQuandoContaDestinoForNula() {
        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.transferir(
                        contaCliente,
                        null,
                        new BigDecimal("100")
                )
        );

        assertEquals(
                "Conta de destino não encontrada.",
                exception.getMessage()
        );

        verify(contaCorrenteRepository, never())
                .save(any());
    }

    @Test
    void deveLancarExcecaoQuandoValorForNulo() {
        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.transferir(
                        contaCliente,
                        contaEmpresa,
                        null
                )
        );

        assertEquals(
                "Valor deve ser maior que zero.",
                exception.getMessage()
        );

        verify(contaCorrenteRepository, never())
                .save(any());
    }

    @Test
    void deveLancarExcecaoQuandoValorForZero() {
        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.transferir(
                        contaCliente,
                        contaEmpresa,
                        BigDecimal.ZERO
                )
        );

        assertEquals(
                "Valor deve ser maior que zero.",
                exception.getMessage()
        );

        verify(contaCorrenteRepository, never())
                .save(any());
    }

    @Test
    void deveLancarExcecaoQuandoValorForNegativo() {
        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.transferir(
                        contaCliente,
                        contaEmpresa,
                        new BigDecimal("-1.00")
                )
        );

        assertEquals(
                "Valor deve ser maior que zero.",
                exception.getMessage()
        );

        verify(contaCorrenteRepository, never())
                .save(any());
    }

    @Test
    void deveLancarExcecaoQuandoSaldoForInsuficiente() {
        RegraNegocioException exception = assertThrows(
                RegraNegocioException.class,
                () -> contaCorrenteService.transferir(
                        contaCliente,
                        contaEmpresa,
                        new BigDecimal("99999")
                )
        );

        assertEquals(
                "Saldo insuficiente.",
                exception.getMessage()
        );

        verify(contaCorrenteRepository, never())
                .save(any());
    }

    @Test
    void deveSalvarConta() {
        when(contaCorrenteRepository.save(contaCliente))
                .thenReturn(contaCliente);

        ContaCorrente resultado =
                contaCorrenteService.salvar(contaCliente);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());

        verify(contaCorrenteRepository).save(contaCliente);
    }
}