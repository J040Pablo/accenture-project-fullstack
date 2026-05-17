package com.accenture.loja.analiserisco.service;

import com.accenture.loja.analiserisco.dto.AnaliseRiscoPedidoResponseDTO;
import com.accenture.loja.analiserisco.mapper.AnaliseRiscoPedidoMapper;
import com.accenture.loja.analiserisco.model.AnaliseRiscoPedido;
import com.accenture.loja.analiserisco.repository.AnaliseRiscoPedidoRepository;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.repository.PedidoRepository;
import com.accenture.loja.shared.enums.NivelRisco;
import com.accenture.loja.shared.enums.StatusPedido;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AnaliseRiscoPedidoService {

    private final AnaliseRiscoPedidoRepository analiseRiscoPedidoRepository;
    private final PedidoRepository pedidoRepository;
    private final AnaliseRiscoPedidoMapper analiseRiscoPedidoMapper;

    private static final BigDecimal LIMITE_ALTO_RISCO = new BigDecimal("10000.00");
    private static final BigDecimal LIMITE_MEDIO_RISCO = new BigDecimal("3000.00");
    private static final BigDecimal LIMITE_CONSUMO_SALDO_MEDIO = new BigDecimal("0.70");
    private static final int LIMITE_ITENS = 50;
    private static final LocalTime INICIO_MADRUGADA = LocalTime.of(0, 0);
    private static final LocalTime FIM_MADRUGADA = LocalTime.of(6, 0);

    public AnaliseRiscoPedidoResponseDTO analisarRisco(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado: " + pedidoId));

        analiseRiscoPedidoRepository.findByPedidoIdPedido(pedidoId).ifPresent(a -> {
            throw new BusinessException("Este pedido já foi analisado. Nível: " + a.getNivelRisco());
        });

        BigDecimal valorTotal = pedido.getTotalFinal() != null ? pedido.getTotalFinal() : BigDecimal.ZERO;
        List<String> motivos = new ArrayList<>();
        boolean riscoCritico = false;
        boolean riscoModerado = false;

        LocalTime agora = horaAtual();
        boolean ehMadrugada = agora.isAfter(INICIO_MADRUGADA) && agora.isBefore(FIM_MADRUGADA);

        var cliente = pedido.getCliente();
        ContaCorrente contaCliente = cliente != null ? cliente.getContaCorrente() : null;

        List<?> itens = pedido.getItens() != null ? pedido.getItens() : List.of();
        int totalItens = pedido.getItens() == null
                ? 0
                : pedido.getItens()
                .stream()
                .mapToInt(item -> item.getQuantidade() != null ? item.getQuantidade() : 0)
                .sum();

        if (cliente == null) {
            riscoCritico = true;
            motivos.add("Pedido sem cliente vinculado");
        } else {
            motivos.add("Cliente: " + cliente.getNome());
        }

        if (contaCliente == null) {
            riscoCritico = true;
            motivos.add("Cliente sem conta corrente");
        }

        if (itens.isEmpty()) {
            riscoCritico = true;
            motivos.add("Pedido sem itens");
        } else if (totalItens > LIMITE_ITENS) {
            riscoModerado = true;
            motivos.add("Quantidade de itens atípica: " + totalItens + " unidades");
        }

        if (valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
            riscoCritico = true;
            motivos.add("Pedido com valor zero");
        } else if (valorTotal.compareTo(LIMITE_ALTO_RISCO) > 0) {
            riscoCritico = true;
            motivos.add("Valor do pedido acima de R$ 10.000,00");
        } else if (valorTotal.compareTo(LIMITE_MEDIO_RISCO) > 0) {
            riscoModerado = true;
            motivos.add("Valor do pedido entre R$ 3.000,00 e R$ 10.000,00");
        }

        if (ehMadrugada) {
            riscoCritico = true;
            motivos.add("Compra realizada em horário de madrugada (00h–06h)");
        }

        StatusPedido statusPedido = pedido.getStatus();

        if (statusPedido == null) {
            riscoCritico = true;
            motivos.add("Status do pedido não informado");
        } else if (statusPedido == StatusPedido.CANCELADO) {
            riscoCritico = true;
            motivos.add("Pedido cancelado");
        } else if (statusPedido == StatusPedido.PAGO) {
            motivos.add("Pedido já liquidado");
        } else if (statusPedido == StatusPedido.RESERVADO) {
            motivos.add("Pedido já reservado");
        } else {
            motivos.add("Pedido ainda em aberto");
        }

        boolean deveValidarSaldoAtual = statusPedido != StatusPedido.PAGO
                && statusPedido != StatusPedido.CANCELADO;

        if (deveValidarSaldoAtual && contaCliente != null && valorTotal.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal saldoCliente = contaCliente.getSaldo() != null ? contaCliente.getSaldo() : BigDecimal.ZERO;

            if (saldoCliente.compareTo(valorTotal) < 0) {
                riscoCritico = true;
                motivos.add("Saldo insuficiente para o valor do pedido");
            } else if (saldoCliente.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal consumoSaldo = valorTotal.divide(saldoCliente, 4, RoundingMode.HALF_UP);

                if (consumoSaldo.compareTo(LIMITE_CONSUMO_SALDO_MEDIO) >= 0) {
                    riscoModerado = true;
                    motivos.add("Pedido consome grande parte do saldo disponível");
                }
            }
        }

        if (!riscoCritico && !riscoModerado) {
            motivos.add("Pedido dentro dos padrões normais");
        }

        NivelRisco nivel = riscoCritico ? NivelRisco.ALTO : (riscoModerado ? NivelRisco.MEDIO : NivelRisco.BAIXO);

        int score = switch (nivel) {
            case ALTO -> 90;
            case MEDIO -> 55;
            case BAIXO -> 15;
        };

        String recomendacao = switch (nivel) {
            case ALTO -> "Bloquear a operação e corrigir as inconsistências antes de seguir.";
            case MEDIO -> "Revisar saldo, valor e quantidade de itens antes de avançar.";
            case BAIXO -> "Pedido apto para seguir para reserva.";
        };

        AnaliseRiscoPedido analise = AnaliseRiscoPedido.builder()
                .pedido(pedido)
                .clienteId(cliente != null ? cliente.getId() : null)
                .clienteNome(cliente != null ? cliente.getNome() : null)
                .valorTotal(valorTotal)
                .saldoCliente(contaCliente != null ? contaCliente.getSaldo() : null)
                .statusPedido(statusPedido)
                .nivelRisco(nivel)
                .score(score)
                .motivos(motivos)
                .motivo(String.join(" | ", motivos))
                .recomendacao(recomendacao)
                .aprovado(nivel != NivelRisco.ALTO)
                .dataAnalise(LocalDateTime.now())
                .build();

        return analiseRiscoPedidoMapper.toResponseDTO(analiseRiscoPedidoRepository.save(analise));
    }

    protected LocalTime horaAtual() {
        return LocalTime.now();
    }

    public AnaliseRiscoPedidoResponseDTO buscarPorPedido(Long pedidoId) {
        AnaliseRiscoPedido analise = analiseRiscoPedidoRepository.findByPedidoIdPedido(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Análise não encontrada para o pedido: " + pedidoId));

        return analiseRiscoPedidoMapper.toResponseDTO(analise);
    }
}