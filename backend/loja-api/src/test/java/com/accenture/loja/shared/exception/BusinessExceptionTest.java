package com.accenture.loja.shared.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BusinessExceptionTest {

    @Test
    void devePreservarMensagemNoConstrutor() {
        BusinessException exception = new BusinessException("Mensagem de negócio");

        assertEquals("Mensagem de negócio", exception.getMessage());
    }
}
