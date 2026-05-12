package com.accenture.loja.cliente.service;

import com.accenture.loja.cliente.dto.ClienteRequestDTO;
import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.service.ViaCepService;
import com.accenture.loja.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ViaCepService viaCepService;

    @InjectMocks
    private ClienteService clienteService;

    private Cliente cliente;
    private ClienteRequestDTO clienteRequestDTO;

    @BeforeEach
    void setup() {

        Endereco endereco = Endereco.builder()
                .id(1L)
                .cep("58400-000")
                .rua("Rua Teste")
                .numero("123")
                .bairro("Centro")
                .cidade("Campina Grande")
                .uf("PB")
                .build();

        ContaCorrente contaCorrente = ContaCorrente.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(BigDecimal.ZERO)
                .build();

        cliente = Cliente.builder()
                .id(1L)
                .nome("Jader")
                .cpf("12345678900")
                .email("jader@email.com")
                .endereco(endereco)
                .contaCorrente(contaCorrente)
                .build();

        clienteRequestDTO = ClienteRequestDTO.builder()
                .nome("Jader")
                .cpf("12345678900")
                .email("jader@email.com")
                .endereco(
                        com.accenture.loja.endereco.dto.EnderecoRequestDTO.builder()
                                .cep("58400-000")
                                .numero("123")
                                .complemento("Apto 1")
                                .build()
                )
                .build();
    }

    @Test
    void deveCriarClienteComSucesso() {

        ViaCepResponseDTO viaCepResponseDTO = ViaCepResponseDTO.builder()
                .cep("58400-000")
                .logradouro("Rua Teste")
                .bairro("Centro")
                .localidade("Campina Grande")
                .uf("PB")
                .build();

        when(clienteRepository.findByCpf(any()))
                .thenReturn(Optional.empty());

        when(clienteRepository.findByEmail(any()))
                .thenReturn(Optional.empty());

        when(viaCepService.buscarCep(any()))
                .thenReturn(viaCepResponseDTO);

        when(clienteRepository.save(any(Cliente.class)))
                .thenReturn(cliente);

        ClienteResponseDTO response =
                clienteService.criarCliente(clienteRequestDTO);

        assertNotNull(response);
        assertEquals("Jader", response.getNome());
        assertEquals("12345678900", response.getCpf());

        verify(clienteRepository, times(1))
                .save(any(Cliente.class));
    }

    @Test
    void deveLancarExcecaoQuandoCpfJaExistir() {

        when(clienteRepository.findByCpf(any()))
                .thenReturn(Optional.of(cliente));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> clienteService.criarCliente(clienteRequestDTO)
        );

        assertEquals("CPF já cadastrado", exception.getMessage());

        verify(clienteRepository, never())
                .save(any());
    }

    @Test
    void deveBuscarClientePorId() {

        when(clienteRepository.findById(1L))
                .thenReturn(Optional.of(cliente));

        ClienteResponseDTO response =
                clienteService.buscarPorId(1L);

        assertNotNull(response);
        assertEquals("Jader", response.getNome());
    }

    @Test
    void deveLancarExcecaoQuandoClienteNaoEncontrado() {

        when(clienteRepository.findById(1L))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> clienteService.buscarPorId(1L)
        );

        assertEquals("Cliente não encontrado", exception.getMessage());
    }

    @Test
    void deveListarClientes() {

        when(clienteRepository.findAll())
                .thenReturn(List.of(cliente));

        List<ClienteResponseDTO> clientes =
                clienteService.listarClientes();

        assertFalse(clientes.isEmpty());
        assertEquals(1, clientes.size());
    }

    @Test
    void deveAtualizarCliente() {

        when(clienteRepository.findById(1L))
                .thenReturn(Optional.of(cliente));

        when(clienteRepository.save(any(Cliente.class)))
                .thenReturn(cliente);

        ClienteResponseDTO response =
                clienteService.atualizarCliente(1L, clienteRequestDTO);

        assertNotNull(response);
        assertEquals("Jader", response.getNome());
    }

    @Test
    void deveDeletarCliente() {

        when(clienteRepository.findById(1L))
                .thenReturn(Optional.of(cliente));

        clienteService.deletarCliente(1L);

        verify(clienteRepository, times(1))
                .delete(cliente);
    }
}