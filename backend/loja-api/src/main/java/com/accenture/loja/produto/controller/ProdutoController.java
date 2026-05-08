package com.accenture.loja.produto.controller;

import com.accenture.loja.produto.dto.ProdutoRequestDTO;
import com.accenture.loja.produto.dto.EstoqueRequestDTO;
import com.accenture.loja.produto.dto.ProdutoRequestDTO;
import com.accenture.loja.produto.dto.ProdutoResponseDTO;
import com.accenture.loja.produto.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @PostMapping
    public ResponseEntity<ProdutoResponseDTO> cadastrar(@RequestBody @Valid ProdutoRequestDTO request) {
        ProdutoResponseDTO response = produtoService.cadastrar(request);

        return ResponseEntity
                .created(URI.create("/api/produtos/" + response.id()))
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listar() {
        return ResponseEntity.ok(produtoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid ProdutoRequestDTO request
    ) {
        ProdutoResponseDTO response = produtoService.atualizar(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        produtoService.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/baixar-estoque")
    public ResponseEntity<Void> baixarEstoque(
            @PathVariable Long id,
            @RequestBody @Valid EstoqueRequestDTO request
    ) {
        produtoService.baixarEstoque(id, request.quantidade());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/devolver-estoque")
    public ResponseEntity<Void> devolverEstoque(
            @PathVariable Long id,
            @RequestBody @Valid EstoqueRequestDTO request
    ) {
        produtoService.devolverEstoque(id, request.quantidade());
        return ResponseEntity.noContent().build();
    }
}