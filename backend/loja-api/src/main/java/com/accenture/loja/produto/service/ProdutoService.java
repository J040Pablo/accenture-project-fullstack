package com.accenture.loja.produto.service;

import com.accenture.loja.produto.dto.ProdutoRequestDTO;
import com.accenture.loja.produto.dto.ProdutoResponseDTO;
import com.accenture.loja.produto.model.Produto;
import com.accenture.loja.produto.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    @Transactional
    public ProdutoResponseDTO cadastrar(ProdutoRequestDTO request) {
        if (produtoRepository.existsBySku(request.sku())) {
            throw new IllegalArgumentException("SKU já cadastrado");
        }

        Produto produto = new Produto(
                request.sku(),
                request.nome(),
                request.categoria(),
                request.preco(),
                request.estoque()
        );

        Produto produtoSalvo = produtoRepository.save(produto);

        return toResponseDTO(produtoSalvo);
    }

    public List<ProdutoResponseDTO> listar() {
        return produtoRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ProdutoResponseDTO buscarPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        return toResponseDTO(produto);
    }

    @Transactional
    public void baixarEstoque(Long produtoId, Integer quantidade) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        if (!produto.getAtivo()) {
            throw new IllegalStateException("Produto inativo não pode ser vendido");
        }

        if (quantidade == null || quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }

        if (produto.getEstoque() < quantidade) {
            throw new IllegalStateException("Estoque insuficiente");
        }

        produto.setEstoque(produto.getEstoque() - quantidade);
    }

    @Transactional
    public void devolverEstoque(Long produtoId, Integer quantidade) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        if (quantidade == null || quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }

        produto.setEstoque(produto.getEstoque() + quantidade);
    }

    private ProdutoResponseDTO toResponseDTO(Produto produto) {
        return new ProdutoResponseDTO(
                produto.getId(),
                produto.getSku(),
                produto.getNome(),
                produto.getCategoria(),
                produto.getPreco(),
                produto.getEstoque(),
                produto.getAtivo()
        );
    }
    
    @Transactional
    public ProdutoResponseDTO atualizar(Long id, ProdutoRequestDTO request) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        
        // atualiza o produto mantendo o mesmo SKU, mas bloqueia se tentar usar o SKU de outro produto.
        if (!produto.getSku().equals(request.sku()) && produtoRepository.existsBySku(request.sku())) {
            throw new IllegalArgumentException("SKU já cadastrado");
        }

        produto.setSku(request.sku());
        produto.setNome(request.nome());
        produto.setCategoria(request.categoria());
        produto.setPreco(request.preco());
        produto.setEstoque(request.estoque());

        return toResponseDTO(produto);
    }
    
    @Transactional
    public void inativar(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        produto.setAtivo(false);
    }
}