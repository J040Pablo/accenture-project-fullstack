package com.accenture.loja.movimentacao.controller;

import com.accenture.loja.movimentacao.dto.MovimentacaoContaResponse;
import com.accenture.loja.movimentacao.service.MovimentacaoContaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Movimentações", description = "Histórico financeiro de contas")
public class MovimentacaoContaController {

    private final MovimentacaoContaService service;

    @GetMapping("/movimentacoes")
    @Operation(summary = "Lista todas as movimentações da loja")
    public ResponseEntity<List<MovimentacaoContaResponse>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/contas/{id}/movimentacoes")
    @Operation(summary = "Lista o extrato de uma conta específica")
    public ResponseEntity<List<MovimentacaoContaResponse>> listarPorConta(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarPorConta(id));
    }
}