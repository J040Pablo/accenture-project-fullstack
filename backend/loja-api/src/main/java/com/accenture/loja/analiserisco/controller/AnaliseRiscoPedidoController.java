package com.accenture.loja.analiserisco.controller;

import com.accenture.loja.analiserisco.dto.AnaliseRiscoPedidoResponseDTO;
import com.accenture.loja.analiserisco.service.AnaliseRiscoPedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnaliseRiscoPedidoController {

    private final AnaliseRiscoPedidoService analiseRiscoPedidoService;

    @PostMapping("/pedidos/{id}/analisar-risco")
    public ResponseEntity<AnaliseRiscoPedidoResponseDTO> analisarRisco(@PathVariable("id") Long pedidoId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(analiseRiscoPedidoService.analisarRisco(pedidoId));
    }

    @GetMapping("/pedidos/{id}/analise-risco")
    public ResponseEntity<AnaliseRiscoPedidoResponseDTO> buscarAnalisePorPedido(@PathVariable("id") Long pedidoId) {
        return ResponseEntity.ok(analiseRiscoPedidoService.buscarPorPedido(pedidoId));
    }
}