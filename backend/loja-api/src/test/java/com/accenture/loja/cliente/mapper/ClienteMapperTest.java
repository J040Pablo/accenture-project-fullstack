package com.accenture.loja.cliente.mapper;

import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.endereco.model.Endereco;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class ClienteMapperTest {

    private final ClienteMapper mapper = new ClienteMapper();

    @Test
    void toResponseDTO_comDadosCompletos_retornaDTO() {
        Endereco endereco = Endereco.builder()
                .id(1L)
                .cep("01310-100")
                .rua("Avenida Paulista")
                .bairro("Bela Vista")
                .cidade("São Paulo")
                .uf("SP")
                .numero("1000")
                .build();

        ContaCorrente conta = ContaCorrente.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(BigDecimal.ZERO)
                .build();

        Cliente cliente = Cliente.builder()
                .id(1L)
                .nome("João Silva")
                .cpf("12345678901")
                .email("joao@email.com")
                .endereco(endereco)
                .contaCorrente(conta)
                .build();

        ClienteResponseDTO dto = mapper.toResponseDTO(cliente);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("João Silva", dto.getNome());
        assertEquals("12345678901", dto.getCpf());
        assertEquals("joao@email.com", dto.getEmail());
        assertNotNull(dto.getEndereco());
        assertEquals("01310-100", dto.getEndereco().getCep());
        assertNotNull(dto.getContaCorrente());
        assertEquals("12345", dto.getContaCorrente().getNumeroConta());
    }

    @Test
    void toResponseDTO_clienteNulo_retornaNull() {
        ClienteResponseDTO dto = mapper.toResponseDTO(null);
        assertNull(dto);
    }

    @Test
    void toResponseDTO_enderecoMapeiaCorretamente() {
        Endereco endereco = Endereco.builder()
                .id(2L)
                .cep("20040-020")
                .rua("Avenida Rio Branco")
                .bairro("Centro")
                .cidade("Rio de Janeiro")
                .uf("RJ")
                .numero("500")
                .build();

        ContaCorrente conta = ContaCorrente.builder()
                .id(2L)
                .numeroConta("99999")
                .saldo(new BigDecimal("1000.00"))
                .build();

        Cliente cliente = Cliente.builder()
                .id(2L)
                .nome("Maria Silva")
                .cpf("98765432100")
                .email("maria@email.com")
                .endereco(endereco)
                .contaCorrente(conta)
                .build();

        ClienteResponseDTO dto = mapper.toResponseDTO(cliente);

        assertEquals("Centro", dto.getEndereco().getBairro());
        assertEquals("Rio de Janeiro", dto.getEndereco().getCidade());
        assertEquals("RJ", dto.getEndereco().getUf());
        assertEquals(new BigDecimal("1000.00"), dto.getContaCorrente().getSaldo());
    }
}