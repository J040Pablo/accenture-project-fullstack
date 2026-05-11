package com.accenture.loja.analiserisco.service;

import com.accenture.loja.analiserisco.dto.AnaliseRiscoPedidoResponseDTO;
import com.accenture.loja.analiserisco.mapper.AnaliseRiscoPedidoMapper;
import com.accenture.loja.analiserisco.model.AnaliseRiscoPedido;
import com.accenture.loja.analiserisco.repository.AnaliseRiscoPedidoRepository;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.repository.PedidoRepository;
import com.accenture.loja.shared.enums.NivelRisco;
import com.accenture.loja.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnaliseRiscoPedidoService {

    private final AnaliseRiscoPedidoRepository analiseRiscoPedidoRepository;
    private final PedidoRepository pedidoRepository;
    private final AnaliseRiscoPedidoMapper analiseRiscoPedidoMapper;

    public AnaliseRiscoPedidoResponseDTO analisarRisco(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado para análise de risco"));

        NivelRisco nivel = (pedidoId % 2 == 0) ? NivelRisco.BAIXO : NivelRisco.MEDIO;
        String motivo = (nivel == NivelRisco.BAIXO) ? "Histórico favorável" : "Necessita revisão manual";

        AnaliseRiscoPedido analise = AnaliseRiscoPedido.builder()
                .pedido(pedido)
                .nivelRisco(nivel)
                .motivo(motivo)
                .build();

        analise = analiseRiscoPedidoRepository.save(analise);
        return analiseRiscoPedidoMapper.toResponseDTO(analise);
    }

    public AnaliseRiscoPedidoResponseDTO buscarPorPedido(Long pedidoId) {
        AnaliseRiscoPedido analise = analiseRiscoPedidoRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Análise não encontrada para este pedido"));

        return analiseRiscoPedidoMapper.toResponseDTO(analise);
    }
}