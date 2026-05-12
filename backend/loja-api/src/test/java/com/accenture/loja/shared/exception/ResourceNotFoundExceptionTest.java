package com.accenture.loja.shared.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ResourceNotFoundExceptionTest {

    @Test
    void deveCriarComMensagem() {
        String mensagem = "Recurso não encontrado";

        ResourceNotFoundException exception = new ResourceNotFoundException(mensagem);

        assertNotNull(exception);
        assertEquals(mensagem, exception.getMessage());
    }
}