package com.accenture.loja.conta.repository;

import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContaCorrenteRepository extends JpaRepository<ContaCorrente, Long> {

    Optional<ContaCorrente> findByTipoTitular(TipoTitularConta tipoTitular);
}