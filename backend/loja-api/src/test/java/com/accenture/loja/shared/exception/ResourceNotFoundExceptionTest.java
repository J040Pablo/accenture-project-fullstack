package com.accenture.loja.shared.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ResourceNotFoundExceptionTest {

    @Test
    void deveInstanciarClasseVazia() {
        ResourceNotFoundException exception = new ResourceNotFoundException();

        assertNotNull(exception);
    }

    @Test
    void deveCriarComMensagem() {
        String mensagem = "Recurso não encontrado";
        ResourceNotFoundException exception = new ResourceNotFoundException(mensagem);

        assertNotNull(exception);
        assertEquals(mensagem, exception.getMessage());
    }

    @Test
    void deveCriarComMensagemECausa() {
        String mensagem = "Recurso não encontrado";
        IllegalStateException cause = new IllegalStateException("Causa original");
        ResourceNotFoundException exception = new ResourceNotFoundException(mensagem, cause);

        assertNotNull(exception);
        assertEquals(mensagem, exception.getMessage());
        assertEquals(cause, exception.getCause());
    }

    @Test
    void deveCriarComCausa() {
        IllegalStateException cause = new IllegalStateException("Causa original");
        ResourceNotFoundException exception = new ResourceNotFoundException(cause);

        assertNotNull(exception);
        assertEquals(cause, exception.getCause());
    }
}
