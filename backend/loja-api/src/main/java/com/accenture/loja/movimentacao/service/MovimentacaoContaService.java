package com.accenture.loja.movimentacao.service;

import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.movimentacao.dto.MovimentacaoContaResponse;
import com.accenture.loja.movimentacao.mapper.MovimentacaoContaMapper;
import com.accenture.loja.movimentacao.model.MovimentacaoConta;
import com.accenture.loja.movimentacao.repository.MovimentacaoContaRepository;
import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.shared.enums.TipoMovimentacao;
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


    public MovimentacaoConta registar(ContaCorrente conta,
                                      TipoMovimentacao tipo,
                                      BigDecimal valor,
                                      Pedido pedido) {
        MovimentacaoConta mov = MovimentacaoConta.builder()
                .conta(conta)
                .tipo(tipo)
                .valor(valor)
                .pedido(pedido)
                .dataHora(LocalDateTime.now())
                .build();

        return repository.save(mov);
    }
}