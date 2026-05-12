package com.accenture.loja.pedido.service;

import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.movimentacao.service.MovimentacaoContaService;
import com.accenture.loja.pedido.model.ItemPedido;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.dto.CriarPedidoRequestDTO;
import com.accenture.loja.pedido.dto.ItemPedidoRequestDTO;
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
import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional

public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepository;
    private final ContaCorrenteRepository contaCorrenteRepository;
    private final MovimentacaoContaService movimentacaoContaService;

    @Transactional
    public Pedido buscarPedidoPorId(Long idPedido) {
        return pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RegraNegocioException("Pedido não encontrado."));
    }

    @Transactional
    public List<Pedido> listarPedidos() {
        return pedidoRepository.findAll();
    }

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

            if (!produto.getAtivo()) {
                throw new RegraNegocioException(
                        "Não é possível criar pedido com produto inativo: " + produto.getNome());
            }

            if (produto.getEstoque() < itemDto.getQuantidade()) {
                throw new RegraNegocioException(
                        "Estoque insuficiente para o produto: " + produto.getNome() +
                                ". Disponível: " + produto.getEstoque() +
                                ", Solicitado: " + itemDto.getQuantidade());
            }

            BigDecimal precoUnitario = produto.getPreco();
            BigDecimal subtotal = precoUnitario.multiply(new BigDecimal(itemDto.getQuantidade()));

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

        if (pedido.getItens().isEmpty()) {
            throw new RegraNegocioException("Não é possível reservar um pedido sem itens.");
        }

        // Validação e baixa de estoque
        for (ItemPedido item : pedido.getItens()) {
            Produto produto = item.getProduto();

            if (!produto.getAtivo()) {
                throw new RegraNegocioException(
                        "Não é possível reservar produto inativo: " + produto.getNome());
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

        // pedido precisa estar RESERVADO
        if (!StatusPedido.RESERVADO.equals(pedido.getStatus())) {
            throw new RegraNegocioException("Apenas pedidos RESERVADOS podem ser pagos.");
        }

        ContaCorrente contaCliente = contaCorrenteRepository.findById(pedido.getCliente().getContaCorrente().getId())
                .orElseThrow(() -> new RegraNegocioException("Conta do cliente não encontrada."));

        ContaCorrente contaEmpresa = contaCorrenteRepository.findById(1L)
                .orElseThrow(() -> new RegraNegocioException("Conta da empresa não configurada."));

        // debitar conta do cliente
        if (contaCliente.getSaldo().compareTo(pedido.getTotalFinal()) < 0) {
            throw new RegraNegocioException("Saldo insuficiente.");
        }
        contaCliente.setSaldo(contaCliente.getSaldo().subtract(pedido.getTotalFinal()));
        contaEmpresa.setSaldo(contaEmpresa.getSaldo().add(pedido.getTotalFinal()));

        movimentacaoContaService.registar(contaCliente, TipoMovimentacao.PAGAMENTO_PEDIDO, pedido.getTotalFinal(), pedido);
        movimentacaoContaService.registar(contaEmpresa, TipoMovimentacao.RECEBIMENTO_EMPRESA, pedido.getTotalFinal(), pedido);

        // requisito: status muda para PAGO
        pedido.setStatus(StatusPedido.PAGO);
        pedido.setDataPagamento(LocalDateTime.now());

        contaCorrenteRepository.save(contaCliente);
        contaCorrenteRepository.save(contaEmpresa);
        return pedidoRepository.save(pedido);
    }
    @Transactional
    public Pedido cancelarPedido(Long idPedido, String motivoCancelamento) {
        if (motivoCancelamento == null || motivoCancelamento.trim().isEmpty()) {
            throw new RegraNegocioException("Motivo do cancelamento é obrigatório.");
        }

        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RegraNegocioException("Pedido não encontrado."));

        switch (pedido.getStatus()) {
            case PAGO:
                // pedido pago: devolve estoque e estorna dinheiro
                estornarDinheiro(pedido);
                devolverEstoque(pedido);
                break;

            case RESERVADO:
                // pediddo reservado: devolve estoque
                devolverEstoque(pedido);
                break;

            case CRIADO:
                // pedido criado: apenas cancela
                break;

            default:
                throw new RegraNegocioException("Pedido não pode ser cancelado no status atual.");
        }

        // requisito: status muda para cancelado
        pedido.setStatus(StatusPedido.CANCELADO);
        pedido.setDataCancelamento(LocalDateTime.now());
        pedido.setMotivoCancelamento(motivoCancelamento);

        return pedidoRepository.save(pedido);
    }

    private void devolverEstoque(Pedido pedido) {
        for (ItemPedido item : pedido.getItens()) {
            Produto produto = item.getProduto();
            produto.setEstoque(produto.getEstoque() + item.getQuantidade());
            produtoRepository.save(produto);
        }
    }

    private void estornarDinheiro(Pedido pedido) {
        ContaCorrente contaCliente = pedido.getCliente().getContaCorrente();
        ContaCorrente contaEmpresa = contaCorrenteRepository.findById(1L).get();

        contaCliente.setSaldo(contaCliente.getSaldo().add(pedido.getTotalFinal()));
        contaEmpresa.setSaldo(contaEmpresa.getSaldo().subtract(pedido.getTotalFinal()));

        movimentacaoContaService.registar(contaCliente, TipoMovimentacao.ESTORNO_CLIENTE, pedido.getTotalFinal(), pedido);
        movimentacaoContaService.registar(contaEmpresa, TipoMovimentacao.ESTORNO_EMPRESA, pedido.getTotalFinal(), pedido);

        contaCorrenteRepository.save(contaCliente);
        contaCorrenteRepository.save(contaEmpresa);
    }

}