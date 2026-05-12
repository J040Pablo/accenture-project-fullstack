package com.accenture.loja.conta.service;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.RegraNegocioException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContaCorrenteService {

    private final ContaCorrenteRepository contaCorrenteRepository;

    public List<ContaCorrenteResponseDTO> listarContas() {
        return contaCorrenteRepository.findAll()
                .stream()
                .map(this::converterParaResponse)
                .toList();
    }

    public ContaCorrenteResponseDTO buscarPorId(Long id) {
        ContaCorrente conta = contaCorrenteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Conta não encontrada"));

        return converterParaResponse(conta);
    }

    public ContaCorrente buscarContaEmpresa() {
        return contaCorrenteRepository.findByTipoTitular(TipoTitularConta.EMPRESA)
                .orElseThrow(() -> new RegraNegocioException("Conta da empresa não encontrada."));
    }

    public void transferir(ContaCorrente origem, ContaCorrente destino, BigDecimal valor) {
        if (origem == null) {
            throw new RegraNegocioException("Conta de origem não encontrada.");
        }

        if (destino == null) {
            throw new RegraNegocioException("Conta de destino não encontrada.");
        }

        origem.debitar(valor);
        destino.creditar(valor);

        contaCorrenteRepository.save(origem);
        contaCorrenteRepository.save(destino);
    }

    public ContaCorrente salvar(ContaCorrente conta) {
        return contaCorrenteRepository.save(conta);
    }

    private ContaCorrenteResponseDTO converterParaResponse(ContaCorrente conta) {
        return ContaCorrenteResponseDTO.builder()
                .id(conta.getId())
                .numeroConta(conta.getNumeroConta())
                .saldo(conta.getSaldo())
                .tipoTitular(conta.getTipoTitular())
                .build();
    }
}