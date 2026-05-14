package com.accenture.loja.cliente.controller;

import com.accenture.loja.cliente.dto.ClienteRequestDTO;
import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @PostMapping
    public ClienteResponseDTO criar(@RequestBody @Valid ClienteRequestDTO dto) {

        return clienteService.criarCliente(dto);
    }

    @GetMapping
    public List<ClienteResponseDTO> listar() {

        return clienteService.listarClientes();
    }

    @GetMapping("/{id}")
    public ClienteResponseDTO buscarPorId(@PathVariable Long id) {

        return clienteService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public ClienteResponseDTO atualizar(
        @PathVariable Long id,
        @RequestBody @Valid ClienteRequestDTO dto
    ) {
        return clienteService.atualizarCliente(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {

        clienteService.deletarCliente(id);
    }
}