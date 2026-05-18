package com.accenture.loja.conta.controller;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.service.ContaCorrenteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contas")
@RequiredArgsConstructor
@Tag(
        name = "Contas Correntes",
        description = "Gerenciamento de contas correntes de clientes e empresas"
)
public class ContaCorrenteController {

    private final ContaCorrenteService contaCorrenteService;

    @GetMapping
    @Operation(summary = "Lista todas as contas correntes")
    public ResponseEntity<List<ContaCorrenteResponseDTO>> listar() {
        List<ContaCorrenteResponseDTO> contas = contaCorrenteService.listarContas();
        return ResponseEntity.ok(contas);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca uma conta corrente por ID")
    public ResponseEntity<ContaCorrenteResponseDTO> buscarPorId(@PathVariable Long id) {
        ContaCorrenteResponseDTO conta = contaCorrenteService.buscarPorId(id);
        return ResponseEntity.ok(conta);
    }
}