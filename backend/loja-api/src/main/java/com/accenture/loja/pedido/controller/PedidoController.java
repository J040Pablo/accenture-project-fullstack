package com.accenture.loja.pedido.controller;

import com.accenture.loja.pedido.model.Pedido;
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
        // Exemplo simplificado. Idealmente, usaria paginação (Pageable) no repositório.
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPedidoPorId(@PathVariable Long id) {
        // Necessário adicionar método no service para buscar
        return ResponseEntity.ok(new PedidoResponseDTO());
    }

    @PostMapping("/{id}/reservar")
    public ResponseEntity<PedidoResponseDTO> reservarPedido(@PathVariable Long id) {
        Pedido pedido = pedidoService.reservarPedido(id);
        return ResponseEntity.ok(mapToResponseDTO(pedido));
    }

    private PedidoResponseDTO mapToResponseDTO(Pedido pedido) {
        PedidoResponseDTO dto = new PedidoResponseDTO();
        dto.setIdPedido(pedido.getIdPedido());
        dto.setClienteId(pedido.getCliente().getId());
        dto.setStatus(pedido.getStatus().name());
        dto.setDesconto(pedido.getDesconto());
        dto.setTotalBruto(pedido.getTotalBruto());
        dto.setTotalFinal(pedido.getTotalFinal());
        dto.setDataCriacao(pedido.getDataCriacao());
        dto.setDataReserva(pedido.getDataReserva());
        return dto;
    }

}