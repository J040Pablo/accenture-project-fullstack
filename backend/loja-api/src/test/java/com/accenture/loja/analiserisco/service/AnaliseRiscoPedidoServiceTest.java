package com.accenture.loja.analiserisco.service;

import com.accenture.loja.analiserisco.dto.AnaliseRiscoPedidoResponseDTO;
import com.accenture.loja.analiserisco.mapper.AnaliseRiscoPedidoMapper;
import com.accenture.loja.analiserisco.model.AnaliseRiscoPedido;
import com.accenture.loja.analiserisco.repository.AnaliseRiscoPedidoRepository;
import com.accenture.loja.pedido.model.ItemPedido;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.repository.PedidoRepository;
import com.accenture.loja.shared.enums.NivelRisco;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnaliseRiscoPedidoServiceTest {

    @Mock
    private AnaliseRiscoPedidoRepository analiseRiscoPedidoRepository;

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private AnaliseRiscoPedidoMapper analiseRiscoPedidoMapper;

    @InjectMocks
    private AnaliseRiscoPedidoService service;

    private Pedido pedido;
    private AnaliseRiscoPedido analise;
    private AnaliseRiscoPedidoResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        pedido = new Pedido();
        pedido.setIdPedido(1L);
        pedido.setTotalFinal(BigDecimal.valueOf(500));
        pedido.setItens(List.of());

        analise = AnaliseRiscoPedido.builder()
                .id(1L)
                .pedido(pedido)
                .nivelRisco(NivelRisco.BAIXO)
                .motivo("Pedido dentro dos padrões normais")
                .dataAnalise(LocalDateTime.now())
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
    void analisarRisco_riscoAlto_valorAcimaLimite() {
        pedido.setTotalFinal(new BigDecimal("15000.00"));
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenReturn(analise);
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        AnaliseRiscoPedidoResponseDTO result = service.analisarRisco(1L);

        assertNotNull(result);
        verify(analiseRiscoPedidoRepository).save(argThat(a ->
                a.getNivelRisco() == NivelRisco.ALTO &&
                        a.getMotivo().equals("Valor do pedido acima de R$ 10.000,00")
        ));
    }

    @Test
    void analisarRisco_riscoMedio_valorEntreLimites() {
        pedido.setTotalFinal(new BigDecimal("5000.00"));
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenReturn(analise);
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        service.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
                a.getNivelRisco() == NivelRisco.MEDIO &&
                        a.getMotivo().equals("Valor do pedido entre R$ 3.000,00 e R$ 10.000,00")
        ));
    }

    @Test
    void analisarRisco_riscoMedio_itensAtipicos() {
        pedido.setTotalFinal(new BigDecimal("500.00"));
        ItemPedido item = new ItemPedido();
        item.setQuantidade(51);
        pedido.setItens(List.of(item));

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenReturn(analise);
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        service.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
                a.getNivelRisco() == NivelRisco.MEDIO &&
                        a.getMotivo().contains("Quantidade de itens atípica")
        ));
    }

    @Test
    void analisarRisco_riscoBaixo_pedidoNormal() {
        pedido.setTotalFinal(new BigDecimal("500.00"));
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenReturn(analise);
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        service.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
                a.getNivelRisco() == NivelRisco.BAIXO &&
                        a.getMotivo().equals("Pedido dentro dos padrões normais")
        ));
    }

    @Test
    void analisarRisco_pedidoNaoEncontrado_lancaExcecao() {
        when(pedidoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.analisarRisco(99L));
    }

    @Test
    void analisarRisco_pedidoJaAnalisado_lancaBusinessException() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.of(analise));

        assertThrows(BusinessException.class, () -> service.analisarRisco(1L));
    }

    @Test
    void buscarPorPedido_encontrado_retornaDTO() {
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.of(analise));
        when(analiseRiscoPedidoMapper.toResponseDTO(analise)).thenReturn(responseDTO);

        AnaliseRiscoPedidoResponseDTO result = service.buscarPorPedido(1L);

        assertNotNull(result);
        verify(analiseRiscoPedidoMapper).toResponseDTO(analise);
    }

    @Test
    void buscarPorPedido_naoEncontrado_lancaExcecao() {
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.buscarPorPedido(99L));
    }
}