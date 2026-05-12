package com.accenture.loja.movimentacao.service;

import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.movimentacao.dto.MovimentacaoContaResponse;
import com.accenture.loja.movimentacao.mapper.MovimentacaoContaMapper;
import com.accenture.loja.movimentacao.model.MovimentacaoConta;
import com.accenture.loja.movimentacao.repository.MovimentacaoContaRepository;
import com.accenture.loja.pedido.model.Pedido;
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
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class MovimentacaoContaServiceTest {

    @Mock
    private MovimentacaoContaRepository repository;

    @Mock
    private MovimentacaoContaMapper mapper;

    @InjectMocks
    private MovimentacaoContaService service;

    private ContaCorrente contaCliente;
    private ContaCorrente contaEmpresa;
    private Pedido pedido;

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

        pedido = Pedido.builder()
                .idPedido(1L)
                .status(StatusPedido.PAGO)
                .build();
    }

    @Test
    void testRegistrar_PagamentoPedido_Sucesso() {
        MovimentacaoConta movimento = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("100.00"))
                .pedido(pedido)
                .descricao("Pagamento do pedido #1")
                .build();

        when(repository.save(any(MovimentacaoConta.class))).thenReturn(movimento);

        MovimentacaoConta resultado = service.registrar(
                contaCliente,
                TipoMovimentacao.PAGAMENTO_PEDIDO,
                new BigDecimal("100.00"),
                pedido
        );

        assertNotNull(resultado);
        assertEquals(TipoMovimentacao.PAGAMENTO_PEDIDO, resultado.getTipo());
        assertEquals(new BigDecimal("100.00"), resultado.getValor());
        assertEquals(pedido, resultado.getPedido());
        verify(repository, times(1)).save(any(MovimentacaoConta.class));
    }

    @Test
    void testRegistrar_RecebimentoEmpresa_Sucesso() {
        MovimentacaoConta movimento = MovimentacaoConta.builder()
                .id(2L)
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.RECEBIMENTO_EMPRESA)
                .valor(new BigDecimal("100.00"))
                .pedido(pedido)
                .descricao("Recebimento do pedido #1")
                .build();

        when(repository.save(any(MovimentacaoConta.class))).thenReturn(movimento);

        MovimentacaoConta resultado = service.registrar(
                contaEmpresa,
                TipoMovimentacao.RECEBIMENTO_EMPRESA,
                new BigDecimal("100.00"),
                pedido
        );

        assertNotNull(resultado);
        assertEquals(TipoMovimentacao.RECEBIMENTO_EMPRESA, resultado.getTipo());
        verify(repository, times(1)).save(any(MovimentacaoConta.class));
    }

    @Test
    void testRegistrar_EstornoCliente_Sucesso() {
        MovimentacaoConta movimento = MovimentacaoConta.builder()
                .id(3L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.ESTORNO_CLIENTE)
                .valor(new BigDecimal("100.00"))
                .pedido(pedido)
                .descricao("Estorno ao cliente do pedido #1")
                .build();

        when(repository.save(any(MovimentacaoConta.class))).thenReturn(movimento);

        MovimentacaoConta resultado = service.registrar(
                contaCliente,
                TipoMovimentacao.ESTORNO_CLIENTE,
                new BigDecimal("100.00"),
                pedido
        );

        assertNotNull(resultado);
        assertEquals(TipoMovimentacao.ESTORNO_CLIENTE, resultado.getTipo());
        verify(repository, times(1)).save(any(MovimentacaoConta.class));
    }

    @Test
    void testRegistrar_EstornoEmpresa_Sucesso() {
        MovimentacaoConta movimento = MovimentacaoConta.builder()
                .id(4L)
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.ESTORNO_EMPRESA)
                .valor(new BigDecimal("100.00"))
                .pedido(pedido)
                .descricao("Estorno pago pela empresa do pedido #1")
                .build();

        when(repository.save(any(MovimentacaoConta.class))).thenReturn(movimento);

        MovimentacaoConta resultado = service.registrar(
                contaEmpresa,
                TipoMovimentacao.ESTORNO_EMPRESA,
                new BigDecimal("100.00"),
                pedido
        );

        assertNotNull(resultado);
        assertEquals(TipoMovimentacao.ESTORNO_EMPRESA, resultado.getTipo());
        verify(repository, times(1)).save(any(MovimentacaoConta.class));
    }

    @Test
    void testRegistrar_ContaNula() {
        assertThrows(RegraNegocioException.class, () ->
            service.registrar(
                    null,
                    TipoMovimentacao.PAGAMENTO_PEDIDO,
                    new BigDecimal("100.00"),
                    pedido
            )
        );
    }

    @Test
    void testRegistrar_TipoNulo() {
        assertThrows(RegraNegocioException.class, () ->
            service.registrar(
                    contaCliente,
                    null,
                    new BigDecimal("100.00"),
                    pedido
            )
        );
    }

    @Test
    void testRegistrar_ValorZero() {
        assertThrows(RegraNegocioException.class, () ->
            service.registrar(
                    contaCliente,
                    TipoMovimentacao.PAGAMENTO_PEDIDO,
                    BigDecimal.ZERO,
                    pedido
            )
        );
    }

    @Test
    void testRegistrar_ValorNegativo() {
        assertThrows(RegraNegocioException.class, () ->
            service.registrar(
                    contaCliente,
                    TipoMovimentacao.PAGAMENTO_PEDIDO,
                    new BigDecimal("-100.00"),
                    pedido
            )
        );
    }

    @Test
    void testRegistrar_ValorNulo() {
        assertThrows(RegraNegocioException.class, () ->
            service.registrar(
                    contaCliente,
                    TipoMovimentacao.PAGAMENTO_PEDIDO,
                    null,
                    pedido
            )
        );
    }

    @Test
    void testListarTodas() {
        MovimentacaoConta mov1 = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("100.00"))
                .build();

        MovimentacaoConta mov2 = MovimentacaoConta.builder()
                .id(2L)
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.RECEBIMENTO_EMPRESA)
                .valor(new BigDecimal("100.00"))
                .build();

        List<MovimentacaoConta> movimentos = Arrays.asList(mov1, mov2);

        when(repository.findAll()).thenReturn(movimentos);
        when(mapper.toResponse(mov1)).thenReturn(new MovimentacaoContaResponse(
                1L, 1L, "12345", TipoTitularConta.CLIENTE, TipoMovimentacao.PAGAMENTO_PEDIDO,
                new BigDecimal("100.00"), LocalDateTime.now(), "Pagamento do pedido #1", 1L
        ));
        when(mapper.toResponse(mov2)).thenReturn(new MovimentacaoContaResponse(
                2L, 2L, "67890", TipoTitularConta.EMPRESA, TipoMovimentacao.RECEBIMENTO_EMPRESA,
                new BigDecimal("100.00"), LocalDateTime.now(), "Recebimento do pedido #1", 1L
        ));

        List<MovimentacaoContaResponse> resultado = service.listarTodas();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        verify(repository, times(1)).findAll();
    }

    @Test
    void testListarPorConta() {
        MovimentacaoConta mov1 = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("100.00"))
                .build();

        List<MovimentacaoConta> movimentos = Arrays.asList(mov1);

        when(repository.findByContaIdOrderByDataHoraDesc(1L)).thenReturn(movimentos);
        when(mapper.toResponse(mov1)).thenReturn(new MovimentacaoContaResponse(
                1L, 1L, "12345", TipoTitularConta.CLIENTE, TipoMovimentacao.PAGAMENTO_PEDIDO,
                new BigDecimal("100.00"), LocalDateTime.now(), "Pagamento do pedido #1", 1L
        ));

        List<MovimentacaoContaResponse> resultado = service.listarPorConta(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(repository, times(1)).findByContaIdOrderByDataHoraDesc(1L);
    }
}
