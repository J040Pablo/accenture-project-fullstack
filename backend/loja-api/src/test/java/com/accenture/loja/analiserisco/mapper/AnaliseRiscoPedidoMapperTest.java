package com.accenture.loja.analiserisco.mapper;

import com.accenture.loja.analiserisco.dto.AnaliseRiscoPedidoResponseDTO;
import com.accenture.loja.analiserisco.model.AnaliseRiscoPedido;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.shared.enums.NivelRisco;
import com.accenture.loja.shared.enums.StatusPedido;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AnaliseRiscoPedidoMapperTest {

    private final AnaliseRiscoPedidoMapper mapper = new AnaliseRiscoPedidoMapper();

    @Test
    void toResponseDTO_comDadosCompletos_retornaDTO() {
        Pedido pedido = new Pedido();
        pedido.setIdPedido(1L);

        AnaliseRiscoPedido analise = AnaliseRiscoPedido.builder()
                .id(1L)
                .pedido(pedido)
            .clienteId(7L)
            .clienteNome("Cliente Teste")
            .valorTotal(new BigDecimal("500.00"))
            .saldoCliente(new BigDecimal("1000.00"))
            .statusPedido(StatusPedido.CRIADO)
                .nivelRisco(NivelRisco.BAIXO)
            .score(15)
            .motivos(List.of("Pedido dentro dos padrões normais"))
                .motivo("Pedido dentro dos padrões normais")
            .recomendacao("Pedido apto para seguir para reserva.")
            .aprovado(true)
                .dataAnalise(LocalDateTime.of(2026, 1, 1, 10, 0))
                .build();

        AnaliseRiscoPedidoResponseDTO dto = mapper.toResponseDTO(analise);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals(1L, dto.getPedidoId());
        assertEquals(7L, dto.getClienteId());
        assertEquals("Cliente Teste", dto.getClienteNome());
        assertEquals(new BigDecimal("500.00"), dto.getValorTotal());
        assertEquals(new BigDecimal("1000.00"), dto.getSaldoCliente());
        assertEquals(StatusPedido.CRIADO, dto.getStatusPedido());
        assertEquals(NivelRisco.BAIXO, dto.getNivelRisco());
        assertEquals(15, dto.getScore());
        assertEquals(List.of("Pedido dentro dos padrões normais"), dto.getMotivos());
        assertEquals("Pedido dentro dos padrões normais", dto.getMotivo());
        assertEquals("Pedido apto para seguir para reserva.", dto.getRecomendacao());
        assertTrue(dto.getAprovado());
        assertEquals(LocalDateTime.of(2026, 1, 1, 10, 0), dto.getDataAnalise());
    }

    @Test
    void toResponseDTO_semPedido_retornaPedidoIdNulo() {
        AnaliseRiscoPedido analise = AnaliseRiscoPedido.builder()
                .id(1L)
                .pedido(null)
                .nivelRisco(NivelRisco.ALTO)
            .score(90)
                .motivo("Teste")
            .aprovado(false)
                .dataAnalise(LocalDateTime.now())
                .build();

        AnaliseRiscoPedidoResponseDTO dto = mapper.toResponseDTO(analise);

        assertNotNull(dto);
        assertNull(dto.getPedidoId());
    }

    @Test
    void toResponseDTO_analiseNula_retornaNull() {
        AnaliseRiscoPedidoResponseDTO dto = mapper.toResponseDTO(null);
        assertNull(dto);
    }

    @Test
    void toResponseDTO_nivelRiscoAlto_mapeiaCorretamente() {
        Pedido pedido = new Pedido();
        pedido.setIdPedido(2L);

        AnaliseRiscoPedido analise = AnaliseRiscoPedido.builder()
                .id(2L)
                .pedido(pedido)
                .nivelRisco(NivelRisco.ALTO)
            .score(90)
                .motivo("Valor acima do limite")
            .aprovado(false)
                .dataAnalise(LocalDateTime.now())
                .build();

        AnaliseRiscoPedidoResponseDTO dto = mapper.toResponseDTO(analise);

        assertEquals(NivelRisco.ALTO, dto.getNivelRisco());
        assertEquals(2L, dto.getPedidoId());
    }

    @Test
    void toResponseDTO_nivelRiscoMedio_mapeiaCorretamente() {
        Pedido pedido = new Pedido();
        pedido.setIdPedido(3L);

        AnaliseRiscoPedido analise = AnaliseRiscoPedido.builder()
                .id(3L)
                .pedido(pedido)
                .nivelRisco(NivelRisco.MEDIO)
            .score(55)
                .motivo("Valor entre limites")
            .aprovado(true)
                .dataAnalise(LocalDateTime.now())
                .build();

        AnaliseRiscoPedidoResponseDTO dto = mapper.toResponseDTO(analise);

        assertEquals(NivelRisco.MEDIO, dto.getNivelRisco());
    }
}