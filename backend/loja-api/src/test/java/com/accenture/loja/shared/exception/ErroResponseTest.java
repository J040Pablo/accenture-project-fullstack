package com.accenture.loja.shared.exception;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ErroResponseTest {

    @Test
    void deveCriarRecordEAcessarCampos() {
        LocalDateTime timestamp = LocalDateTime.of(2026, 5, 8, 12, 0);
        ErroResponse erroResponse = new ErroResponse(timestamp, 400, "Erro", "Mensagem");

        assertEquals(timestamp, erroResponse.timestamp());
        assertEquals(400, erroResponse.status());
        assertEquals("Erro", erroResponse.erro());
        assertEquals("Mensagem", erroResponse.mensagem());
    }

    @Test
    void deveGerarEqualsHashCodeEToStringCoerentes() {
        LocalDateTime timestamp = LocalDateTime.of(2026, 5, 8, 12, 0);
        ErroResponse primeiro = new ErroResponse(timestamp, 400, "Erro", "Mensagem");
        ErroResponse segundo = new ErroResponse(timestamp, 400, "Erro", "Mensagem");

        assertEquals(primeiro, segundo);
        assertEquals(primeiro.hashCode(), segundo.hashCode());
        assertNotNull(primeiro.toString());
        assertTrue(primeiro.toString().contains("Mensagem"));
    }
}
