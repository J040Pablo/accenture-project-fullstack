package com.accenture.loja.pedido.service;

import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.service.ContaCorrenteService;
import com.accenture.loja.movimentacao.service.MovimentacaoContaService;
import com.accenture.loja.pedido.dto.CriarPedidoRequestDTO;
import com.accenture.loja.pedido.dto.ItemPedidoRequestDTO;
import com.accenture.loja.pedido.model.ItemPedido;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.repository.PedidoRepository;
import com.accenture.loja.produto.model.Produto;
import com.accenture.loja.produto.repository.ProdutoRepository;
import com.accenture.loja.shared.enums.StatusPedido;
import com.accenture.loja.shared.exception.RegraNegocioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock private PedidoRepository pedidoRepository;
    @Mock private ClienteRepository clienteRepository;
    @Mock private ProdutoRepository produtoRepository;
    @Mock private ContaCorrenteService contaCorrenteService;
    @Mock private MovimentacaoContaService movimentacaoContaService;

    @InjectMocks
    private PedidoService service;

    private Cliente cliente;
    private ContaCorrente contaCliente;
    private ContaCorrente contaEmpresa;
    private Produto produto;
    private Pedido pedido;

    @BeforeEach
    void setUp() {
        contaCliente = new ContaCorrente();
        contaCliente.setId(1L);
        contaCliente.setSaldo(new BigDecimal("5000.00"));

        contaEmpresa = new ContaCorrente();
        contaEmpresa.setId(2L);
        contaEmpresa.setSaldo(new BigDecimal("10000.00"));

        cliente = new Cliente();
        cliente.setId(1L);
        cliente.setContaCorrente(contaCliente);

        produto = new Produto();
        produto.setId(1L);
        produto.setNome("Notebook");
        produto.setPreco(new BigDecimal("1000.00"));
        produto.setEstoque(10);
        produto.setAtivo(true);

        pedido = Pedido.builder()
                .idPedido(1L)
                .cliente(cliente)
                .status(StatusPedido.CRIADO)
                .desconto(BigDecimal.ZERO)
                .totalBruto(new BigDecimal("1000.00"))
                .totalFinal(new BigDecimal("1000.00"))
                .itens(new ArrayList<>())
                .build();
    }

    @Test
    void buscarPedidoPorId_encontrado_retornaPedido() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        Pedido resultado = service.buscarPedidoPorId(1L);
        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdPedido());
    }

    @Test
    void buscarPedidoPorId_naoEncontrado_lancaExcecao() {
        when(pedidoRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RegraNegocioException.class, () -> service.buscarPedidoPorId(99L));
    }

    @Test
    void listarPedidos_retornaLista() {
        when(pedidoRepository.findAll()).thenReturn(List.of(pedido));
        List<Pedido> resultado = service.listarPedidos();
        assertEquals(1, resultado.size());
    }

    @Test
    void criarPedido_comDadosValidos_criaPedido() {
        ItemPedidoRequestDTO itemDto = new ItemPedidoRequestDTO();
        itemDto.setProdutoId(1L);
        itemDto.setQuantidade(2);

        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO();
        request.setClienteId(1L);
        request.setDesconto(BigDecimal.ZERO);
        request.setItens(List.of(itemDto));

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(pedidoRepository.save(any())).thenReturn(pedido);

        Pedido resultado = service.criarPedido(request);
        assertNotNull(resultado);
        verify(pedidoRepository).save(any());
    }

    @Test
    void criarPedido_semItens_lancaExcecao() {
        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO();
        request.setClienteId(1L);
        request.setItens(List.of());
        assertThrows(RegraNegocioException.class, () -> service.criarPedido(request));
    }

    @Test
    void criarPedido_clienteNaoEncontrado_lancaExcecao() {
        ItemPedidoRequestDTO itemDto = new ItemPedidoRequestDTO();
        itemDto.setProdutoId(1L);
        itemDto.setQuantidade(1);

        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO();
        request.setClienteId(99L);
        request.setItens(List.of(itemDto));

        when(clienteRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RegraNegocioException.class, () -> service.criarPedido(request));
    }

    @Test
    void criarPedido_produtoInativo_lancaExcecao() {
        produto.setAtivo(false);

        ItemPedidoRequestDTO itemDto = new ItemPedidoRequestDTO();
        itemDto.setProdutoId(1L);
        itemDto.setQuantidade(1);

        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO();
        request.setClienteId(1L);
        request.setItens(List.of(itemDto));

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        assertThrows(RegraNegocioException.class, () -> service.criarPedido(request));
    }

    @Test
    void criarPedido_estoqueInsuficiente_lancaExcecao() {
        produto.setEstoque(1);

        ItemPedidoRequestDTO itemDto = new ItemPedidoRequestDTO();
        itemDto.setProdutoId(1L);
        itemDto.setQuantidade(5);

        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO();
        request.setClienteId(1L);
        request.setItens(List.of(itemDto));

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        assertThrows(RegraNegocioException.class, () -> service.criarPedido(request));
    }

    @Test
    void reservarPedido_statusCriado_reservaComSucesso() {
        ItemPedido item = new ItemPedido();
        item.setProduto(produto);
        item.setQuantidade(1);
        pedido.getItens().add(item);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any())).thenReturn(pedido);

        Pedido resultado = service.reservarPedido(1L);
        assertEquals(StatusPedido.RESERVADO, resultado.getStatus());
    }

    @Test
    void reservarPedido_statusInvalido_lancaExcecao() {
        pedido.setStatus(StatusPedido.PAGO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        assertThrows(RegraNegocioException.class, () -> service.reservarPedido(1L));
    }

    @Test
    void reservarPedido_semItens_lancaExcecao() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        assertThrows(RegraNegocioException.class, () -> service.reservarPedido(1L));
    }

    @Test
    void pagarPedido_comSaldoSuficiente_pagaComSucesso() {
        pedido.setStatus(StatusPedido.RESERVADO);
        pedido.setTotalFinal(new BigDecimal("1000.00"));

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);
        when(pedidoRepository.save(any())).thenReturn(pedido);

        Pedido resultado = service.pagarPedido(1L);
        assertEquals(StatusPedido.PAGO, resultado.getStatus());
        verify(contaCorrenteService).transferir(any(), any(), any());
    }

    @Test
    void pagarPedido_statusInvalido_lancaExcecao() {
        pedido.setStatus(StatusPedido.CRIADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(1L));
    }

    @Test
    void pagarPedido_saldoInsuficiente_lancaExcecao() {
        pedido.setStatus(StatusPedido.RESERVADO);
        pedido.setTotalFinal(new BigDecimal("9000.00"));
        contaCliente.setSaldo(new BigDecimal("100.00"));

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);
        assertThrows(RegraNegocioException.class, () -> service.pagarPedido(1L));
    }

    @Test
    void cancelarPedido_statusCriado_cancelaComSucesso() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any())).thenReturn(pedido);

        Pedido resultado = service.cancelarPedido(1L, "Desisti da compra");
        assertEquals(StatusPedido.CANCELADO, resultado.getStatus());
    }

    @Test
    void cancelarPedido_semMotivo_lancaExcecao() {
        assertThrows(RegraNegocioException.class, () -> service.cancelarPedido(1L, ""));
    }

    @Test
    void cancelarPedido_motivoNulo_lancaExcecao() {
        assertThrows(RegraNegocioException.class, () -> service.cancelarPedido(1L, null));
    }

    @Test
    void cancelarPedido_statusReservado_devolveEstoque() {
        // cenário: produto com estoque inicial 5, item com quantidade 3
        produto.setEstoque(5);
        pedido.setStatus(StatusPedido.RESERVADO);
        ItemPedido item = new ItemPedido();
        item.setProduto(produto);
        item.setQuantidade(3);
        pedido.getItens().add(item);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> i.getArguments()[0]);

        Pedido resultado = service.cancelarPedido(1L, "Produto errado");

        assertEquals(StatusPedido.CANCELADO, resultado.getStatus());
        // estoque inicial 5 + 3 devolvidos = 8
        assertEquals(8, produto.getEstoque());
        verify(produtoRepository).save(produto);
        verify(pedidoRepository).save(pedido);
    }

    @Test
    void cancelarPedido_statusPago_estornaEDevolveEstoque() {
        pedido.setStatus(StatusPedido.PAGO);
        pedido.setTotalFinal(new BigDecimal("1000.00"));
        ItemPedido item = new ItemPedido();
        item.setProduto(produto);
        item.setQuantidade(1);
        pedido.getItens().add(item);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);
        when(pedidoRepository.save(any())).thenReturn(pedido);

        Pedido resultado = service.cancelarPedido(1L, "Arrependimento");
        assertEquals(StatusPedido.CANCELADO, resultado.getStatus());
        verify(contaCorrenteService).transferir(any(), any(), any());
    }

    @Test
    void criarPedido_quantidadeNull_lancaExcecao() {
        ItemPedidoRequestDTO itemDto = new ItemPedidoRequestDTO();
        itemDto.setProdutoId(1L);
        itemDto.setQuantidade(null);

        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO();
        request.setClienteId(1L);
        request.setItens(List.of(itemDto));

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));

        assertThrows(RegraNegocioException.class,
                () -> service.criarPedido(request));
    }

    @Test
    void criarPedido_quantidadeZero_lancaExcecao() {
        ItemPedidoRequestDTO itemDto = new ItemPedidoRequestDTO();
        itemDto.setProdutoId(1L);
        itemDto.setQuantidade(0);

        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO();
        request.setClienteId(1L);
        request.setItens(List.of(itemDto));

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));

        assertThrows(RegraNegocioException.class,
                () -> service.criarPedido(request));
    }

    @Test
    void criarPedido_produtoNaoEncontrado_lancaExcecao() {
        ItemPedidoRequestDTO itemDto = new ItemPedidoRequestDTO();
        itemDto.setProdutoId(99L);
        itemDto.setQuantidade(1);

        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO();
        request.setClienteId(1L);
        request.setItens(List.of(itemDto));

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RegraNegocioException.class,
                () -> service.criarPedido(request));
    }

    @Test
    void criarPedido_descontoMaiorQueTotal_defineZero() {
        ItemPedidoRequestDTO itemDto = new ItemPedidoRequestDTO();
        itemDto.setProdutoId(1L);
        itemDto.setQuantidade(1);

        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO();
        request.setClienteId(1L);
        request.setDesconto(new BigDecimal("99999"));
        request.setItens(List.of(itemDto));

        Pedido pedidoSalvo = Pedido.builder()
                .totalFinal(BigDecimal.ZERO)
                .build();

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(pedidoRepository.save(any())).thenReturn(pedidoSalvo);

        Pedido resultado = service.criarPedido(request);

        assertEquals(BigDecimal.ZERO, resultado.getTotalFinal());
    }

    @Test
    void reservarPedido_produtoNull_lancaExcecao() {
        ItemPedido item = new ItemPedido();
        item.setProduto(null);
        item.setQuantidade(1);

        pedido.getItens().add(item);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class,
                () -> service.reservarPedido(1L));
    }

    @Test
    void reservarPedido_produtoInativo_lancaExcecao() {
        produto.setAtivo(false);

        ItemPedido item = new ItemPedido();
        item.setProduto(produto);
        item.setQuantidade(1);

        pedido.getItens().add(item);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class,
                () -> service.reservarPedido(1L));
    }

    @Test
    void reservarPedido_estoqueInsuficiente_lancaExcecao() {
        produto.setEstoque(0);

        ItemPedido item = new ItemPedido();
        item.setProduto(produto);
        item.setQuantidade(5);

        pedido.getItens().add(item);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class,
                () -> service.reservarPedido(1L));
    }

    @Test
    void cancelarPedido_statusInvalido_lancaExcecao() {
        pedido.setStatus(StatusPedido.CANCELADO);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class,
                () -> service.cancelarPedido(1L, "teste"));
    }

    @Test
    void deletarPedido_comSucesso() {
        pedido.setStatus(StatusPedido.CRIADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertDoesNotThrow(() -> service.deletarPedido(1L));

        verify(pedidoRepository, times(1)).delete(pedido);
    }

    @Test
    void deletarPedido_pago_lancaExcecao() {
        pedido.setStatus(StatusPedido.PAGO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        RegraNegocioException exception = assertThrows(RegraNegocioException.class,
                () -> service.deletarPedido(1L));

        assertEquals("Não é possível deletar um pedido que gerou movimentações financeiras", exception.getMessage());
        verify(pedidoRepository, never()).delete(any());
    }

    @Test
    void deletarPedido_cancelado_lancaExcecao() {
        pedido.setStatus(StatusPedido.CANCELADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class, () -> service.deletarPedido(1L));
        verify(pedidoRepository, never()).delete(any());
    }

    @Test
    void deletarPedido_naoEncontrado_lancaExcecao() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RegraNegocioException.class, () -> service.deletarPedido(1L));
        verify(pedidoRepository, never()).delete(any());
    }

    @Test
    void testFluxoCompleto_PedidoSucesso() {
        ItemPedidoRequestDTO itemDto = new ItemPedidoRequestDTO();
        itemDto.setProdutoId(1L);
        itemDto.setQuantidade(2);
        CriarPedidoRequestDTO request = new CriarPedidoRequestDTO();
        request.setClienteId(1L);
        request.setItens(List.of(itemDto));

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> i.getArguments()[0]);

        Pedido pedidoCriado = service.criarPedido(request);
        assertEquals(StatusPedido.CRIADO, pedidoCriado.getStatus());

        ItemPedido item = new ItemPedido();
        item.setProduto(produto);
        item.setQuantidade(2);
        pedidoCriado.setItens(List.of(item));

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoCriado));
        Pedido pedidoReservado = service.reservarPedido(1L);
        assertEquals(StatusPedido.RESERVADO, pedidoReservado.getStatus());

        when(contaCorrenteService.buscarContaEmpresa()).thenReturn(contaEmpresa);
        Pedido pedidoPago = service.pagarPedido(1L);
        assertEquals(StatusPedido.PAGO, pedidoPago.getStatus());
        verify(contaCorrenteService).transferir(any(), any(), any());

        Pedido pedidoCancelado = service.cancelarPedido(1L, "Cancelamento do fluxo");
        assertEquals(StatusPedido.CANCELADO, pedidoCancelado.getStatus());
        verify(contaCorrenteService, times(2)).transferir(any(), any(), any());
    }
}