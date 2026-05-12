package com.accenture.loja.movimentacao.model;

import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.shared.enums.StatusPedido;
import com.accenture.loja.shared.enums.TipoMovimentacao;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class MovimentacaoContaTest {

    private ContaCorrente contaCliente;
    private ContaCorrente contaEmpresa;
    private Pedido pedido;

    @BeforeEach
    void setUp() {
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
    void testCriarMovimentacaoValida() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("500.00"))
                .dataHora(agora)
                .descricao("Pagamento do pedido #1")
                .pedido(pedido)
                .build();

        assertNotNull(mov);
        assertEquals(contaCliente, mov.getConta());
        assertEquals(TipoMovimentacao.PAGAMENTO_PEDIDO, mov.getTipo());
        assertEquals(new BigDecimal("500.00"), mov.getValor());
        assertEquals("Pagamento do pedido #1", mov.getDescricao());
        assertEquals(pedido, mov.getPedido());
    }

    @Test
    void testCriarMovimentacaoPagamentoPedido() {
        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("100.00"))
                .dataHora(LocalDateTime.now())
                .descricao("Pagamento do pedido #1")
                .pedido(pedido)
                .build();

        assertEquals(TipoMovimentacao.PAGAMENTO_PEDIDO, mov.getTipo());
    }

    @Test
    void testCriarMovimentacaoRecebimentoEmpresa() {
        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.RECEBIMENTO_EMPRESA)
                .valor(new BigDecimal("100.00"))
                .dataHora(LocalDateTime.now())
                .descricao("Recebimento do pedido #1")
                .pedido(pedido)
                .build();

        assertEquals(TipoMovimentacao.RECEBIMENTO_EMPRESA, mov.getTipo());
    }

    @Test
    void testCriarMovimentacaoEstornoCliente() {
        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.ESTORNO_CLIENTE)
                .valor(new BigDecimal("100.00"))
                .dataHora(LocalDateTime.now())
                .descricao("Estorno ao cliente do pedido #1")
                .pedido(pedido)
                .build();

        assertEquals(TipoMovimentacao.ESTORNO_CLIENTE, mov.getTipo());
    }

    @Test
    void testCriarMovimentacaoEstornoEmpresa() {
        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.ESTORNO_EMPRESA)
                .valor(new BigDecimal("100.00"))
                .dataHora(LocalDateTime.now())
                .descricao("Estorno pago pela empresa do pedido #1")
                .pedido(pedido)
                .build();

        assertEquals(TipoMovimentacao.ESTORNO_EMPRESA, mov.getTipo());
    }

    @Test
    void testSettersGetters() {
        MovimentacaoConta mov = new MovimentacaoConta();
        LocalDateTime agora = LocalDateTime.now();

        mov.setId(1L);
        mov.setConta(contaCliente);
        mov.setTipo(TipoMovimentacao.PAGAMENTO_PEDIDO);
        mov.setValor(new BigDecimal("500.00"));
        mov.setDataHora(agora);
        mov.setDescricao("Pagamento");
        mov.setPedido(pedido);

        assertEquals(1L, mov.getId());
        assertEquals(contaCliente, mov.getConta());
        assertEquals(TipoMovimentacao.PAGAMENTO_PEDIDO, mov.getTipo());
        assertEquals(new BigDecimal("500.00"), mov.getValor());
        assertEquals("Pagamento", mov.getDescricao());
        assertEquals(pedido, mov.getPedido());
    }

    @Test
    void testNoArgsConstructor() {
        MovimentacaoConta mov = new MovimentacaoConta();

        assertNull(mov.getId());
        assertNull(mov.getConta());
        assertNull(mov.getTipo());
        assertNull(mov.getValor());
        assertNull(mov.getDescricao());
        assertNull(mov.getPedido());
    }

    @Test
    void testAllArgsConstructor() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = new MovimentacaoConta(
                1L,
                contaCliente,
                TipoMovimentacao.PAGAMENTO_PEDIDO,
                new BigDecimal("500.00"),
                agora,
                "Pagamento do pedido #1",
                pedido
        );

        assertEquals(1L, mov.getId());
        assertEquals(contaCliente, mov.getConta());
        assertEquals(TipoMovimentacao.PAGAMENTO_PEDIDO, mov.getTipo());
        assertEquals(new BigDecimal("500.00"), mov.getValor());
        assertEquals("Pagamento do pedido #1", mov.getDescricao());
        assertEquals(pedido, mov.getPedido());
    }

    @Test
    void testCriarMovimentacaoSemPedido() {
        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.DEPOSITO)
                .valor(new BigDecimal("100.00"))
                .dataHora(LocalDateTime.now())
                .descricao("Depósito em conta")
                .build();

        assertNotNull(mov);
        assertNull(mov.getPedido());
    }

    @Test
    void testCriarMultiplasMovimentacoes() {
        MovimentacaoConta mov1 = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("100.00"))
                .dataHora(LocalDateTime.now())
                .descricao("Pagamento 1")
                .pedido(pedido)
                .build();

        MovimentacaoConta mov2 = MovimentacaoConta.builder()
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.RECEBIMENTO_EMPRESA)
                .valor(new BigDecimal("100.00"))
                .dataHora(LocalDateTime.now())
                .descricao("Recebimento 1")
                .pedido(pedido)
                .build();

        assertNotNull(mov1);
        assertNotNull(mov2);
        assertNotEquals(mov1.getConta(), mov2.getConta());
        assertNotEquals(mov1.getTipo(), mov2.getTipo());
    }

    @Test
    void testValoresComPrecisao() {
        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("123.45"))
                .dataHora(LocalDateTime.now())
                .descricao("Pagamento")
                .pedido(pedido)
                .build();

        assertEquals(new BigDecimal("123.45"), mov.getValor());
    }

    @Test
    void testDataHoraPreenchida() {
        LocalDateTime agora = LocalDateTime.now();

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.PAGAMENTO_PEDIDO)
                .valor(new BigDecimal("100.00"))
                .dataHora(agora)
                .descricao("Pagamento")
                .pedido(pedido)
                .build();

        assertNotNull(mov.getDataHora());
        assertEquals(agora.getYear(), mov.getDataHora().getYear());
        assertEquals(agora.getMonth(), mov.getDataHora().getMonth());
        assertEquals(agora.getDayOfMonth(), mov.getDataHora().getDayOfMonth());
    }

    @Test
    void testDescricaoCompleta() {
        String descricao = "Estorno pago pela empresa do pedido #1";

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaEmpresa)
                .tipo(TipoMovimentacao.ESTORNO_EMPRESA)
                .valor(new BigDecimal("500.00"))
                .dataHora(LocalDateTime.now())
                .descricao(descricao)
                .pedido(pedido)
                .build();

        assertEquals(descricao, mov.getDescricao());
    }

    @Test
    void testTodosOsTiposDeMovimentacao() {
        TipoMovimentacao[] tipos = TipoMovimentacao.values();

        for (TipoMovimentacao tipo : tipos) {
            MovimentacaoConta mov = MovimentacaoConta.builder()
                    .conta(contaCliente)
                    .tipo(tipo)
                    .valor(new BigDecimal("100.00"))
                    .dataHora(LocalDateTime.now())
                    .descricao("Teste " + tipo)
                    .pedido(pedido)
                    .build();

            assertEquals(tipo, mov.getTipo());
        }
    }

    @Test
    void testPrePersistSetsDataHoraWhenNull() throws Exception {
        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.DEPOSITO)
                .valor(new BigDecimal("50.00"))
                .dataHora(null)
                .descricao("Depósito em conta")
                .build();

        invokePrePersist(mov);

        assertNotNull(mov.getDataHora());
    }

    @Test
    void testPrePersistDoesNotOverrideExistingDataHora() throws Exception {
        LocalDateTime dt = LocalDateTime.of(2020,1,1,0,0);
        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.DEPOSITO)
                .valor(new BigDecimal("50.00"))
                .dataHora(dt)
                .descricao("Depósito em conta")
                .build();

            invokePrePersist(mov);

        assertEquals(dt, mov.getDataHora());
    }

            @Test
            void testPrePersistLancaExcecaoQuandoDescricaoForNula() throws Exception {
            MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.DEPOSITO)
                .valor(new BigDecimal("50.00"))
                .dataHora(null)
                .descricao(null)
                .build();

            InvocationTargetException exception = assertThrows(
                InvocationTargetException.class,
                () -> invokePrePersist(mov)
            );

            assertInstanceOf(IllegalStateException.class, exception.getCause());
            assertEquals("A descrição da movimentação é obrigatória.", exception.getCause().getMessage());
            assertNotNull(mov.getDataHora());
            }

            @Test
            void testPrePersistLancaExcecaoQuandoDescricaoForEmBranco() throws Exception {
            MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.DEPOSITO)
                .valor(new BigDecimal("50.00"))
                .dataHora(null)
                .descricao("   ")
                .build();

            InvocationTargetException exception = assertThrows(
                InvocationTargetException.class,
                () -> invokePrePersist(mov)
            );

            assertInstanceOf(IllegalStateException.class, exception.getCause());
            assertEquals("A descrição da movimentação é obrigatória.", exception.getCause().getMessage());
            assertNotNull(mov.getDataHora());
            }

        @Test
        void testPrePersistLancaExcecaoQuandoDescricaoForVazia() throws Exception {
            MovimentacaoConta mov = MovimentacaoConta.builder()
                    .conta(contaCliente)
                    .tipo(TipoMovimentacao.DEPOSITO)
                    .valor(new BigDecimal("50.00"))
                    .dataHora(null)
                    .descricao("")
                    .build();

            InvocationTargetException exception = assertThrows(
                    InvocationTargetException.class,
                    () -> invokePrePersist(mov)
            );

            assertInstanceOf(IllegalStateException.class, exception.getCause());
            assertEquals("A descrição da movimentação é obrigatória.", exception.getCause().getMessage());
            assertNotNull(mov.getDataHora());
        }

            @Test
            void testPrePersistComDescricaoValidaNaoLancaExcecao() throws Exception {
            MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(contaCliente)
                .tipo(TipoMovimentacao.DEPOSITO)
                .valor(new BigDecimal("50.00"))
                .dataHora(null)
                .descricao("Depósito realizado")
                .build();

            assertDoesNotThrow(() -> invokePrePersist(mov));

            assertNotNull(mov.getDataHora());
            assertEquals("Depósito realizado", mov.getDescricao());
            }

            @Test
            void testPreUpdateLancaExcecaoQuandoDescricaoForNula() throws Exception {
            MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.DEPOSITO)
                .valor(new BigDecimal("50.00"))
                .dataHora(LocalDateTime.now())
                .descricao(null)
                .build();

            InvocationTargetException exception = assertThrows(
                InvocationTargetException.class,
                () -> invokePreUpdate(mov)
            );

            assertInstanceOf(IllegalStateException.class, exception.getCause());
            assertEquals("A descrição da movimentação é obrigatória.", exception.getCause().getMessage());
            }

            @Test
            void testPreUpdateLancaExcecaoQuandoDescricaoForEmBranco() throws Exception {
            MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.DEPOSITO)
                .valor(new BigDecimal("50.00"))
                .dataHora(LocalDateTime.now())
                .descricao("   ")
                .build();

            InvocationTargetException exception = assertThrows(
                InvocationTargetException.class,
                () -> invokePreUpdate(mov)
            );

            assertInstanceOf(IllegalStateException.class, exception.getCause());
            assertEquals("A descrição da movimentação é obrigatória.", exception.getCause().getMessage());
            }

            @Test
            void testPreUpdateComDescricaoValidaNaoLancaExcecao() throws Exception {
            MovimentacaoConta mov = MovimentacaoConta.builder()
                .id(1L)
                .conta(contaCliente)
                .tipo(TipoMovimentacao.DEPOSITO)
                .valor(new BigDecimal("50.00"))
                .dataHora(LocalDateTime.now())
                .descricao("Atualização da movimentação")
                .build();

            assertDoesNotThrow(() -> invokePreUpdate(mov));

            assertEquals("Atualização da movimentação", mov.getDescricao());
            }

            private static void invokePrePersist(MovimentacaoConta movimentacaoConta)
                throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {

            Method method = MovimentacaoConta.class.getDeclaredMethod("prePersist");
            method.setAccessible(true);
            method.invoke(movimentacaoConta);
            }

            private static void invokePreUpdate(MovimentacaoConta movimentacaoConta)
                throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {

            Method method = MovimentacaoConta.class.getDeclaredMethod("preUpdate");
            method.setAccessible(true);
            method.invoke(movimentacaoConta);
            }
}
