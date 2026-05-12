package com.accenture.loja.movimentacao.controller;

import com.accenture.loja.movimentacao.dto.MovimentacaoContaResponse;
import com.accenture.loja.movimentacao.service.MovimentacaoContaService;
import com.accenture.loja.shared.enums.TipoMovimentacao;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MovimentacaoContaControllerTest {

    @Mock
    private MovimentacaoContaService movimentacaoContaService;

    @InjectMocks
    private MovimentacaoContaController controller;

    private MovimentacaoContaResponse movPagamento;
    private MovimentacaoContaResponse movRecebimento;
    private MovimentacaoContaResponse movEstornoCliente;
    private MovimentacaoContaResponse movEstornoEmpresa;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        LocalDateTime agora = LocalDateTime.now();

        movPagamento = new MovimentacaoContaResponse(
                1L,
                1L,
                "12345",
                TipoTitularConta.CLIENTE,
                TipoMovimentacao.PAGAMENTO_PEDIDO,
                new BigDecimal("500.00"),
                agora,
                "Pagamento do pedido #1",
                1L
        );

        movRecebimento = new MovimentacaoContaResponse(
                2L,
                2L,
                "67890",
                TipoTitularConta.EMPRESA,
                TipoMovimentacao.RECEBIMENTO_EMPRESA,
                new BigDecimal("500.00"),
                agora.plusMinutes(1),
                "Recebimento do pedido #1",
                1L
        );

        movEstornoCliente = new MovimentacaoContaResponse(
                3L,
                1L,
                "12345",
                TipoTitularConta.CLIENTE,
                TipoMovimentacao.ESTORNO_CLIENTE,
                new BigDecimal("500.00"),
                agora.plusHours(1),
                "Estorno ao cliente do pedido #1",
                1L
        );

        movEstornoEmpresa = new MovimentacaoContaResponse(
                4L,
                2L,
                "67890",
                TipoTitularConta.EMPRESA,
                TipoMovimentacao.ESTORNO_EMPRESA,
                new BigDecimal("500.00"),
                agora.plusHours(1).plusMinutes(1),
                "Estorno pago pela empresa do pedido #1",
                1L
        );
    }

    @Test
    void testListarTodasAsMovimentacoes_Sucesso() {
        List<MovimentacaoContaResponse> movimentacoes = Arrays.asList(
                movPagamento,
                movRecebimento,
                movEstornoCliente,
                movEstornoEmpresa
        );
        when(movimentacaoContaService.listarTodas()).thenReturn(movimentacoes);

        List<MovimentacaoContaResponse> resultado = controller.listarTodas().getBody();

        assertNotNull(resultado);
        assertEquals(4, resultado.size());
        assertEquals(1L, resultado.get(0).id());
        assertEquals("12345", resultado.get(0).numeroConta());
        assertEquals(TipoTitularConta.CLIENTE, resultado.get(0).tipoTitular());
        assertEquals(TipoMovimentacao.PAGAMENTO_PEDIDO, resultado.get(0).tipo());
        assertEquals(new BigDecimal("500.00"), resultado.get(0).valor());
        assertEquals("Pagamento do pedido #1", resultado.get(0).descricao());
        assertEquals(1L, resultado.get(0).pedidoId());

        verify(movimentacaoContaService, times(1)).listarTodas();
    }

    @Test
    void testListarTodasAsMovimentacoes_Vazio() {
        when(movimentacaoContaService.listarTodas()).thenReturn(Arrays.asList());

        List<MovimentacaoContaResponse> resultado = controller.listarTodas().getBody();

        assertNotNull(resultado);
        assertEquals(0, resultado.size());
        verify(movimentacaoContaService, times(1)).listarTodas();
    }

    @Test
    void testListarTodasAsMovimentacoes_ValidaTodosCampos() {
        List<MovimentacaoContaResponse> movimentacoes = Arrays.asList(movPagamento);
        when(movimentacaoContaService.listarTodas()).thenReturn(movimentacoes);

        List<MovimentacaoContaResponse> resultado = controller.listarTodas().getBody();

        assertNotNull(resultado.get(0).id());
        assertNotNull(resultado.get(0).contaId());
        assertNotNull(resultado.get(0).numeroConta());
        assertNotNull(resultado.get(0).tipoTitular());
        assertNotNull(resultado.get(0).tipo());
        assertNotNull(resultado.get(0).valor());
        assertNotNull(resultado.get(0).dataHora());
        assertNotNull(resultado.get(0).descricao());
        assertNotNull(resultado.get(0).pedidoId());
    }

    @Test
    void testListarTodasAsMovimentacoes_MultiplosTipos() {
        List<MovimentacaoContaResponse> movimentacoes = Arrays.asList(
                movPagamento,
                movRecebimento,
                movEstornoCliente,
                movEstornoEmpresa
        );
        when(movimentacaoContaService.listarTodas()).thenReturn(movimentacoes);

        List<MovimentacaoContaResponse> resultado = controller.listarTodas().getBody();

        assertEquals(TipoMovimentacao.PAGAMENTO_PEDIDO, resultado.get(0).tipo());
        assertEquals(TipoMovimentacao.RECEBIMENTO_EMPRESA, resultado.get(1).tipo());
        assertEquals(TipoMovimentacao.ESTORNO_CLIENTE, resultado.get(2).tipo());
        assertEquals(TipoMovimentacao.ESTORNO_EMPRESA, resultado.get(3).tipo());
    }

    @Test
    void testListarTodasAsMovimentacoes_ClienteEEmpresa() {
        List<MovimentacaoContaResponse> movimentacoes = Arrays.asList(
                movPagamento,
                movRecebimento
        );
        when(movimentacaoContaService.listarTodas()).thenReturn(movimentacoes);

        List<MovimentacaoContaResponse> resultado = controller.listarTodas().getBody();

        assertEquals(TipoTitularConta.CLIENTE, resultado.get(0).tipoTitular());
        assertEquals(TipoTitularConta.EMPRESA, resultado.get(1).tipoTitular());
    }

    @Test
    void testListarTodasAsMovimentacoes_Valores() {
        List<MovimentacaoContaResponse> movimentacoes = Arrays.asList(movPagamento);
        when(movimentacaoContaService.listarTodas()).thenReturn(movimentacoes);

        List<MovimentacaoContaResponse> resultado = controller.listarTodas().getBody();

        assertEquals(new BigDecimal("500.00"), resultado.get(0).valor());
    }

    @Test
    void testListarTodasAsMovimentacoes_Descricoes() {
        List<MovimentacaoContaResponse> movimentacoes = Arrays.asList(movPagamento);
        when(movimentacaoContaService.listarTodas()).thenReturn(movimentacoes);

        List<MovimentacaoContaResponse> resultado = controller.listarTodas().getBody();

        assertTrue(resultado.get(0).descricao().contains("Pagamento"));
    }

    @Test
    void testListarTodasAsMovimentacoes_NumeroConta() {
        List<MovimentacaoContaResponse> movimentacoes = Arrays.asList(
                movPagamento,
                movRecebimento
        );
        when(movimentacaoContaService.listarTodas()).thenReturn(movimentacoes);

        List<MovimentacaoContaResponse> resultado = controller.listarTodas().getBody();

        assertEquals("12345", resultado.get(0).numeroConta());
        assertEquals("67890", resultado.get(1).numeroConta());
    }

    @Test
    void testListarTodasAsMovimentacoes_PedidoId() {
        List<MovimentacaoContaResponse> movimentacoes = Arrays.asList(movPagamento);
        when(movimentacaoContaService.listarTodas()).thenReturn(movimentacoes);

        List<MovimentacaoContaResponse> resultado = controller.listarTodas().getBody();

        assertEquals(1L, resultado.get(0).pedidoId());
    }

    @Test
    void testListarTodasAsMovimentacoes_ContaId() {
        List<MovimentacaoContaResponse> movimentacoes = Arrays.asList(movPagamento, movRecebimento);
        when(movimentacaoContaService.listarTodas()).thenReturn(movimentacoes);

        List<MovimentacaoContaResponse> resultado = controller.listarTodas().getBody();

        assertEquals(1L, resultado.get(0).contaId());
        assertEquals(2L, resultado.get(1).contaId());
    }

    @Test
    void testListarPorConta_Sucesso() {
        List<MovimentacaoContaResponse> movimentacoes = Arrays.asList(movPagamento, movEstornoCliente);
        when(movimentacaoContaService.listarPorConta(1L)).thenReturn(movimentacoes);

        List<MovimentacaoContaResponse> resultado = controller.listarPorConta(1L).getBody();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertTrue(resultado.stream().allMatch(m -> m.contaId() == 1L));
        verify(movimentacaoContaService, times(1)).listarPorConta(1L);
    }

    @Test
    void testListarPorConta_Vazio() {
        when(movimentacaoContaService.listarPorConta(999L)).thenReturn(Arrays.asList());

        List<MovimentacaoContaResponse> resultado = controller.listarPorConta(999L).getBody();

        assertNotNull(resultado);
        assertEquals(0, resultado.size());
        verify(movimentacaoContaService, times(1)).listarPorConta(999L);
    }
}
