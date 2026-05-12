package com.accenture.loja.pedido.mapper;

import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.pedido.dto.PedidoResponseDTO;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.shared.enums.StatusPedido;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class PedidoMapperTest {

    private final PedidoMapper mapper = new PedidoMapper();

    @Test
    void toResponseDTO_comDadosCompletos_retornaDTO() {
        Cliente cliente = new Cliente();
        cliente.setId(1L);

        Pedido pedido = Pedido.builder()
                .idPedido(1L)
                .cliente(cliente)
                .status(StatusPedido.CRIADO)
                .desconto(BigDecimal.ZERO)
                .totalBruto(new BigDecimal("1000.00"))
                .totalFinal(new BigDecimal("1000.00"))
                .dataCriacao(LocalDateTime.of(2026, 1, 1, 10, 0))
                .build();

        PedidoResponseDTO dto = mapper.toResponseDTO(pedido);

        assertNotNull(dto);
        assertEquals(1L, dto.getIdPedido());
        assertEquals(1L, dto.getClienteId());
        assertEquals("CRIADO", dto.getStatus());
        assertEquals(BigDecimal.ZERO, dto.getDesconto());
        assertEquals(new BigDecimal("1000.00"), dto.getTotalFinal());
    }

    @Test
    void toResponseDTO_pedidoNulo_retornaNull() {
        PedidoResponseDTO dto = mapper.toResponseDTO(null);
        assertNull(dto);
    }

    @Test
    void toResponseDTO_statusPago_mapeiaCorretamente() {
        Cliente cliente = new Cliente();
        cliente.setId(2L);

        Pedido pedido = Pedido.builder()
                .idPedido(2L)
                .cliente(cliente)
                .status(StatusPedido.PAGO)
                .desconto(new BigDecimal("100.00"))
                .totalBruto(new BigDecimal("1100.00"))
                .totalFinal(new BigDecimal("1000.00"))
                .dataPagamento(LocalDateTime.of(2026, 1, 2, 10, 0))
                .build();

        PedidoResponseDTO dto = mapper.toResponseDTO(pedido);

        assertEquals("PAGO", dto.getStatus());
        assertEquals(new BigDecimal("100.00"), dto.getDesconto());
        assertEquals(LocalDateTime.of(2026, 1, 2, 10, 0), dto.getDataPagamento());
    }

    @Test
    void toResponseDTO_statusCancelado_mapeiaCorretamente() {
        Cliente cliente = new Cliente();
        cliente.setId(3L);

        Pedido pedido = Pedido.builder()
                .idPedido(3L)
                .cliente(cliente)
                .status(StatusPedido.CANCELADO)
                .desconto(BigDecimal.ZERO)
                .totalBruto(new BigDecimal("500.00"))
                .totalFinal(new BigDecimal("500.00"))
                .motivoCancelamento("Desisti")
                .dataCancelamento(LocalDateTime.of(2026, 1, 3, 10, 0))
                .build();

        PedidoResponseDTO dto = mapper.toResponseDTO(pedido);

        assertEquals("CANCELADO", dto.getStatus());
        assertEquals("Desisti", dto.getMotivoCancelamento());
        assertEquals(LocalDateTime.of(2026, 1, 3, 10, 0), dto.getDataCancelamento());
    }
}