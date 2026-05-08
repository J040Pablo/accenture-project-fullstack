package com.accenture.loja.movimentacao.repository;

import com.accenture.loja.movimentacao.model.MovimentacaoConta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimentacaoContaRepository extends JpaRepository<MovimentacaoConta, Long> {
    List<MovimentacaoConta> findByContaCorrenteId(Long contaCorrenteId);
}