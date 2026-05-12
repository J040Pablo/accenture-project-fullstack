package com.accenture.loja.cliente.controller;

import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.service.ClienteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ClienteControllerTest {

    private MockMvc mockMvc;

    private ClienteService clienteService;

    @BeforeEach
    void setup() {

        clienteService = Mockito.mock(ClienteService.class);

        ClienteController controller =
                new ClienteController(clienteService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .build();
    }

    @Test
    void deveListarClientes() throws Exception {

        ClienteResponseDTO cliente =
                ClienteResponseDTO.builder()
                        .id(1L)
                        .nome("Jader")
                        .cpf("12345678900")
                        .build();

        when(clienteService.listarClientes())
                .thenReturn(List.of(cliente));

        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id")
                        .value(1))
                .andExpect(jsonPath("$[0].nome")
                        .value("Jader"));
    }
}