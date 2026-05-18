package com.accenture.loja.empresa.repository;

import com.accenture.loja.empresa.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    boolean existsByCnpj(String cnpj);

    Optional<Empresa> findByContaCorrente_Id(Long contaCorrenteId);
}