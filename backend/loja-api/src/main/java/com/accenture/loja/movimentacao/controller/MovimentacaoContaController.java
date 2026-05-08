package com.accenture.loja.movimentacao.controller;

import com.accenture.loja.movimentacao.dto.MovimentacaoContaRequestDTO;
import com.accenture.loja.movimentacao.dto.MovimentacaoContaResponseDTO;
import com.accenture.loja.movimentacao.service.MovimentacaoContaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes")
@RequiredArgsConstructor
public class MovimentacaoContaController {

    private final MovimentacaoContaService movimentacaoContaService;

    @GetMapping("/conta/{contaId}")
    public ResponseEntity<List<MovimentacaoContaResponseDTO>> listarPorConta(@PathVariable Long contaId) {
        return ResponseEntity.ok(movimentacaoContaService.listarPorConta(contaId));
    }

    @PostMapping
    public ResponseEntity<MovimentacaoContaResponseDTO> criarMovimentacao(@RequestBody MovimentacaoContaRequestDTO requestDTO) {
        MovimentacaoContaResponseDTO responseDTO = movimentacaoContaService.criarMovimentacao(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }
}