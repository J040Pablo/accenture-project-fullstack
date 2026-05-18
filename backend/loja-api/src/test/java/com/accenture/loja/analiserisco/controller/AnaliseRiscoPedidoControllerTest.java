package com.accenture.loja.analiserisco.controller;

import com.accenture.loja.analiserisco.dto.AnaliseRiscoPedidoResponseDTO;
import com.accenture.loja.analiserisco.service.AnaliseRiscoPedidoService;
import com.accenture.loja.shared.enums.NivelRisco;
import com.accenture.loja.shared.exception.GlobalExceptionHandler;
import com.accenture.loja.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AnaliseRiscoPedidoControllerTest {

    @Mock
    private AnaliseRiscoPedidoService service;

    @InjectMocks
    private AnaliseRiscoPedidoController controller;

    private MockMvc mockMvc;
    private AnaliseRiscoPedidoResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

        responseDTO = AnaliseRiscoPedidoResponseDTO.builder()
                .id(1L)
                .pedidoId(1L)
                .nivelRisco(NivelRisco.BAIXO)
                .motivo("Pedido dentro dos padrões normais")
                .dataAnalise(LocalDateTime.now())
                .build();
    }

    @Test
    void analisarRisco_retornaOk() throws Exception {
        when(service.analisarRisco(1L)).thenReturn(responseDTO);

        mockMvc.perform(post("/api/pedidos/1/analisar-risco")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(service).analisarRisco(1L);
    }

    @Test
    void buscarAnalise_retornaOk() throws Exception {
        when(service.buscarPorPedido(1L)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/pedidos/1/analise-risco")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(service).buscarPorPedido(1L);
    }

    @Test
    void analisarRisco_pedidoNaoEncontrado_retorna404() throws Exception {
        when(service.analisarRisco(99L)).thenThrow(new ResourceNotFoundException("Pedido não encontrado: 99"));

        mockMvc.perform(post("/api/pedidos/99/analisar-risco")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}