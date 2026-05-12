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
import com.accenture.loja.shared.enums.TipoMovimentacao;
import com.accenture.loja.shared.exception.RegraNegocioException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepository;
    private final ContaCorrenteService contaCorrenteService;
    private final MovimentacaoContaService movimentacaoContaService;

    @Transactional
    public Pedido criarPedido(CriarPedidoRequestDTO request) {
        if (request.getItens() == null || request.getItens().isEmpty()) {
            throw new RegraNegocioException("O pedido precisa ter pelo menos um item.");
        }

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RegraNegocioException("Cliente não encontrado."));

        Pedido pedido = Pedido.builder()
                .cliente(cliente)
                .status(StatusPedido.CRIADO)
                .dataCriacao(LocalDateTime.now())
                .desconto(request.getDesconto() != null ? request.getDesconto() : BigDecimal.ZERO)
                .build();

        BigDecimal totalBruto = BigDecimal.ZERO;

        for (ItemPedidoRequestDTO itemDto : request.getItens()) {
            if (itemDto.getQuantidade() == null || itemDto.getQuantidade() <= 0) {
                throw new RegraNegocioException("A quantidade de cada item deve ser maior que zero.");
            }

            Produto produto = produtoRepository.findById(itemDto.getProdutoId())
                    .orElseThrow(() -> new RegraNegocioException("Produto não encontrado."));

            BigDecimal precoUnitario = produto.getPreco();
            BigDecimal subtotal = precoUnitario.multiply(BigDecimal.valueOf(itemDto.getQuantidade()));

            ItemPedido item = ItemPedido.builder()
                    .produto(produto)
                    .quantidade(itemDto.getQuantidade())
                    .precoUnitario(precoUnitario)
                    .subtotal(subtotal)
                    .build();

            pedido.adicionarItem(item);
            totalBruto = totalBruto.add(subtotal);
        }

        pedido.setTotalBruto(totalBruto);

        BigDecimal totalFinal = totalBruto.subtract(pedido.getDesconto());

        if (totalFinal.compareTo(BigDecimal.ZERO) < 0) {
            totalFinal = BigDecimal.ZERO;
        }

        pedido.setTotalFinal(totalFinal);

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido reservarPedido(Long idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RegraNegocioException("Pedido não encontrado."));

        if (!StatusPedido.CRIADO.equals(pedido.getStatus())) {
            throw new RegraNegocioException("Apenas pedidos no status CRIADO podem ser reservados.");
        }

        if (pedido.getItens() == null || pedido.getItens().isEmpty()) {
            throw new RegraNegocioException("Não é possível reservar um pedido sem itens.");
        }

        for (ItemPedido item : pedido.getItens()) {
            Produto produto = item.getProduto();

            if (produto == null) {
                throw new RegraNegocioException("Produto do item não encontrado.");
            }

            if (!Boolean.TRUE.equals(produto.getAtivo())) {
                throw new RegraNegocioException("Produto inativo não pode ser reservado: " + produto.getNome());
}

            if (produto.getEstoque() < item.getQuantidade()) {
                throw new RegraNegocioException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            produto.setEstoque(produto.getEstoque() - item.getQuantidade());
            produtoRepository.save(produto);
        }

        pedido.setStatus(StatusPedido.RESERVADO);
        pedido.setDataReserva(LocalDateTime.now());

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido pagarPedido(Long idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RegraNegocioException("Pedido não encontrado."));

        if (!StatusPedido.RESERVADO.equals(pedido.getStatus())) {
            throw new RegraNegocioException("Apenas pedidos RESERVADOS podem ser pagos.");
        }

        ContaCorrente contaCliente = pedido.getCliente().getContaCorrente();

        if (contaCliente == null) {
            throw new RegraNegocioException("Cliente não possui conta corrente.");
        }

        ContaCorrente contaEmpresa = contaCorrenteService.buscarContaEmpresa();

        BigDecimal valorPedido = pedido.getTotalFinal();

        if (valorPedido == null || valorPedido.compareTo(BigDecimal.ZERO) < 0) {
            throw new RegraNegocioException("Valor do pedido inválido.");
        }

        if (contaCliente.getSaldo().compareTo(valorPedido) < 0) {
            throw new RegraNegocioException("Saldo insuficiente.");
        }

        contaCorrenteService.transferir(contaCliente, contaEmpresa, valorPedido);

        movimentacaoContaService.registrar(
                contaCliente,
                TipoMovimentacao.PAGAMENTO_PEDIDO,
                valorPedido,
                pedido
        );

        movimentacaoContaService.registrar(
                contaEmpresa,
                TipoMovimentacao.RECEBIMENTO_EMPRESA,
                valorPedido,
                pedido
        );

        pedido.setStatus(StatusPedido.PAGO);
        pedido.setDataPagamento(LocalDateTime.now());

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido cancelarPedido(Long idPedido) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RegraNegocioException("Pedido não encontrado."));

        switch (pedido.getStatus()) {
            case PAGO:
                estornarDinheiro(pedido);
                devolverEstoque(pedido);
                break;

            case RESERVADO:
                devolverEstoque(pedido);
                break;

            case CRIADO:
                break;

            default:
                throw new RegraNegocioException("Pedido não pode ser cancelado no status atual.");
        }

        pedido.setStatus(StatusPedido.CANCELADO);
        pedido.setDataCancelamento(LocalDateTime.now());

        return pedidoRepository.save(pedido);
    }

    private void devolverEstoque(Pedido pedido) {
        for (ItemPedido item : pedido.getItens()) {
            Produto produto = item.getProduto();

            if (produto == null) {
                throw new RegraNegocioException("Produto do item não encontrado.");
            }

            produto.setEstoque(produto.getEstoque() + item.getQuantidade());
            produtoRepository.save(produto);
        }
    }

    private void estornarDinheiro(Pedido pedido) {
        ContaCorrente contaCliente = pedido.getCliente().getContaCorrente();

        if (contaCliente == null) {
            throw new RegraNegocioException("Cliente não possui conta corrente.");
        }

        ContaCorrente contaEmpresa = contaCorrenteService.buscarContaEmpresa();

        BigDecimal valorPedido = pedido.getTotalFinal();

        if (valorPedido == null || valorPedido.compareTo(BigDecimal.ZERO) < 0) {
            throw new RegraNegocioException("Valor do pedido inválido.");
        }

        if (contaEmpresa.getSaldo().compareTo(valorPedido) < 0) {
            throw new RegraNegocioException("Saldo insuficiente na conta da empresa para realizar estorno.");
        }

        contaCorrenteService.transferir(contaEmpresa, contaCliente, valorPedido);

        movimentacaoContaService.registrar(
                contaCliente,
                TipoMovimentacao.ESTORNO_CLIENTE,
                valorPedido,
                pedido
        );

        movimentacaoContaService.registrar(
                contaEmpresa,
                TipoMovimentacao.ESTORNO_EMPRESA,
                valorPedido,
                pedido
        );
    }
}