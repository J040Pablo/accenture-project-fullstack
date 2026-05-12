package com.accenture.loja.movimentacao.dto;

import com.accenture.loja.shared.enums.TipoMovimentacao;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class MovimentacaoContaRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testConstrutorEAccessors() {
        MovimentacaoContaRequest request = new MovimentacaoContaRequest(
                1L,
                TipoMovimentacao.PAGAMENTO_PEDIDO,
                new BigDecimal("100.00"),
                10L
        );

        assertEquals(1L, request.contaId());
        assertEquals(TipoMovimentacao.PAGAMENTO_PEDIDO, request.tipo());
        assertEquals(0, request.valor().compareTo(new BigDecimal("100.00")));
        assertEquals(10L, request.pedidoId());
    }

    @Test
    void testEqualsHashCodeEToString() {
        MovimentacaoContaRequest request1 = new MovimentacaoContaRequest(
                1L,
                TipoMovimentacao.RECEBIMENTO_EMPRESA,
                new BigDecimal("250.00"),
                10L
        );
        MovimentacaoContaRequest request2 = new MovimentacaoContaRequest(
                1L,
                TipoMovimentacao.RECEBIMENTO_EMPRESA,
                new BigDecimal("250.00"),
                10L
        );

        assertEquals(request1, request2);
        assertEquals(request1.hashCode(), request2.hashCode());
        assertTrue(request1.toString().contains("RECEBIMENTO_EMPRESA"));
    }

    @Test
    void testPedidoIdPodeSerNulo() {
        MovimentacaoContaRequest request = new MovimentacaoContaRequest(
                1L,
                TipoMovimentacao.DEPOSITO,
                new BigDecimal("50.00"),
                null
        );

        assertNull(request.pedidoId());
    }

    @Test
    void testValidacaoContaIdNulo() {
        MovimentacaoContaRequest request = new MovimentacaoContaRequest(
                null,
                TipoMovimentacao.PAGAMENTO_PEDIDO,
                new BigDecimal("100.00"),
                10L
        );

        Set<ConstraintViolation<MovimentacaoContaRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("ID da conta")));
    }

    @Test
    void testValidacaoTipoNulo() {
        MovimentacaoContaRequest request = new MovimentacaoContaRequest(
                1L,
                null,
                new BigDecimal("100.00"),
                10L
        );

        Set<ConstraintViolation<MovimentacaoContaRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("tipo de movimentação")));
    }

    @Test
    void testValidacaoValorNulo() {
        MovimentacaoContaRequest request = new MovimentacaoContaRequest(
                1L,
                TipoMovimentacao.PAGAMENTO_PEDIDO,
                null,
                10L
        );

        Set<ConstraintViolation<MovimentacaoContaRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("valor é obrigatório")));
    }

    @Test
    void testValidacaoValorNaoPositivo() {
        MovimentacaoContaRequest request = new MovimentacaoContaRequest(
                1L,
                TipoMovimentacao.PAGAMENTO_PEDIDO,
                BigDecimal.ZERO,
                10L
        );

        Set<ConstraintViolation<MovimentacaoContaRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("deve ser positivo")));
    }
}
