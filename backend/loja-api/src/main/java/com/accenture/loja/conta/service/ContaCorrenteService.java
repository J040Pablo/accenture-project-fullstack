package com.accenture.loja.conta.service;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContaCorrenteService {

	private final ContaCorrenteRepository contaCorrenteRepository;

	public List<ContaCorrenteResponseDTO> listarContas() {

		return contaCorrenteRepository.findAll().stream().map(this::converterParaResponse).toList();
	}

	public ContaCorrenteResponseDTO buscarPorId(Long id) {

		ContaCorrente conta = contaCorrenteRepository.findById(id)
				.orElseThrow(() -> new BusinessException("Conta não encontrada"));

		return converterParaResponse(conta);
	}

	private ContaCorrenteResponseDTO converterParaResponse(ContaCorrente conta) {

		return ContaCorrenteResponseDTO.builder().id(conta.getId()).numeroConta(conta.getNumeroConta())
				.saldo(conta.getSaldo()).build();
	}
}