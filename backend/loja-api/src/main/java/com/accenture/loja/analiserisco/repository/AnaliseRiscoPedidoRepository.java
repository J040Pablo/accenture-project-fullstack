package com.accenture.loja.analiserisco.repository;

import com.accenture.loja.analiserisco.model.AnaliseRiscoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnaliseRiscoPedidoRepository extends JpaRepository<AnaliseRiscoPedido, Long> {
    Optional<AnaliseRiscoPedido> findByPedidoId(Long pedidoId);
}