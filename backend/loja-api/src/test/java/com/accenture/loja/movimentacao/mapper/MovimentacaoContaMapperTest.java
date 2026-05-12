package com.accenture.loja.movimentacao.mapper;

import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.movimentacao.dto.MovimentacaoContaResponse;
import com.accenture.loja.movimentacao.model.MovimentacaoConta;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.shared.enums.StatusPedido;
import com.accenture.loja.shared.enums.TipoMovimentacao;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class MovimentacaoContaMapperTest {

    private MovimentacaoContaMapper mapper;
    private ContaCorrente contaCliente;
    private ContaCorrente contaEmpresa;
    private Pedido pedido;

    @BeforeEach
    void setUp() {
        mapper = new MovimentacaoContaMapper();

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
    void testMapearMovimentacaoPagamentoPedido() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("500.00"))
                .dataHora(agora)
                .descricao("Pagamento do pedido #1")
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(1L, response.contaId());
        assertEquals("12345", response.numeroConta());
        assertEquals(TipoTitularConta.CLIENTE, response.tipoTitular());
        assertEquals(TipoMovimentacao.PAGAMENTO_PEDIDO, response.tipo());
        assertEquals(new BigDecimal("500.00"), response.valor());
        assertEquals("Pagamento do pedido #1", response.descricao());
        assertEquals(1L, response.pedidoId());
    }

    @Test
    void testMapearMovimentacaoRecebimentoEmpresa() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(2L)
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.RECEBIMENTO_EMPRESA)
                .valor(new BigDecimal("500.00"))
                .dataHora(agora)
                .descricao("Recebimento do pedido #1")
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertNotNull(response);
        assertEquals(2L, response.id());
        assertEquals(2L, response.contaId());
        assertEquals("67890", response.numeroConta());
        assertEquals(TipoTitularConta.EMPRESA, response.tipoTitular());
        assertEquals(TipoMovimentacao.RECEBIMENTO_EMPRESA, response.tipo());
        assertEquals(new BigDecimal("500.00"), response.valor());
        assertEquals("Recebimento do pedido #1", response.descricao());
        assertEquals(1L, response.pedidoId());
    }

    @Test
    void testMapearMovimentacaoEstornoCliente() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(3L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.ESTORNO_CLIENTE)
                .valor(new BigDecimal("500.00"))
                .dataHora(agora)
                .descricao("Estorno ao cliente do pedido #1")
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertEquals(TipoMovimentacao.ESTORNO_CLIENTE, response.tipo());
        assertEquals(TipoTitularConta.CLIENTE, response.tipoTitular());
    }

    @Test
    void testMapearMovimentacaoEstornoEmpresa() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(4L)
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.ESTORNO_EMPRESA)
                .valor(new BigDecimal("500.00"))
                .dataHora(agora)
                .descricao("Estorno pago pela empresa do pedido #1")
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertEquals(TipoMovimentacao.ESTORNO_EMPRESA, response.tipo());
        assertEquals(TipoTitularConta.EMPRESA, response.tipoTitular());
    }

    @Test
    void testMapearMovimentacaoSemPedido() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(5L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.DEPOSITO)
                .valor(new BigDecimal("100.00"))
                .dataHora(agora)
                .descricao("Depósito em conta")
                .pedido(null)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertNotNull(response);
        assertNull(response.pedidoId());
    }

    @Test
    void testMapearValorComPrecisao() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("123.45"))
                .dataHora(agora)
                .descricao("Pagamento")
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertEquals(new BigDecimal("123.45"), response.valor());
    }

    @Test
    void testMapearDataHora() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("500.00"))
                .dataHora(agora)
                .descricao("Pagamento")
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertNotNull(response.dataHora());
        assertEquals(agora, response.dataHora());
    }

    @Test
    void testMapearDescricao() {
        LocalDateTime agora = LocalDateTime.now();
        String descricao = "Estorno pago pela empresa do pedido #123";

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.ESTORNO_EMPRESA)
                .valor(new BigDecimal("500.00"))
                .dataHora(agora)
                .descricao(descricao)
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertEquals(descricao, response.descricao());
    }

    @Test
    void testMapearTodosCampos() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(10L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("999.99"))
                .dataHora(agora)
                .descricao("Teste completo")
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertNotNull(response.id());
        assertNotNull(response.contaId());
        assertNotNull(response.numeroConta());
        assertNotNull(response.tipoTitular());
        assertNotNull(response.tipo());
        assertNotNull(response.valor());
        assertNotNull(response.dataHora());
        assertNotNull(response.descricao());
        assertNotNull(response.pedidoId());
    }

    @Test
    void testMapearNumeroConta() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("500.00"))
                .dataHora(agora)
                .descricao("Pagamento")
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertEquals("12345", response.numeroConta());
    }

    @Test
    void testMapearTipoTitular_Cliente() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("500.00"))
                .dataHora(agora)
                .descricao("Pagamento")
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertEquals(TipoTitularConta.CLIENTE, response.tipoTitular());
    }

    @Test
    void testMapearTipoTitular_Empresa() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.RECEBIMENTO_EMPRESA)
                .valor(new BigDecimal("500.00"))
                .dataHora(agora)
                .descricao("Recebimento")
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response = mapper.toResponse(mov);

        assertEquals(TipoTitularConta.EMPRESA, response.tipoTitular());
    }

    @Test
    void testMapearMultiplaMovimentacoes() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov1 = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("100.00"))
                .dataHora(agora)
                .descricao("Pagamento 1")
                .pedido(pedido)
                .build();

        MovimentacaoConta mov2 = MovimentacaoConta.builder()
                .id(2L)
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.RECEBIMENTO_EMPRESA)
                .valor(new BigDecimal("100.00"))
                .dataHora(agora)
                .descricao("Recebimento 1")
                .pedido(pedido)
                .build();

        MovimentacaoContaResponse response1 = mapper.toResponse(mov1);
        MovimentacaoContaResponse response2 = mapper.toResponse(mov2);

        assertNotNull(response1);
        assertNotNull(response2);
        assertNotEquals(response1.id(), response2.id());
        assertNotEquals(response1.tipoTitular(), response2.tipoTitular());
    }
}
