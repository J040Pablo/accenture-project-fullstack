package com.accenture.loja.conta.repository;

import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContaCorrenteRepository extends JpaRepository<ContaCorrente, Long> {

	List<ContaCorrente> findByTipoTitular(TipoTitularConta tipoTitular);

	Optional<ContaCorrente> findByNumeroConta(String numeroConta);

	boolean existsByNumeroConta(String numeroConta);
}