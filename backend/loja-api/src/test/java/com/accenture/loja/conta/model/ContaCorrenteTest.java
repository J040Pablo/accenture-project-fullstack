package com.accenture.loja.conta.model;

import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.RegraNegocioException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import java.lang.reflect.Method;

class ContaCorrenteTest {

    @Test
    void testCriarContaCliente_Sucesso() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(BigDecimal.ZERO)
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        assertNotNull(conta);
        assertEquals("12345", conta.getNumeroConta());
        assertEquals(0, conta.getSaldo().compareTo(BigDecimal.ZERO));
        assertEquals(TipoTitularConta.CLIENTE, conta.getTipoTitular());
    }

    @Test
    void testCriarContaEmpresa_Sucesso() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("67890")
                .saldo(BigDecimal.ZERO)
                .tipoTitular(TipoTitularConta.EMPRESA)
                .build();

        assertNotNull(conta);
        assertEquals("67890", conta.getNumeroConta());
        assertEquals(0, conta.getSaldo().compareTo(BigDecimal.ZERO));
        assertEquals(TipoTitularConta.EMPRESA, conta.getTipoTitular());
    }

    @Test
    void testCriarContaComSaldoInicial() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("1000.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        assertEquals(0, conta.getSaldo().compareTo(new BigDecimal("1000.00")));
    }

    @Test
    void testCreditarValorValido() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("100.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        conta.creditar(new BigDecimal("50.00"));

        assertEquals(0, conta.getSaldo().compareTo(new BigDecimal("150.00")));
    }

    @Test
    void testCreditarMultiploValores() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("100.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        conta.creditar(new BigDecimal("50.00"));
        conta.creditar(new BigDecimal("30.00"));

        assertEquals(0, conta.getSaldo().compareTo(new BigDecimal("180.00")));
    }

    @Test
    void testDebitarValorValido() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("1000.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        conta.debitar(new BigDecimal("500.00"));

        assertEquals(0, conta.getSaldo().compareTo(new BigDecimal("500.00")));
    }

    @Test
    void testDebitarSaldoInsuficiente() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("100.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        assertThrows(RegraNegocioException.class, () ->
            conta.debitar(new BigDecimal("200.00"))
        );
    }

    @Test
    void testDebitarValorExato() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("500.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        conta.debitar(new BigDecimal("500.00"));

        assertEquals(0, conta.getSaldo().compareTo(BigDecimal.ZERO));
    }

    @Test
    void testCreditarValorZero() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("100.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        assertThrows(RegraNegocioException.class, () ->
            conta.creditar(BigDecimal.ZERO)
        );
    }

    @Test
    void testCreditarValorNegativo() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("100.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        assertThrows(RegraNegocioException.class, () ->
            conta.creditar(new BigDecimal("-50.00"))
        );
    }

    @Test
    void testDebitarValorZero() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("100.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        assertThrows(RegraNegocioException.class, () ->
            conta.debitar(BigDecimal.ZERO)
        );
    }

    @Test
    void testDebitarValorNegativo() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("100.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        assertThrows(RegraNegocioException.class, () ->
            conta.debitar(new BigDecimal("-50.00"))
        );
    }

    @Test
    void testCreditarValorNulo() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("100.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        assertThrows(RegraNegocioException.class, () ->
            conta.creditar(null)
        );
    }

    @Test
    void testDebitarValorNulo() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("100.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        assertThrows(RegraNegocioException.class, () ->
            conta.debitar(null)
        );
    }

    @Test
    void testSettersGetters() {
        ContaCorrente conta = new ContaCorrente();
        conta.setId(1L);
        conta.setNumeroConta("99999");
        conta.setSaldo(new BigDecimal("2000.00"));
        conta.setTipoTitular(TipoTitularConta.EMPRESA);

        assertEquals(1L, conta.getId());
        assertEquals("99999", conta.getNumeroConta());
        assertEquals(0, conta.getSaldo().compareTo(new BigDecimal("2000.00")));
        assertEquals(TipoTitularConta.EMPRESA, conta.getTipoTitular());
    }

    @Test
    void testDebitarComPrecisao() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("1000.50"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        conta.debitar(new BigDecimal("100.25"));

        assertEquals(0, conta.getSaldo().compareTo(new BigDecimal("900.25")));
    }

    @Test
    void testCreditarComPrecisao() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(new BigDecimal("1000.50"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        conta.creditar(new BigDecimal("99.75"));

        assertEquals(0, conta.getSaldo().compareTo(new BigDecimal("1100.25")));
    }

    @Test
    void testBuilderComValoresPadrao() {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        assertEquals(0, conta.getSaldo().compareTo(BigDecimal.ZERO));
    }

    @Test
    void testNoArgsConstructor() {
        ContaCorrente conta = new ContaCorrente();

        assertNull(conta.getId());
        assertNull(conta.getNumeroConta());
        assertNull(conta.getTipoTitular());
    }

    @Test
    void testAllArgsConstructor() {
        ContaCorrente conta = new ContaCorrente(
                1L,
                "12345",
                new BigDecimal("1000.00"),
                TipoTitularConta.CLIENTE
        );

        assertEquals(1L, conta.getId());
        assertEquals("12345", conta.getNumeroConta());
        assertEquals(0, conta.getSaldo().compareTo(new BigDecimal("1000.00")));
        assertEquals(TipoTitularConta.CLIENTE, conta.getTipoTitular());
    }

    @Test
    void testValidarContaCorrente_SaldoNullSetsZero() throws Exception {
        ContaCorrente conta = new ContaCorrente();
        conta.setNumeroConta("123");
        conta.setSaldo(null);
        conta.setTipoTitular(TipoTitularConta.CLIENTE);

        Method m = ContaCorrente.class.getDeclaredMethod("validarContaCorrente");
        m.setAccessible(true);
        m.invoke(conta);

        assertEquals(0, conta.getSaldo().compareTo(BigDecimal.ZERO));
    }

    @Test
    void testValidarContaCorrente_SaldoNegativoThrows() throws Exception {
        ContaCorrente conta = new ContaCorrente();
        conta.setNumeroConta("123");
        conta.setSaldo(new BigDecimal("-1.00"));
        conta.setTipoTitular(TipoTitularConta.CLIENTE);

        Method m = ContaCorrente.class.getDeclaredMethod("validarContaCorrente");
        m.setAccessible(true);

        assertThrows(Exception.class, () -> m.invoke(conta));
    }

    @Test
    void testValidarContaCorrente_TipoTitularNullThrows() throws Exception {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta("12345")
                .saldo(BigDecimal.ZERO)
                .tipoTitular(null)
                .build();

        Method m = ContaCorrente.class.getDeclaredMethod("validarContaCorrente");
        m.setAccessible(true);

        assertThrows(Exception.class, () -> m.invoke(conta));
    }
}
