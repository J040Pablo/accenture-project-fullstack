package com.accenture.loja.pedido.service;

import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.pedido.model.ItemPedido;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.dto.CriarPedidoRequestDTO;
import com.accenture.loja.pedido.dto.ItemPedidoRequestDTO;
import com.accenture.loja.pedido.repository.PedidoRepository;
import com.accenture.loja.produto.model.Produto;
import com.accenture.loja.produto.repository.ProdutoRepository;
import com.accenture.loja.shared.enums.StatusPedido;
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
            // --- AQUI ESTÁ A NOVA VALIDAÇÃO ---
            if (itemDto.getQuantidade() == null || itemDto.getQuantidade() <= 0) {
                throw new RegraNegocioException("A quantidade de cada item deve ser maior que zero.");
            }
            // ----------------------------------

            Produto produto = produtoRepository.findById(itemDto.getProdutoId())
                    .orElseThrow(() -> new RegraNegocioException("Produto não encontrado."));

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
            if (produto.getEstoque() < item.getQuantidade()) {
                throw new RegraNegocioException("Estoque insuficiente para o produto: " + produto.getNome());
            }
            // Baixa no estoque
            produto.setEstoque(produto.getEstoque() - item.getQuantidade());
            produtoRepository.save(produto);
        }

        pedido.setStatus(StatusPedido.RESERVADO);
        pedido.setDataReserva(LocalDateTime.now());
        return pedidoRepository.save(pedido);
    }

    // proximas etapas caso necessario
    @Transactional
    public void pagarPedido(Long idPedido) {
        // Implementação futura: validar se está RESERVADO, debitar/creditar contas.
    }

    @Transactional
    public void cancelarPedido(Long idPedido, String motivo) {
        // Implementação futura: devolver estoque, gerar estorno se pago.
    }


}