package com.accenture.loja.movimentacao.service;

import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.movimentacao.dto.MovimentacaoContaResponse;
import com.accenture.loja.movimentacao.mapper.MovimentacaoContaMapper;
import com.accenture.loja.movimentacao.model.MovimentacaoConta;
import com.accenture.loja.movimentacao.repository.MovimentacaoContaRepository;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.shared.enums.TipoMovimentacao;
import com.accenture.loja.shared.exception.RegraNegocioException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimentacaoContaService {

    private final MovimentacaoContaRepository repository;
    private final MovimentacaoContaMapper mapper;

    public List<MovimentacaoContaResponse> listarTodas() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<MovimentacaoContaResponse> listarPorConta(Long contaId) {
        return repository.findByContaIdOrderByDataHoraDesc(contaId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public MovimentacaoConta registrar(
            ContaCorrente conta,
            TipoMovimentacao tipo,
            BigDecimal valor,
            Pedido pedido
    ) {
        validarMovimentacao(conta, tipo, valor);

        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(conta)
                .tipo(tipo)
                .valor(valor)
                .pedido(pedido)
                .descricao(gerarDescricao(tipo, pedido))
                .dataHora(LocalDateTime.now())
                .build();

        return repository.save(mov);
    }

    private void validarMovimentacao(
            ContaCorrente conta,
            TipoMovimentacao tipo,
            BigDecimal valor
    ) {
        if (conta == null) {
            throw new RegraNegocioException("Conta da movimentação é obrigatória.");
        }

        if (tipo == null) {
            throw new RegraNegocioException("Tipo da movimentação é obrigatório.");
        }

        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("Valor da movimentação deve ser maior que zero.");
        }
    }

    private String gerarDescricao(TipoMovimentacao tipo, Pedido pedido) {
        Long pedidoId = pedido != null ? pedido.getIdPedido() : null;

        return switch (tipo) {
            case DEPOSITO -> "Depósito em conta";
            case SAQUE -> "Saque em conta";
            case PAGAMENTO_PEDIDO -> "Pagamento do pedido #" + pedidoId;
            case RECEBIMENTO_EMPRESA -> "Recebimento do pedido #" + pedidoId;
            case ESTORNO_CLIENTE -> "Estorno ao cliente do pedido #" + pedidoId;
            case ESTORNO_EMPRESA -> "Estorno pago pela empresa do pedido #" + pedidoId;
        };
    }
}