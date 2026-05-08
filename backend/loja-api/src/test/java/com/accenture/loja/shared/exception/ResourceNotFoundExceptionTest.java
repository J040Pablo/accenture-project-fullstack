package com.accenture.loja.shared.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class ResourceNotFoundExceptionTest {

    @Test
    void deveInstanciarClasseVazia() {
        ResourceNotFoundException exception = new ResourceNotFoundException();

        assertNotNull(exception);
    }
}
