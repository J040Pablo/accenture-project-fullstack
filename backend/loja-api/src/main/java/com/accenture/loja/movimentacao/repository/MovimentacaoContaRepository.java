package com.accenture.loja.movimentacao.repository;

import com.accenture.loja.movimentacao.model.MovimentacaoConta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimentacaoContaRepository extends JpaRepository<MovimentacaoConta, Long> {

    List<MovimentacaoConta> findByContaIdOrderByDataHoraDesc(Long contaId);
}