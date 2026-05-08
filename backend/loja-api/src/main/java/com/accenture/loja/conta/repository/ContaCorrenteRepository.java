package com.accenture.loja.conta.repository;

import com.accenture.loja.conta.model.ContaCorrente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContaCorrenteRepository extends JpaRepository<ContaCorrente, Long> {
}