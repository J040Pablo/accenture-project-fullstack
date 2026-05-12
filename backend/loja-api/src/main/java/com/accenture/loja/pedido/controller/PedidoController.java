package com.accenture.loja.pedido.controller;

import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.pedido.dto.CancelarPedidoRequestDTO;
import com.accenture.loja.pedido.dto.CriarPedidoRequestDTO;
import com.accenture.loja.pedido.dto.PedidoResponseDTO;
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

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> criarPedido(@RequestBody @Valid CriarPedidoRequestDTO request) {
        Pedido pedido = pedidoService.criarPedido(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponseDTO(pedido));
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidos() {
        List<Pedido> pedidos = pedidoService.listarPedidos();
        List<PedidoResponseDTO> dtos = pedidos.stream()
                .map(this::mapToResponseDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPedidoPorId(@PathVariable Long id) {
        Pedido pedido = pedidoService.buscarPedidoPorId(id);
        return ResponseEntity.ok(mapToResponseDTO(pedido));
    }

    @PostMapping("/{id}/reservar")
    public ResponseEntity<PedidoResponseDTO> reservarPedido(@PathVariable Long id) {
        Pedido pedido = pedidoService.reservarPedido(id);
        return ResponseEntity.ok(mapToResponseDTO(pedido));
    }

    @PostMapping("/{id}/pagar")
    public ResponseEntity<PedidoResponseDTO> pagarPedido(@PathVariable Long id) {
        Pedido pedido = pedidoService.pagarPedido(id);
        return ResponseEntity.ok(mapToResponseDTO(pedido));
    }
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<PedidoResponseDTO> cancelarPedido(
            @PathVariable Long id,
            @RequestBody @Valid CancelarPedidoRequestDTO request) {
        Pedido pedido = pedidoService.cancelarPedido(id, request.getMotivoCancelamento());
        return ResponseEntity.ok(mapToResponseDTO(pedido));
    }

    private PedidoResponseDTO mapToResponseDTO(Pedido pedido) {
        return PedidoResponseDTO.builder()
                .idPedido(pedido.getIdPedido())
                .clienteId(pedido.getCliente().getId())
                .status(pedido.getStatus().name())
                .dataCriacao(pedido.getDataCriacao())
                .dataReserva(pedido.getDataReserva())
                .dataPagamento(pedido.getDataPagamento())
                .dataCancelamento(pedido.getDataCancelamento())
                .motivoCancelamento(pedido.getMotivoCancelamento())
                .desconto(pedido.getDesconto())
                .totalBruto(pedido.getTotalBruto())
                .totalFinal(pedido.getTotalFinal())
                .build();
    }

}