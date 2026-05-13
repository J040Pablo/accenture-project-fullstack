package com.accenture.loja.cliente.controller;

import com.accenture.loja.cliente.dto.ClienteRequestDTO;
import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.service.ClienteService;
import com.accenture.loja.endereco.dto.EnderecoRequestDTO;
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
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ClienteControllerTest {

    @Mock private ClienteService clienteService;

    @InjectMocks
    private ClienteController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private ClienteResponseDTO responseDTO;
    private ClienteRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
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
                .build();

        requestDTO = ClienteRequestDTO.builder()
                .nome("João Silva")
                .cpf("12345678901")
                .email("joao@email.com")
                .endereco(enderecoRequest)
                .build();
    }

    @Test
    void criar_retornaOk() throws Exception {
        when(clienteService.criarCliente(any())).thenReturn(responseDTO);

        mockMvc.perform(post("/api/clientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk());
    }

    @Test
    void listar_retornaOk() throws Exception {
        when(clienteService.listarClientes()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk());
    }

    @Test
    void buscarPorId_retornaOk() throws Exception {
        when(clienteService.buscarPorId(1L)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/clientes/1"))
                .andExpect(status().isOk());
    }

    @Test
    void atualizar_retornaOk() throws Exception {
        when(clienteService.atualizarCliente(eq(1L), any())).thenReturn(responseDTO);

        mockMvc.perform(put("/api/clientes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk());
    }

    @Test
    void deletar_retornaOk() throws Exception {
        doNothing().when(clienteService).deletarCliente(1L);

        mockMvc.perform(delete("/api/clientes/1"))
                .andExpect(status().isOk());
    }
}