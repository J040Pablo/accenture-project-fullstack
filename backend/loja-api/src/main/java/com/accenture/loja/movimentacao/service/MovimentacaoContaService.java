package com.accenture.loja.movimentacao.service;

import com.accenture.loja.movimentacao.dto.MovimentacaoContaRequestDTO;
import com.accenture.loja.movimentacao.dto.MovimentacaoContaResponseDTO;
import com.accenture.loja.movimentacao.mapper.MovimentacaoContaMapper;
import com.accenture.loja.movimentacao.model.MovimentacaoConta;
import com.accenture.loja.movimentacao.repository.MovimentacaoContaRepository;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.repository.PedidoRepository;
import com.accenture.loja.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovimentacaoContaService {

    private final MovimentacaoContaRepository movimentacaoContaRepository;
    private final ContaCorrenteRepository contaCorrenteRepository;
    private final PedidoRepository pedidoRepository;
    private final MovimentacaoContaMapper movimentacaoContaMapper;

    @Transactional(readOnly = true)
    public List<MovimentacaoContaResponseDTO> listarPorConta(Long contaCorrenteId) {
        return movimentacaoContaRepository.findByContaCorrenteId(contaCorrenteId)
                .stream()
                .map(movimentacaoContaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MovimentacaoContaResponseDTO criarMovimentacao(MovimentacaoContaRequestDTO requestDTO) {
        ContaCorrente conta = contaCorrenteRepository.findById(requestDTO.getContaCorrenteId())
                .orElseThrow(() -> new ResourceNotFoundException("Conta Corrente não encontrada"));

        Pedido pedido = null;
        if (requestDTO.getPedidoId() != null) {
            pedido = pedidoRepository.findById(requestDTO.getPedidoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado"));
        }

        MovimentacaoConta movimentacao = movimentacaoContaMapper.toEntity(requestDTO, conta, pedido);
        movimentacao = movimentacaoContaRepository.save(movimentacao);

        return movimentacaoContaMapper.toResponseDTO(movimentacao);
    }
}