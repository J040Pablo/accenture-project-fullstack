package com.accenture.loja.conta.controller;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.service.ContaCorrenteService;
import com.accenture.loja.movimentacao.service.MovimentacaoContaService;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ContaCorrenteControllerTest {

    @Mock
    private ContaCorrenteService contaCorrenteService;

    @Mock
    private MovimentacaoContaService movimentacaoContaService;

    @InjectMocks
    private ContaCorrenteController controller;

    private ContaCorrenteResponseDTO contaCliente;
    private ContaCorrenteResponseDTO contaEmpresa;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        contaCliente = ContaCorrenteResponseDTO.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(new BigDecimal("1000.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        contaEmpresa = ContaCorrenteResponseDTO.builder()
                .id(2L)
                .numeroConta("67890")
                .saldo(new BigDecimal("5000.00"))
                .tipoTitular(TipoTitularConta.EMPRESA)
                .build();
    }

    @Test
    void testListarContas_Sucesso() {
        List<ContaCorrenteResponseDTO> contas = Arrays.asList(contaCliente, contaEmpresa);
        when(contaCorrenteService.listarContas()).thenReturn(contas);

        List<ContaCorrenteResponseDTO> resultado = controller.listar();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals("12345", resultado.get(0).getNumeroConta());
        assertEquals("67890", resultado.get(1).getNumeroConta());
        verify(contaCorrenteService, times(1)).listarContas();
    }

    @Test
    void testListarContas_Vazio() {
        when(contaCorrenteService.listarContas()).thenReturn(Arrays.asList());

        List<ContaCorrenteResponseDTO> resultado = controller.listar();

        assertNotNull(resultado);
        assertEquals(0, resultado.size());
        verify(contaCorrenteService, times(1)).listarContas();
    }

    @Test
    void testListarContas_ValidaTipoTitular() {
        List<ContaCorrenteResponseDTO> contas = Arrays.asList(contaCliente, contaEmpresa);
        when(contaCorrenteService.listarContas()).thenReturn(contas);

        List<ContaCorrenteResponseDTO> resultado = controller.listar();

        assertEquals(TipoTitularConta.CLIENTE, resultado.get(0).getTipoTitular());
        assertEquals(TipoTitularConta.EMPRESA, resultado.get(1).getTipoTitular());
    }

    @Test
    void testBuscarContaPorId_Sucesso() {
        when(contaCorrenteService.buscarPorId(1L)).thenReturn(contaCliente);

        ContaCorrenteResponseDTO resultado = controller.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("12345", resultado.getNumeroConta());
        assertEquals(new BigDecimal("1000.00"), resultado.getSaldo());
        assertEquals(TipoTitularConta.CLIENTE, resultado.getTipoTitular());
        verify(contaCorrenteService, times(1)).buscarPorId(1L);
    }

    @Test
    void testBuscarContaPorId_NaoEncontrada() {
        when(contaCorrenteService.buscarPorId(999L))
                .thenThrow(new com.accenture.loja.shared.exception.BusinessException("Conta não encontrada"));

        assertThrows(com.accenture.loja.shared.exception.BusinessException.class, () ->
            controller.buscarPorId(999L)
        );
        verify(contaCorrenteService, times(1)).buscarPorId(999L);
    }

    @Test
    void testBuscarContaPorId_Empresa() {
        when(contaCorrenteService.buscarPorId(2L)).thenReturn(contaEmpresa);

        ContaCorrenteResponseDTO resultado = controller.buscarPorId(2L);

        assertNotNull(resultado);
        assertEquals(2L, resultado.getId());
        assertEquals("67890", resultado.getNumeroConta());
        assertEquals(new BigDecimal("5000.00"), resultado.getSaldo());
        assertEquals(TipoTitularConta.EMPRESA, resultado.getTipoTitular());
        verify(contaCorrenteService, times(1)).buscarPorId(2L);
    }

    @Test
    void testBuscarContaPorId_ValidaTodosCampos() {
        when(contaCorrenteService.buscarPorId(1L)).thenReturn(contaCliente);

        ContaCorrenteResponseDTO resultado = controller.buscarPorId(1L);

        assertNotNull(resultado);
        assertNotNull(resultado.getId());
        assertNotNull(resultado.getNumeroConta());
        assertNotNull(resultado.getSaldo());
        assertNotNull(resultado.getTipoTitular());
    }
}
