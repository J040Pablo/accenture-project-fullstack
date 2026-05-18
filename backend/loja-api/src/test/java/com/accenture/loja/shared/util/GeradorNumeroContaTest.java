package com.accenture.loja.shared.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeradorNumeroContaTest {

    @Test
    void deveGerarNumeroDeContaComCincoDigitos() {
        GeradorNumeroConta gerador = new GeradorNumeroConta();

        String numeroConta = GeradorNumeroConta.gerarNumeroConta();

        assertNotNull(gerador);
        assertNotNull(numeroConta);
        assertTrue(numeroConta.matches("\\d{5}"));

        int valor = Integer.parseInt(numeroConta);
        assertTrue(valor >= 10000 && valor <= 99999);
    }
}