package com.accenture.loja.pedido.controller;

import com.accenture.loja.pedido.dto.CancelarPedidoRequestDTO;
import com.accenture.loja.pedido.dto.CriarPedidoRequestDTO;
import com.accenture.loja.pedido.dto.PedidoResponseDTO;
import com.accenture.loja.pedido.mapper.PedidoMapper;
import com.accenture.loja.pedido.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;
    private final PedidoMapper pedidoMapper;

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> criarPedido(@RequestBody @Valid CriarPedidoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pedidoMapper.toResponseDTO(pedidoService.criarPedido(request)));
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidos() {
        return ResponseEntity.ok(pedidoService.listarPedidos()
                .stream()
                .map(pedidoMapper::toResponseDTO)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPedidoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoMapper.toResponseDTO(pedidoService.buscarPedidoPorId(id)));
    }

    @PostMapping("/{id}/reservar")
    public ResponseEntity<PedidoResponseDTO> reservarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoMapper.toResponseDTO(pedidoService.reservarPedido(id)));
    }

    @PostMapping("/{id}/pagar")
    public ResponseEntity<PedidoResponseDTO> pagarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoMapper.toResponseDTO(pedidoService.pagarPedido(id)));
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<PedidoResponseDTO> cancelarPedido(
            @PathVariable Long id,
            @RequestBody @Valid CancelarPedidoRequestDTO request) {
        return ResponseEntity.ok(pedidoMapper.toResponseDTO(
                pedidoService.cancelarPedido(id, request.getMotivoCancelamento())));
    }
}