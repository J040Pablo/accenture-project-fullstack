package com.accenture.loja.pedido.controller;

import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.pedido.dto.CancelarPedidoRequestDTO;
import com.accenture.loja.pedido.dto.CriarPedidoRequestDTO;
import com.accenture.loja.pedido.dto.ItemPedidoRequestDTO;
import com.accenture.loja.pedido.dto.PedidoResponseDTO;
import com.accenture.loja.pedido.mapper.PedidoMapper;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.service.PedidoService;
import com.accenture.loja.shared.enums.StatusPedido;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PedidoControllerTest {

    @Mock private PedidoService pedidoService;
    @Mock private PedidoMapper pedidoMapper;

    @InjectMocks
    private PedidoController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Pedido pedido;
    private PedidoResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        Cliente cliente = new Cliente();
        cliente.setId(1L);

        pedido = Pedido.builder()
                .idPedido(1L)
                .cliente(cliente)
                .status(StatusPedido.CRIADO)
                .desconto(BigDecimal.ZERO)
                .totalBruto(new BigDecimal("1000.00"))
                .totalFinal(new BigDecimal("1000.00"))
                .build();

        responseDTO = PedidoResponseDTO.builder()
                .idPedido(1L)
                .clienteId(1L)
                .status("CRIADO")
                .desconto(BigDecimal.ZERO)
                .totalBruto(new BigDecimal("1000.00"))
                .totalFinal(new BigDecimal("1000.00"))
                .build();
    }

    @Test
    void criarPedido_retornaCreated() throws Exception {
        ItemPedidoRequestDTO item = new ItemPedidoRequestDTO();
        item.setProdutoId(1L);
        item.setQuantidade(1);

        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO();
        request.setClienteId(1L);
        request.setItens(List.of(item));

        when(pedidoService.criarPedido(any())).thenReturn(pedido);
        when(pedidoMapper.toResponseDTO(pedido)).thenReturn(responseDTO);

        mockMvc.perform(post("/api/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void listarPedidos_retornaOk() throws Exception {
        when(pedidoService.listarPedidos()).thenReturn(List.of(pedido));
        when(pedidoMapper.toResponseDTO(pedido)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isOk());
    }

    @Test
    void buscarPedidoPorId_retornaOk() throws Exception {
        when(pedidoService.buscarPedidoPorId(1L)).thenReturn(pedido);
        when(pedidoMapper.toResponseDTO(pedido)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/pedidos/1"))
                .andExpect(status().isOk());
    }

    @Test
    void reservarPedido_retornaOk() throws Exception {
        when(pedidoService.reservarPedido(1L)).thenReturn(pedido);
        when(pedidoMapper.toResponseDTO(pedido)).thenReturn(responseDTO);

        mockMvc.perform(post("/api/pedidos/1/reservar"))
                .andExpect(status().isOk());
    }

    @Test
    void pagarPedido_retornaOk() throws Exception {
        when(pedidoService.pagarPedido(1L)).thenReturn(pedido);
        when(pedidoMapper.toResponseDTO(pedido)).thenReturn(responseDTO);

        mockMvc.perform(post("/api/pedidos/1/pagar"))
                .andExpect(status().isOk());
    }

    @Test
    void cancelarPedido_retornaOk() throws Exception {
        CancelarPedidoRequestDTO request = new CancelarPedidoRequestDTO();
        request.setMotivoCancelamento("Desisti");

        when(pedidoService.cancelarPedido(eq(1L), any())).thenReturn(pedido);
        when(pedidoMapper.toResponseDTO(pedido)).thenReturn(responseDTO);

        mockMvc.perform(post("/api/pedidos/1/cancelar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}