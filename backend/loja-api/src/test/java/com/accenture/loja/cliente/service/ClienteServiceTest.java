package com.accenture.loja.cliente.service;

import com.accenture.loja.cliente.dto.ClienteRequestDTO;
import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.mapper.ClienteMapper;
import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.service.ContaCorrenteService;
import com.accenture.loja.endereco.dto.EnderecoRequestDTO;
import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.service.ViaCepService;
import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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

    @Mock
    private ClienteMapper clienteMapper;

        @Mock
        private ContaCorrenteService contaCorrenteService;

    @InjectMocks
    private ClienteService service;

    private Cliente cliente;
    private ClienteRequestDTO request;
    private ClienteResponseDTO responseDTO;
    private ViaCepResponseDTO viaCepResponse;

    @BeforeEach
    void setUp() {

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
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        cliente = Cliente.builder()
                .id(1L)
                .nome("João Silva")
                .cpf("12345678901")
                .email("joao@email.com")
                .endereco(endereco)
                .contaCorrente(conta)
                .build();

        EnderecoRequestDTO enderecoRequest = EnderecoRequestDTO.builder()
                .cep("01310100")
                .numero("1000")
                .complemento("Apto 1")
                .build();

        request = ClienteRequestDTO.builder()
                .nome("João Silva")
                .cpf("12345678901")
                .email("joao@email.com")
                .endereco(enderecoRequest)
                .build();

        responseDTO = ClienteResponseDTO.builder()
                .id(1L)
                .nome("João Silva")
                .cpf("12345678901")
                .email("joao@email.com")
                .build();

        viaCepResponse = new ViaCepResponseDTO();
        viaCepResponse.setCep("01310-100");
        viaCepResponse.setLogradouro("Avenida Paulista");
        viaCepResponse.setBairro("Bela Vista");
        viaCepResponse.setLocalidade("São Paulo");
        viaCepResponse.setUf("SP");
    }

    @Test
    void criarCliente_comDadosValidos_retornaResponse() {

        when(clienteRepository.findByCpf(any()))
                .thenReturn(Optional.empty());

        when(clienteRepository.findByEmail(any()))
                .thenReturn(Optional.empty());

        when(viaCepService.buscarCep(any()))
                .thenReturn(viaCepResponse);

        when(contaCorrenteService.criarContaPara(any()))
                .thenAnswer(invocation -> ContaCorrente.builder()
                        .id(1L)
                        .numeroConta("12345")
                        .saldo(BigDecimal.ZERO)
                        .tipoTitular(invocation.getArgument(0))
                        .build());

        when(clienteRepository.save(any()))
                .thenReturn(cliente);

        when(clienteMapper.toResponseDTO(any()))
                .thenReturn(responseDTO);

        ClienteResponseDTO resultado =
                service.criarCliente(request);

        assertNotNull(resultado);

        ArgumentCaptor<Cliente> captor =
                ArgumentCaptor.forClass(Cliente.class);

        verify(clienteRepository).save(captor.capture());

        Cliente clienteSalvo = captor.getValue();

        assertAll(
                () -> assertEquals("João Silva", clienteSalvo.getNome()),
                () -> assertEquals(
                        TipoTitularConta.CLIENTE,
                        clienteSalvo.getContaCorrente().getTipoTitular()
                )
        );

        verify(contaCorrenteService).criarContaPara(TipoTitularConta.CLIENTE);
    }

    @Test
    void criarCliente_cpfDuplicado_lancaExcecao() {

        when(clienteRepository.findByCpf(any()))
                .thenReturn(Optional.of(cliente));

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> service.criarCliente(request)
        );

        assertEquals("CPF já cadastrado", ex.getMessage());

        verify(clienteRepository, never()).save(any());
    }

    @Test
    void criarCliente_emailDuplicado_lancaExcecao() {

        when(clienteRepository.findByCpf(any()))
                .thenReturn(Optional.empty());

        when(clienteRepository.findByEmail(any()))
                .thenReturn(Optional.of(cliente));

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> service.criarCliente(request)
        );

        assertEquals("Email já cadastrado", ex.getMessage());
    }

    @Test
    void criarCliente_cepInvalido_lancaExcecao() {

        request.getEndereco().setCep("123");

        when(clienteRepository.findByCpf(any()))
                .thenReturn(Optional.empty());

        when(clienteRepository.findByEmail(any()))
                .thenReturn(Optional.empty());

        assertThrows(
                BusinessException.class,
                () -> service.criarCliente(request)
        );
    }

    @Test
    void criarCliente_cepNaoEncontrado_lancaExcecao() {

        when(clienteRepository.findByCpf(any()))
                .thenReturn(Optional.empty());

        when(clienteRepository.findByEmail(any()))
                .thenReturn(Optional.empty());

        when(viaCepService.buscarCep(any()))
                .thenReturn(null);

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> service.criarCliente(request)
        );

        assertEquals("CEP não encontrado", ex.getMessage());
    }

    @Test
    void criarCliente_viaCepSemCep_lancaExcecao() {

        ViaCepResponseDTO response = new ViaCepResponseDTO();

        when(clienteRepository.findByCpf(any()))
                .thenReturn(Optional.empty());

        when(clienteRepository.findByEmail(any()))
                .thenReturn(Optional.empty());

        when(viaCepService.buscarCep(any()))
                .thenReturn(response);

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> service.criarCliente(request)
        );

        assertEquals("CEP não encontrado", ex.getMessage());
    }

    @Test
    void listarClientes_retornaLista() {

        when(clienteRepository.findAll())
                .thenReturn(List.of(cliente));

        when(clienteMapper.toResponseDTO(any()))
                .thenReturn(responseDTO);

        List<ClienteResponseDTO> resultado =
                service.listarClientes();

        assertEquals(1, resultado.size());

        verify(clienteMapper).toResponseDTO(any());
    }

    @Test
    void listarClientes_listaVazia() {

        when(clienteRepository.findAll())
                .thenReturn(List.of());

        List<ClienteResponseDTO> resultado =
                service.listarClientes();

        assertTrue(resultado.isEmpty());
    }

    @Test
    void buscarPorId_encontrado_retornaResponse() {

        when(clienteRepository.findById(1L))
                .thenReturn(Optional.of(cliente));

        when(clienteMapper.toResponseDTO(cliente))
                .thenReturn(responseDTO);

        ClienteResponseDTO resultado =
                service.buscarPorId(1L);

        assertNotNull(resultado);

        verify(clienteMapper).toResponseDTO(cliente);
    }

    @Test
    void buscarPorId_naoEncontrado_lancaExcecao() {

        when(clienteRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                BusinessException.class,
                () -> service.buscarPorId(99L)
        );
    }

    @Test
    void atualizarCliente_comDadosValidos_retornaAtualizado() {

        when(clienteRepository.findById(1L))
                .thenReturn(Optional.of(cliente));

        when(clienteRepository.save(any()))
                .thenReturn(cliente);

        when(clienteMapper.toResponseDTO(any()))
                .thenReturn(responseDTO);

        ClienteResponseDTO resultado =
                service.atualizarCliente(1L, request);

        assertNotNull(resultado);

        ArgumentCaptor<Cliente> captor =
                ArgumentCaptor.forClass(Cliente.class);

        verify(clienteRepository).save(captor.capture());

        Cliente atualizado = captor.getValue();

        assertEquals(request.getNome(), atualizado.getNome());
        assertEquals(request.getEmail(), atualizado.getEmail());
    }

    @Test
    void atualizarCliente_naoEncontrado_lancaExcecao() {

        when(clienteRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                BusinessException.class,
                () -> service.atualizarCliente(99L, request)
        );
    }

    @Test
    void deletarCliente_encontrado_deletaComSucesso() {

        when(clienteRepository.findById(1L))
                .thenReturn(Optional.of(cliente));

        service.deletarCliente(1L);

        verify(clienteRepository).delete(cliente);
    }

    @Test
    void deletarCliente_naoEncontrado_lancaExcecao() {

        when(clienteRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                BusinessException.class,
                () -> service.deletarCliente(99L)
        );
    }
}