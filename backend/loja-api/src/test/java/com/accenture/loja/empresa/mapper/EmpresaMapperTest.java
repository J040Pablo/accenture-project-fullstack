package com.accenture.loja.empresa.mapper;

import com.accenture.loja.empresa.dto.EmpresaResponseDTO;
import com.accenture.loja.empresa.model.Empresa;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmpresaMapperTest {

    private final EmpresaMapper mapper = new EmpresaMapper();

    @Test
    void toResponse_deveRetornarNullQuandoEmpresaForNull() {
        EmpresaResponseDTO response = mapper.toResponse(null);

        assertNull(response);
    }

    @Test
    void toResponse_deveMapearEmpresaValidaParaResponseDTO() {
        Empresa empresa = new Empresa("Razao", "Fantasia", "12345678000199", "empresa@loja.com", "11999999999");
        empresa.setId(10L);
        empresa.setAtivo(true);

        EmpresaResponseDTO response = mapper.toResponse(empresa);

        assertNotNull(response);
        assertEquals(10L, response.id());
        assertEquals("Razao", response.razaoSocial());
        assertEquals("Fantasia", response.nomeFantasia());
        assertEquals("12345678000199", response.cnpj());
        assertEquals("empresa@loja.com", response.email());
        assertEquals("11999999999", response.telefone());
        assertTrue(response.ativo());
    }
}