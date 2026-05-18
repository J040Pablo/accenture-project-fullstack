package com.accenture.loja.analiserisco.controller;

import com.accenture.loja.analiserisco.dto.AnaliseRiscoPedidoResponseDTO;
import com.accenture.loja.analiserisco.service.AnaliseRiscoPedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Análise de Risco", description = "Consulta e geração de análise de risco de pedidos")
public class AnaliseRiscoPedidoController {

    private final AnaliseRiscoPedidoService analiseRiscoPedidoService;

    @PostMapping("/pedidos/{id}/analisar-risco")
    @Operation(summary = "Gera a análise de risco de um pedido")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Análise gerada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Regra de negócio violada"),
            @ApiResponse(responseCode = "404", description = "Pedido não encontrado")
    })
    public ResponseEntity<AnaliseRiscoPedidoResponseDTO> analisarRisco(@PathVariable("id") Long pedidoId) {
        return ResponseEntity.ok(analiseRiscoPedidoService.analisarRisco(pedidoId));
    }

    @GetMapping("/pedidos/{id}/analise-risco")
    @Operation(summary = "Busca a análise de risco de um pedido")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Análise encontrada"),
            @ApiResponse(responseCode = "404", description = "Análise não encontrada")
    })
    public ResponseEntity<AnaliseRiscoPedidoResponseDTO> buscarAnalisePorPedido(@PathVariable("id") Long pedidoId) {
        return ResponseEntity.ok(analiseRiscoPedidoService.buscarPorPedido(pedidoId));
    }
}