package com.accenture.loja.analiserisco.service;

import com.accenture.loja.analiserisco.dto.AnaliseRiscoPedidoResponseDTO;
import com.accenture.loja.analiserisco.mapper.AnaliseRiscoPedidoMapper;
import com.accenture.loja.analiserisco.model.AnaliseRiscoPedido;
import com.accenture.loja.analiserisco.repository.AnaliseRiscoPedidoRepository;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.repository.PedidoRepository;
import com.accenture.loja.shared.enums.NivelRisco;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AnaliseRiscoPedidoService {

    private final AnaliseRiscoPedidoRepository analiseRiscoPedidoRepository;
    private final PedidoRepository pedidoRepository;
    private final AnaliseRiscoPedidoMapper analiseRiscoPedidoMapper;

    private static final BigDecimal LIMITE_ALTO_RISCO  = new BigDecimal("10000.00");
    private static final BigDecimal LIMITE_MEDIO_RISCO = new BigDecimal("3000.00");
    private static final int        LIMITE_ITENS       = 50;
    private static final LocalTime  INICIO_MADRUGADA   = LocalTime.of(0, 0);
    private static final LocalTime  FIM_MADRUGADA      = LocalTime.of(6, 0);

    public AnaliseRiscoPedidoResponseDTO analisarRisco(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado: " + pedidoId));

        analiseRiscoPedidoRepository.findByPedidoIdPedido(pedidoId).ifPresent(a -> {
            throw new BusinessException("Este pedido já foi analisado. Nível: " + a.getNivelRisco());
        });

        NivelRisco nivel;
        String motivo;

        LocalTime agora = LocalTime.now();
        boolean ehMadrugada = agora.isAfter(INICIO_MADRUGADA) && agora.isBefore(FIM_MADRUGADA);
        int totalItens = pedido.getItens().stream().mapToInt(i -> i.getQuantidade()).sum();

        if (pedido.getTotalFinal().compareTo(LIMITE_ALTO_RISCO) > 0) {
            nivel  = NivelRisco.ALTO;
            motivo = "Valor do pedido acima de R$ 10.000,00";
        } else if (ehMadrugada) {
            nivel  = NivelRisco.ALTO;
            motivo = "Compra realizada em horário de madrugada (00h–06h)";
        } else if (totalItens > LIMITE_ITENS) {
            nivel  = NivelRisco.MEDIO;
            motivo = "Quantidade de itens atípica: " + totalItens + " unidades";
        } else if (pedido.getTotalFinal().compareTo(LIMITE_MEDIO_RISCO) > 0) {
            nivel  = NivelRisco.MEDIO;
            motivo = "Valor do pedido entre R$ 3.000,00 e R$ 10.000,00";
        } else {
            nivel  = NivelRisco.BAIXO;
            motivo = "Pedido dentro dos padrões normais";
        }

        AnaliseRiscoPedido analise = AnaliseRiscoPedido.builder()
                .pedido(pedido)
                .nivelRisco(nivel)
                .motivo(motivo)
                .dataAnalise(LocalDateTime.now())
                .build();

        return analiseRiscoPedidoMapper.toResponseDTO(analiseRiscoPedidoRepository.save(analise));
    }

    public AnaliseRiscoPedidoResponseDTO buscarPorPedido(Long pedidoId) {
        AnaliseRiscoPedido analise = analiseRiscoPedidoRepository.findByPedidoIdPedido(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Análise não encontrada para o pedido: " + pedidoId));

        return analiseRiscoPedidoMapper.toResponseDTO(analise);
    }
}