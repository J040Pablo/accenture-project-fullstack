package com.accenture.loja.endereco.mapper;

import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EnderecoMapperTest {

    private final EnderecoMapper enderecoMapper = new EnderecoMapper();

    @Test
    void toResponseDTO_deveConverterEntidadeParaResponse() {
        Endereco endereco = Endereco.builder()
                .id(1L)
                .cep("01310100")
                .rua("Av. Paulista")
                .numero("1000")
                .complemento("Apto 2001")
                .bairro("Bela Vista")
                .cidade("São Paulo")
                .uf("SP")
                .build();

        EnderecoResponseDTO dto = enderecoMapper.toResponseDTO(endereco);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("01310100", dto.getCep());
        assertEquals("Av. Paulista", dto.getRua());
        assertEquals("1000", dto.getNumero());
        assertEquals("Apto 2001", dto.getComplemento());
        assertEquals("Bela Vista", dto.getBairro());
        assertEquals("São Paulo", dto.getCidade());
        assertEquals("SP", dto.getUf());
    }

    @Test
    void toResponseDTO_deveRetornarNullQuandoEntidadeForNull() {
        assertNull(enderecoMapper.toResponseDTO(null));
    }
}