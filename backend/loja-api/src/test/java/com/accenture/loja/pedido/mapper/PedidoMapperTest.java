package com.accenture.loja.pedido.mapper;

import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.pedido.model.ItemPedido;
import com.accenture.loja.pedido.dto.PedidoResponseDTO;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.produto.model.Produto;
import com.accenture.loja.shared.enums.StatusPedido;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

    @Test
    void toResponseDTO_comItens_deveMapearItensDoPedido() {
        Cliente cliente = new Cliente();
        cliente.setId(4L);

        Produto produto = new Produto();
        produto.setId(10L);
        produto.setNome("Notebook Dell");

        ItemPedido item = ItemPedido.builder()
                .produto(produto)
                .quantidade(2)
                .precoUnitario(new BigDecimal("3500.00"))
                .subtotal(new BigDecimal("7000.00"))
                .build();

        Pedido pedido = Pedido.builder()
                .idPedido(4L)
                .cliente(cliente)
                .status(StatusPedido.CRIADO)
                .desconto(new BigDecimal("50.00"))
                .totalBruto(new BigDecimal("7000.00"))
                .totalFinal(new BigDecimal("6950.00"))
                .build();
        pedido.adicionarItem(item);

        PedidoResponseDTO dto = mapper.toResponseDTO(pedido);

        assertNotNull(dto.getItens());
        assertEquals(1, dto.getItens().size());
        assertEquals(10L, dto.getItens().get(0).getProdutoId());
        assertEquals("Notebook Dell", dto.getItens().get(0).getNomeProduto());
        assertEquals(2, dto.getItens().get(0).getQuantidade());
        assertEquals(new BigDecimal("3500.00"), dto.getItens().get(0).getPrecoUnitario());
        assertEquals(new BigDecimal("7000.00"), dto.getItens().get(0).getSubtotal());
    }

    @Test
    void toResponseDTO_semItens_deveRetornarListaVazia() {
        Cliente cliente = new Cliente();
        cliente.setId(5L);

        Pedido pedido = Pedido.builder()
                .idPedido(5L)
                .cliente(cliente)
                .status(StatusPedido.CRIADO)
                .desconto(BigDecimal.ZERO)
                .totalBruto(new BigDecimal("0.00"))
                .totalFinal(new BigDecimal("0.00"))
                .itens(List.of())
                .build();

        PedidoResponseDTO dto = mapper.toResponseDTO(pedido);

        assertNotNull(dto.getItens());
        assertTrue(dto.getItens().isEmpty());
    }
}