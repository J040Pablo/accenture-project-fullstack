package com.accenture.loja.empresa.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class EmpresaModelTest {

    @Test
    void deveCriarComConstrutorVazioEPreencherComSetters() {
        Empresa e = new Empresa();

        e.setId(100L);
        e.setRazaoSocial("Empresa Teste LTDA");
        e.setNomeFantasia("Empresa Teste");
        e.setCnpj("12345678000199");
        e.setEmail("empresa@teste.com");
        e.setTelefone("11999999999");
        e.setAtivo(true);

        assertEquals(100L, e.getId());
        assertEquals("Empresa Teste LTDA", e.getRazaoSocial());
        assertEquals("Empresa Teste", e.getNomeFantasia());
        assertEquals("12345678000199", e.getCnpj());
        assertEquals("empresa@teste.com", e.getEmail());
        assertEquals("11999999999", e.getTelefone());
        assertTrue(e.getAtivo());
    }

    @Test
    void deveCriarComConstrutorCompletoEValoresCorretos() {
        Empresa e = new Empresa("Empresa Teste LTDA", "Empresa Teste", "12345678000199", "empresa@teste.com", "11999999999");

        // id começa null
        assertNull(e.getId());
        assertEquals("Empresa Teste LTDA", e.getRazaoSocial());
        assertEquals("Empresa Teste", e.getNomeFantasia());
        assertEquals("12345678000199", e.getCnpj());
        assertEquals("empresa@teste.com", e.getEmail());
        assertEquals("11999999999", e.getTelefone());

        // comportamento padrão: ativo true
        assertTrue(e.getAtivo());
    }

    @Test
    void deveAlterarEstadoAtivo() {
        Empresa e = new Empresa();
        // default do campo é true no construtor completo; aqui setamos explicitamente
        e.setAtivo(true);
        assertTrue(e.getAtivo());

        e.setAtivo(false);
        assertFalse(e.getAtivo());

        e.setAtivo(true);
        assertTrue(e.getAtivo());
    }

    @Test
    void toStringEqualsHashcodeNaoSaoImplementadosExplicitamente() {
        Empresa a = new Empresa("Empresa Teste LTDA", "Empresa Teste", "12345678000199", "empresa@teste.com", "11999999999");
        Empresa b = new Empresa("Empresa Teste LTDA", "Empresa Teste", "12345678000199", "empresa@teste.com", "11999999999");

        // A classe não sobrescreve equals/hashCode/toString manualmente; garantimos que getters funcionem
        assertEquals(a.getCnpj(), b.getCnpj());
        // Não garantimos equals() por referência/implementação — apenas verificamos que toString não é nulo
        assertNotNull(a.toString());
    }
}
