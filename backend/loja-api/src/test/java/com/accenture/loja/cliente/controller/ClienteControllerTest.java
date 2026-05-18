package com.accenture.loja.cliente.controller;

import com.accenture.loja.cliente.dto.ClienteRequestDTO;
import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.service.ClienteService;
import com.accenture.loja.endereco.dto.EnderecoRequestDTO;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ClienteControllerTest {

    @Mock
    private ClienteService clienteService;

    @InjectMocks
    private ClienteController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private ClienteResponseDTO responseDTO;
    private ClienteRequestDTO requestDTO;

    @BeforeEach
    void setUp() {

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();

        responseDTO = ClienteResponseDTO.builder()
                .id(1L)
                .nome("João Silva")
                .cpf("12345678901")
                .email("joao@email.com")
                .build();

        EnderecoRequestDTO enderecoRequest = EnderecoRequestDTO.builder()
                .cep("01310100")
                .numero("1000")
                .complemento("Apto 1")
                .build();

        requestDTO = ClienteRequestDTO.builder()
                .nome("João Silva")
                .cpf("12345678901")
                .email("joao@email.com")
                .endereco(enderecoRequest)
                .build();
    }

    @Test
    void criar_retornaClienteCriado() throws Exception {

        when(clienteService.criarCliente(any()))
                .thenReturn(responseDTO);

        mockMvc.perform(post("/api/clientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nome").value("João Silva"))
                .andExpect(jsonPath("$.cpf").value("12345678901"))
                .andExpect(jsonPath("$.email").value("joao@email.com"));

        verify(clienteService).criarCliente(any());
    }

    @Test
    void listar_retornaLista() throws Exception {

        when(clienteService.listarClientes())
                .thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].nome").value("João Silva"))
                .andExpect(jsonPath("$[0].cpf").value("12345678901"))
                .andExpect(jsonPath("$[0].email").value("joao@email.com"));

        verify(clienteService).listarClientes();
    }

    @Test
    void listar_quandoNaoExistiremClientes_retornaListaVazia() throws Exception {

        when(clienteService.listarClientes())
                .thenReturn(List.of());

        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(clienteService).listarClientes();
    }

    @Test
    void buscarPorId_retornaCliente() throws Exception {

        when(clienteService.buscarPorId(1L))
                .thenReturn(responseDTO);

        mockMvc.perform(get("/api/clientes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nome").value("João Silva"))
                .andExpect(jsonPath("$.cpf").value("12345678901"))
                .andExpect(jsonPath("$.email").value("joao@email.com"));

        verify(clienteService).buscarPorId(1L);
    }

    @Test
    void buscarPorId_quandoNaoEncontrado_retornaErro() throws Exception {

        when(clienteService.buscarPorId(99L))
                .thenThrow(new BusinessException("Cliente não encontrado"));

        mockMvc.perform(get("/api/clientes/99"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.erro")
                        .value("Erro de regra de negócio"))
                .andExpect(jsonPath("$.mensagem")
                        .value("Cliente não encontrado"));

        verify(clienteService).buscarPorId(99L);
    }

    @Test
    void atualizar_retornaClienteAtualizado() throws Exception {

        when(clienteService.atualizarCliente(eq(1L), any()))
                .thenReturn(responseDTO);

        mockMvc.perform(put("/api/clientes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nome").value("João Silva"))
                .andExpect(jsonPath("$.cpf").value("12345678901"))
                .andExpect(jsonPath("$.email").value("joao@email.com"));

        verify(clienteService).atualizarCliente(eq(1L), any());
    }

    @Test
    void deletar_retornaOk() throws Exception {

        doNothing().when(clienteService).deletarCliente(1L);

        mockMvc.perform(delete("/api/clientes/1"))
                .andExpect(status().isOk());

        verify(clienteService).deletarCliente(1L);
    }
}