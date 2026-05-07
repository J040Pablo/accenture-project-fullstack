package com.accenture.loja.empresa.controller;

import com.accenture.loja.empresa.dto.EmpresaRequestDTO;
import com.accenture.loja.empresa.dto.EmpresaResponseDTO;
import com.accenture.loja.empresa.service.EmpresaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    private final EmpresaService empresaService;

    public EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    @PostMapping
    public ResponseEntity<EmpresaResponseDTO> cadastrar(@RequestBody @Valid EmpresaRequestDTO request) {
        EmpresaResponseDTO response = empresaService.cadastrar(request);

        return ResponseEntity
                .created(URI.create("/api/empresas/" + response.id()))
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<EmpresaResponseDTO>> listar() {
        return ResponseEntity.ok(empresaService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(empresaService.buscarPorId(id));
    }
}