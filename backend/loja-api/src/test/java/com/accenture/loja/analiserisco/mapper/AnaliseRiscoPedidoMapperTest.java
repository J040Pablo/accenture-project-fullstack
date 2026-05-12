package com.accenture.loja.analiserisco.mapper;

import com.accenture.loja.analiserisco.dto.AnaliseRiscoPedidoResponseDTO;
import com.accenture.loja.analiserisco.model.AnaliseRiscoPedido;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.shared.enums.NivelRisco;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

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
                .nivelRisco(NivelRisco.BAIXO)
                .motivo("Pedido dentro dos padrões normais")
                .dataAnalise(LocalDateTime.of(2026, 1, 1, 10, 0))
                .build();

        AnaliseRiscoPedidoResponseDTO dto = mapper.toResponseDTO(analise);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals(1L, dto.getPedidoId());
        assertEquals(NivelRisco.BAIXO, dto.getNivelRisco());
        assertEquals("Pedido dentro dos padrões normais", dto.getMotivo());
        assertEquals(LocalDateTime.of(2026, 1, 1, 10, 0), dto.getDataAnalise());
    }

    @Test
    void toResponseDTO_semPedido_retornaPedidoIdNulo() {
        AnaliseRiscoPedido analise = AnaliseRiscoPedido.builder()
                .id(1L)
                .pedido(null)
                .nivelRisco(NivelRisco.ALTO)
                .motivo("Teste")
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
                .motivo("Valor acima do limite")
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
                .motivo("Valor entre limites")
                .dataAnalise(LocalDateTime.now())
                .build();

        AnaliseRiscoPedidoResponseDTO dto = mapper.toResponseDTO(analise);

        assertEquals(NivelRisco.MEDIO, dto.getNivelRisco());
    }
}