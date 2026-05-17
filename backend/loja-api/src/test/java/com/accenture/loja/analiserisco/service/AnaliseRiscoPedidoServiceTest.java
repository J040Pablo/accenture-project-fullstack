package com.accenture.loja.analiserisco.service;

import com.accenture.loja.analiserisco.dto.AnaliseRiscoPedidoResponseDTO;
import com.accenture.loja.analiserisco.mapper.AnaliseRiscoPedidoMapper;
import com.accenture.loja.analiserisco.model.AnaliseRiscoPedido;
import com.accenture.loja.analiserisco.repository.AnaliseRiscoPedidoRepository;
import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.pedido.model.ItemPedido;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.repository.PedidoRepository;
import com.accenture.loja.shared.enums.NivelRisco;
import com.accenture.loja.shared.enums.StatusPedido;
import com.accenture.loja.shared.enums.TipoTitularConta;
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
import java.time.LocalTime;
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
        private Cliente cliente;
        private ContaCorrente contaCorrente;
    private AnaliseRiscoPedido analise;
    private AnaliseRiscoPedidoResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        contaCorrente = ContaCorrente.builder()
            .id(10L)
            .numeroConta("123456")
            .saldo(new BigDecimal("1000.00"))
            .tipoTitular(TipoTitularConta.CLIENTE)
            .build();

        cliente = Cliente.builder()
            .id(7L)
            .nome("Cliente Teste")
            .contaCorrente(contaCorrente)
            .build();

        pedido = new Pedido();
        pedido.setIdPedido(1L);
        pedido.setTotalFinal(BigDecimal.valueOf(500));
        pedido.setStatus(StatusPedido.CRIADO);
        pedido.setCliente(cliente);
        pedido.setItens(List.of(itemComQuantidade(1)));

        analise = AnaliseRiscoPedido.builder()
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
                .dataAnalise(LocalDateTime.now())
                .build();

        responseDTO = AnaliseRiscoPedidoResponseDTO.builder()
                .id(1L)
                .pedidoId(1L)
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
                .dataAnalise(LocalDateTime.now())
                .build();
    }

    @Test
    void analisarRisco_riscoAlto_valorAcimaLimite() {
        pedido.setTotalFinal(new BigDecimal("15000.00"));
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        AnaliseRiscoPedidoResponseDTO result = service.analisarRisco(1L);

        assertNotNull(result);
        verify(analiseRiscoPedidoRepository).save(argThat(a ->
            a.getNivelRisco() == NivelRisco.ALTO &&
                a.getMotivos().contains("Valor do pedido acima de R$ 10.000,00")
        ));
    }

    @Test
    void analisarRisco_riscoMedio_valorEntreLimites() {
        pedido.setTotalFinal(new BigDecimal("5000.00"));
        // garantir saldo suficiente para não acionar regra de risco por saldo insuficiente
        contaCorrente.setSaldo(new BigDecimal("10000.00"));
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        service.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
            a.getNivelRisco() == NivelRisco.MEDIO &&
                a.getMotivos().contains("Valor do pedido entre R$ 3.000,00 e R$ 10.000,00")
        ));
    }

    @Test
    void analisarRisco_riscoMedio_itensAtipicos() {
        pedido.setTotalFinal(new BigDecimal("500.00"));
        pedido.setItens(List.of(itemComQuantidade(51)));

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        service.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
            a.getNivelRisco() == NivelRisco.MEDIO &&
                a.getMotivos().stream().anyMatch(m -> m.contains("Quantidade de itens atípica"))
        ));
    }

    @Test
    void analisarRisco_riscoBaixo_pedidoNormal() {
        pedido.setTotalFinal(new BigDecimal("500.00"));
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        service.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
            a.getNivelRisco() == NivelRisco.BAIXO &&
                a.getMotivos().contains("Pedido dentro dos padrões normais")
        ));
    }

        @Test
        void analisarRisco_riscoAlto_saldoInsuficiente() {
        pedido.setTotalFinal(new BigDecimal("1500.00"));
        contaCorrente.setSaldo(new BigDecimal("1000.00"));

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        service.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
            a.getNivelRisco() == NivelRisco.ALTO &&
                a.getMotivos().stream().anyMatch(m -> m.contains("Saldo insuficiente"))
        ));
        }

        @Test
        void analisarRisco_riscoAlto_semItens() {
        pedido.setItens(List.of());

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        service.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
            a.getNivelRisco() == NivelRisco.ALTO &&
                a.getMotivos().contains("Pedido sem itens")
        ));
        }

        @Test
        void analisarRisco_riscoAlto_pedidoCancelado() {
        pedido.setStatus(StatusPedido.CANCELADO);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        service.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
            a.getNivelRisco() == NivelRisco.ALTO &&
                a.getMotivos().contains("Pedido cancelado")
        ));
        }

        @Test
        void analisarRisco_riscoAlto_semContaCorrente() {
        cliente.setContaCorrente(null);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        service.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
            a.getNivelRisco() == NivelRisco.ALTO &&
                a.getMotivos().contains("Cliente sem conta corrente")
        ));
        }

    @Test
    void analisarRisco_riscoAlto_madrugada() {
        pedido.setTotalFinal(new BigDecimal("500.00"));
        pedido.setItens(List.of(itemComQuantidade(1)));

        AnaliseRiscoPedidoService spyService = spy(service);
        doReturn(LocalTime.of(1, 0)).when(spyService).horaAtual();

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        spyService.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
            a.getNivelRisco() == NivelRisco.ALTO &&
                a.getMotivos().contains("Compra realizada em horário de madrugada (00h–06h)")
        ));
    }

    @Test
    void analisarRisco_riscoBaixo_meiaNoite() {
        pedido.setTotalFinal(new BigDecimal("500.00"));
        pedido.setItens(List.of(itemComQuantidade(1)));

        AnaliseRiscoPedidoService spyService = spy(service);
        doReturn(LocalTime.of(0, 0)).when(spyService).horaAtual();

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(analiseRiscoPedidoRepository.findByPedidoIdPedido(1L)).thenReturn(Optional.empty());
        when(analiseRiscoPedidoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(analiseRiscoPedidoMapper.toResponseDTO(any())).thenReturn(responseDTO);

        spyService.analisarRisco(1L);

        verify(analiseRiscoPedidoRepository).save(argThat(a ->
            a.getNivelRisco() == NivelRisco.BAIXO &&
                a.getMotivos().contains("Pedido dentro dos padrões normais")
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

    private ItemPedido itemComQuantidade(int quantidade) {
        ItemPedido item = new ItemPedido();
        item.setQuantidade(quantidade);
        return item;
    }
}