package com.accenture.loja.pedido.service;

import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.service.ContaCorrenteService;
import com.accenture.loja.movimentacao.service.MovimentacaoContaService;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.repository.PedidoRepository;
import com.accenture.loja.produto.repository.ProdutoRepository;
import com.accenture.loja.shared.enums.StatusPedido;
import com.accenture.loja.shared.enums.TipoMovimentacao;
import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.RegraNegocioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PedidoServiceFinancialTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private ContaCorrenteService contaCorrenteService;

    @Mock
    private MovimentacaoContaService movimentacaoContaService;

    @InjectMocks
    private PedidoService service;

    private Pedido pedido;
    private Cliente cliente;
    private ContaCorrente contaCliente;
    private ContaCorrente contaEmpresa;

    private static final String MOTIVO_CANCELAMENTO = "Cliente desistiu da compra";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

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

        cliente = Cliente.builder()
                .id(1L)
                .nome("João Silva")
                .cpf("123.456.789-00")
                .email("joao@example.com")
                .contaCorrente(contaCliente)
                .build();

        pedido = Pedido.builder()
                .idPedido(1L)
                .cliente(cliente)
                .status(StatusPedido.RESERVADO)
                .totalFinal(new BigDecimal("500.00"))
                .dataCriacao(LocalDateTime.now())
                .build();
    }

    @Test
    void testPagarPedido_Sucesso() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedido);

        Pedido resultado = service.pagarPedido(1L);

        assertNotNull(resultado);
        assertEquals(StatusPedido.PAGO, resultado.getStatus());
        assertNotNull(resultado.getDataPagamento());

        verify(contaCorrenteService, times(1))
                .transferir(contaCliente, contaEmpresa, new BigDecimal("500.00"));

        verify(movimentacaoContaService, times(1)).registrar(
                eq(contaCliente),
                eq(TipoMovimentacao.PAGAMENTO_PEDIDO),
                eq(new BigDecimal("500.00")),
                eq(pedido)
        );

        verify(movimentacaoContaService, times(1)).registrar(
                eq(contaEmpresa),
                eq(TipoMovimentacao.RECEBIMENTO_EMPRESA),
                eq(new BigDecimal("500.00")),
                eq(pedido)
        );

        verify(pedidoRepository, times(1)).save(pedido);
    }

    @Test
    void testPagarPedido_PedidoNaoEncontrado() {
        when(pedidoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(999L));

        verify(contaCorrenteService, never()).buscarContaEmpresa();
        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testPagarPedido_StatusInvalido() {
        pedido.setStatus(StatusPedido.CRIADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(1L));

        verify(contaCorrenteService, never()).buscarContaEmpresa();
        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testPagarPedido_ClienteSemConta() {
        cliente.setContaCorrente(null);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(1L));

        verify(contaCorrenteService, never()).buscarContaEmpresa();
        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testPagarPedido_EmpresaSemConta() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa())
                .thenThrow(new RegraNegocioException("Conta da empresa não encontrada."));

        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(1L));

        verify(contaCorrenteService, times(1)).buscarContaEmpresa();
        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testPagarPedido_SaldoInsuficiente() { //aq
        contaCliente.setSaldo(new BigDecimal("100.00"));

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);

        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(1L));

        verify(contaCorrenteService, times(1)).buscarContaEmpresa();
        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testPagarPedido_ValorPedidoNulo() {
        pedido.setTotalFinal(null);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);

        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(1L));

        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testPagarPedido_ValorPedidoNegativo() {
        pedido.setTotalFinal(new BigDecimal("-10.00"));

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);

        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(1L));

        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testPagarPedido_ValorPedidoZero() {
        pedido.setTotalFinal(BigDecimal.ZERO);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);

        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(1L));

        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testPagarPedido_SemReserva_LancaExcecao() {
        // Cenário: Pedido está com status CRIADO, mas o pagamento exige RESERVADO
        pedido.setStatus(StatusPedido.CRIADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(1L));
        verify(contaCorrenteService, never()).transferir(any(), any(), any());
    }

    @Test
    void testPagarPedido_Duplicado_LancaExcecao() {
        // Cenário: Tentar pagar um pedido que já está PAGO
        pedido.setStatus(StatusPedido.PAGO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(1L));
        verify(contaCorrenteService, never()).transferir(any(), any(), any());
    }

    @Test
    void testCancelarPedido_PedidoPago_Sucesso() {
        pedido.setStatus(StatusPedido.PAGO);
        pedido.setDataPagamento(LocalDateTime.now());

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedido);

        Pedido resultado = service.cancelarPedido(1L, MOTIVO_CANCELAMENTO);

        assertNotNull(resultado);
        assertEquals(StatusPedido.CANCELADO, resultado.getStatus());
        assertEquals(MOTIVO_CANCELAMENTO, resultado.getMotivoCancelamento());
        assertNotNull(resultado.getDataCancelamento());

        verify(contaCorrenteService, times(1))
                .transferir(contaEmpresa, contaCliente, new BigDecimal("500.00"));

        verify(movimentacaoContaService, times(1)).registrar(
                eq(contaCliente),
                eq(TipoMovimentacao.ESTORNO_CLIENTE),
                eq(new BigDecimal("500.00")),
                eq(pedido)
        );

        verify(movimentacaoContaService, times(1)).registrar(
                eq(contaEmpresa),
                eq(TipoMovimentacao.ESTORNO_EMPRESA),
                eq(new BigDecimal("500.00")),
                eq(pedido)
        );

        verify(pedidoRepository, times(1)).save(pedido);
    }

    @Test
    void testCancelarPedido_PedidoReservado_Sucesso() {
        pedido.setStatus(StatusPedido.RESERVADO);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedido);

        Pedido resultado = service.cancelarPedido(1L, MOTIVO_CANCELAMENTO);

        assertNotNull(resultado);
        assertEquals(StatusPedido.CANCELADO, resultado.getStatus());
        assertEquals(MOTIVO_CANCELAMENTO, resultado.getMotivoCancelamento());
        assertNotNull(resultado.getDataCancelamento());

        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
        verify(pedidoRepository, times(1)).save(pedido);
    }

    @Test
    void testCancelarPedido_PedidoCriado_Sucesso() {
        pedido.setStatus(StatusPedido.CRIADO);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedido);

        Pedido resultado = service.cancelarPedido(1L, MOTIVO_CANCELAMENTO);

        assertNotNull(resultado);
        assertEquals(StatusPedido.CANCELADO, resultado.getStatus());
        assertEquals(MOTIVO_CANCELAMENTO, resultado.getMotivoCancelamento());
        assertNotNull(resultado.getDataCancelamento());

        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
        verify(pedidoRepository, times(1)).save(pedido);
    }

    @Test
    void testCancelarPedido_MotivoNulo() {
        assertThrows(RegraNegocioException.class, () -> service.cancelarPedido(1L, null));

        verify(pedidoRepository, never()).findById(anyLong());
        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testCancelarPedido_MotivoVazio() {
        assertThrows(RegraNegocioException.class, () -> service.cancelarPedido(1L, "   "));

        verify(pedidoRepository, never()).findById(anyLong());
        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testCancelarPedido_PedidoNaoEncontrado() {
        when(pedidoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(
                RegraNegocioException.class,
                () -> service.cancelarPedido(999L, MOTIVO_CANCELAMENTO)
        );

        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testCancelarPedido_PedidoPago_ClienteSemConta() {
        pedido.setStatus(StatusPedido.PAGO);
        cliente.setContaCorrente(null);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(
                RegraNegocioException.class,
                () -> service.cancelarPedido(1L, MOTIVO_CANCELAMENTO)
        );

        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testCancelarPedido_PedidoPago_SaldoEmpresaInsuficiente() {
        pedido.setStatus(StatusPedido.PAGO);
        contaEmpresa.setSaldo(new BigDecimal("100.00"));

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);

        assertThrows(
                RegraNegocioException.class,
                () -> service.cancelarPedido(1L, MOTIVO_CANCELAMENTO)
        );

        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testCancelarPedido_PedidoPago_ValorZero() {
        pedido.setStatus(StatusPedido.PAGO);
        pedido.setTotalFinal(BigDecimal.ZERO);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);

        assertThrows(
                RegraNegocioException.class,
                () -> service.cancelarPedido(1L, MOTIVO_CANCELAMENTO)
        );

        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testCancelarPedido_PedidoCancelado() {
        pedido.setStatus(StatusPedido.CANCELADO);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(
                RegraNegocioException.class,
                () -> service.cancelarPedido(1L, MOTIVO_CANCELAMENTO)
        );

        verify(contaCorrenteService, never()).transferir(any(), any(), any());
        verify(movimentacaoContaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void testCancelarPedido_Duplicado_LancaExcecao() {
        // Cenário: Tentar cancelar um pedido que já está CANCELADO
        pedido.setStatus(StatusPedido.CANCELADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class, () -> service.cancelarPedido(1L, "Motivo"));
        verify(pedidoRepository, times(0)).save(any());
    }
}