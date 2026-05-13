package com.accenture.loja.cliente.mapper;

import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.shared.enums.TipoTitularConta;
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
                .complemento("Apto 1")
                .build();

        ContaCorrente conta = ContaCorrente.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(BigDecimal.ZERO)
                .tipoTitular(TipoTitularConta.CLIENTE)
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

        assertAll(
                () -> assertNotNull(dto),
                () -> assertEquals(1L, dto.getId()),
                () -> assertEquals("João Silva", dto.getNome()),
                () -> assertEquals("12345678901", dto.getCpf()),
                () -> assertEquals("joao@email.com", dto.getEmail()),
                () -> assertEquals("01310-100", dto.getEndereco().getCep()),
                () -> assertEquals("12345", dto.getContaCorrente().getNumeroConta()),
                () -> assertEquals(
                        TipoTitularConta.CLIENTE,
                        dto.getContaCorrente().getTipoTitular()
                )
        );
    }

    @Test
    void toResponseDTO_clienteNull_retornaNull() {

        ClienteResponseDTO dto = mapper.toResponseDTO(null);

        assertNull(dto);
    }

    @Test
    void toResponseDTO_enderecoNull_retornaSemEndereco() {

        Cliente cliente = Cliente.builder()
                .id(1L)
                .nome("João")
                .build();

        ClienteResponseDTO dto = mapper.toResponseDTO(cliente);

        assertNotNull(dto);
        assertNull(dto.getEndereco());
    }

    @Test
    void toResponseDTO_contaNull_retornaSemConta() {

        Cliente cliente = Cliente.builder()
                .id(1L)
                .nome("João")
                .build();

        ClienteResponseDTO dto = mapper.toResponseDTO(cliente);

        assertNotNull(dto);
        assertNull(dto.getContaCorrente());
    }

    @Test
    void toResponseDTO_mapeiaSaldoCorretamente() {

        ContaCorrente conta = ContaCorrente.builder()
                .id(2L)
                .numeroConta("99999")
                .saldo(new BigDecimal("1000.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        Cliente cliente = Cliente.builder()
                .id(2L)
                .nome("Maria")
                .contaCorrente(conta)
                .build();

        ClienteResponseDTO dto = mapper.toResponseDTO(cliente);

        assertEquals(
                new BigDecimal("1000.00"),
                dto.getContaCorrente().getSaldo()
        );
    }
}