package com.accenture.loja.conta.controller;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.service.ContaCorrenteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contas")
@RequiredArgsConstructor
public class ContaCorrenteController {

	private final ContaCorrenteService contaCorrenteService;

	@GetMapping
	public List<ContaCorrenteResponseDTO> listar() {

		return contaCorrenteService.listarContas();
	}

	@GetMapping("/{id}")
	public ContaCorrenteResponseDTO buscarPorId(@PathVariable Long id) {

		return contaCorrenteService.buscarPorId(id);
	}
}