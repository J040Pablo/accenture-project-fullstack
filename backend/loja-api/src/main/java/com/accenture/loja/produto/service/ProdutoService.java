package com.accenture.loja.produto.service;

import com.accenture.loja.produto.dto.ProdutoRequestDTO;
import com.accenture.loja.produto.dto.ProdutoResponseDTO;
import com.accenture.loja.produto.model.Produto;
import com.accenture.loja.produto.repository.ProdutoRepository;
import com.accenture.loja.shared.exception.BusinessException;
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
        validarProdutoRequest(request);

        if (produtoRepository.existsBySku(request.sku())) {
            throw new BusinessException("SKU já cadastrado");
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
        Produto produto = buscarProdutoPorId(id);
        return toResponseDTO(produto);
    }

    @Transactional
    public ProdutoResponseDTO atualizar(Long id, ProdutoRequestDTO request) {
        validarProdutoRequest(request);

        Produto produto = buscarProdutoPorId(id);

        if (!produto.getSku().equals(request.sku()) && produtoRepository.existsBySku(request.sku())) {
            throw new BusinessException("SKU já cadastrado");
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
        Produto produto = buscarProdutoPorId(id);
        produto.setAtivo(false);
    }

    @Transactional
    public void baixarEstoque(Long produtoId, Integer quantidade) {
        validarQuantidade(quantidade);

        Produto produto = buscarProdutoPorId(produtoId);

        if (!Boolean.TRUE.equals(produto.getAtivo())) {
            throw new BusinessException("Produto inativo não pode ser vendido");
        }

        if (produto.getEstoque() < quantidade) {
            throw new BusinessException("Estoque insuficiente");
        }

        int novoEstoque = produto.getEstoque() - quantidade;

        if (novoEstoque < 0) {
            throw new BusinessException("Estoque não pode ficar negativo");
        }

        produto.setEstoque(novoEstoque);
    }

    @Transactional
    public void devolverEstoque(Long produtoId, Integer quantidade) {
        validarQuantidade(quantidade);

        Produto produto = buscarProdutoPorId(produtoId);
        produto.setEstoque(produto.getEstoque() + quantidade);
    }

    public Produto buscarProdutoPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Produto não encontrado"));
    }

    private void validarQuantidade(Integer quantidade) {
        if (quantidade == null || quantidade <= 0) {
            throw new BusinessException("Quantidade deve ser maior que zero");
        }
    }

    private void validarProdutoRequest(ProdutoRequestDTO request) {
        if (request.preco() == null || request.preco().signum() <= 0) {
            throw new BusinessException("Preço deve ser maior que zero");
        }

        if (request.estoque() == null || request.estoque() < 0) {
            throw new BusinessException("Estoque não pode ser negativo");
        }
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
}