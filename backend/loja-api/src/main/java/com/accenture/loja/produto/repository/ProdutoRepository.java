package com.accenture.loja.produto.repository;

import com.accenture.loja.produto.model.Produto;

import com.accenture.loja.produto.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    boolean existsBySku(String sku);
}
