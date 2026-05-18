package com.accenture.loja.pedido.controller;

import com.accenture.loja.pedido.dto.CancelarPedidoRequestDTO;
import com.accenture.loja.pedido.dto.CriarPedidoRequestDTO;
import com.accenture.loja.pedido.dto.PedidoResponseDTO;
import com.accenture.loja.pedido.mapper.PedidoMapper;
import com.accenture.loja.pedido.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Gerenciamento de Pedidos")
public class PedidoController {

    private final PedidoService pedidoService;
    private final PedidoMapper pedidoMapper;

    @PostMapping
    @Operation(summary = "Criar Pedido")
    public ResponseEntity<PedidoResponseDTO> criarPedido(@RequestBody @Valid CriarPedidoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pedidoMapper.toResponseDTO(pedidoService.criarPedido(request)));
    }

    @GetMapping
    @Operation(summary = "Listar Pedidos")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidos() {
        return ResponseEntity.ok(pedidoService.listarPedidos()
                .stream()
                .map(pedidoMapper::toResponseDTO)
                .toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Pedido pelo ID")
    public ResponseEntity<PedidoResponseDTO> buscarPedidoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoMapper.toResponseDTO(pedidoService.buscarPedidoPorId(id)));
    }

    @PostMapping("/{id}/reservar")
    @Operation(summary = "Reservar Pedido")
    public ResponseEntity<PedidoResponseDTO> reservarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoMapper.toResponseDTO(pedidoService.reservarPedido(id)));
    }

    @PostMapping("/{id}/pagar")
    @Operation(summary = "Realizar pagamento do Pedido")
    public ResponseEntity<PedidoResponseDTO> pagarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoMapper.toResponseDTO(pedidoService.pagarPedido(id)));
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar Pedido")
    public ResponseEntity<PedidoResponseDTO> cancelarPedido(
            @PathVariable Long id,
            @RequestBody @Valid CancelarPedidoRequestDTO request) {
        return ResponseEntity.ok(pedidoMapper.toResponseDTO(
                pedidoService.cancelarPedido(id, request.getMotivoCancelamento())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar Pedido")
    public ResponseEntity<Void> deletarPedido(@PathVariable Long id) {
        pedidoService.deletarPedido(id);
        return ResponseEntity.noContent().build();
    }

}