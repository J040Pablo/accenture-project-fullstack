package com.accenture.loja.conta.service;

import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.empresa.model.Empresa;
import com.accenture.loja.empresa.repository.EmpresaRepository;
import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.mapper.ContaCorrenteMapper;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.RegraNegocioException;
import com.accenture.loja.shared.util.GeradorNumeroConta;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContaCorrenteService {

    private final ContaCorrenteRepository contaCorrenteRepository;
    private final ContaCorrenteMapper contaCorrenteMapper;
    private final ClienteRepository clienteRepository;
    private final EmpresaRepository empresaRepository;

    public List<ContaCorrenteResponseDTO> listarContas() {
        return contaCorrenteRepository.findAll()
                .stream()
                .map(this::toResponseDTOComTitular)
                .toList();
    }

    public ContaCorrenteResponseDTO buscarPorId(Long id) {
        ContaCorrente conta = contaCorrenteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Conta não encontrada"));

        return toResponseDTOComTitular(conta);
    }

    public ContaCorrente buscarContaEmpresa() {
        List<ContaCorrente> contasEmpresa =
                contaCorrenteRepository.findByTipoTitular(TipoTitularConta.EMPRESA);

        if (contasEmpresa.isEmpty()) {
            throw new RegraNegocioException("Conta da empresa não encontrada.");
        }

        if (contasEmpresa.size() > 1) {
            throw new RegraNegocioException("Há mais de uma conta da empresa cadastrada.");
        }

        return contasEmpresa.get(0);
    }

    public boolean existeContaEmpresa() {
        return !contaCorrenteRepository
                .findByTipoTitular(TipoTitularConta.EMPRESA)
                .isEmpty();
    }

    public ContaCorrente criarContaPara(TipoTitularConta tipoTitular) {
        return ContaCorrente.builder()
                .numeroConta(GeradorNumeroConta.gerarNumeroConta())
                .saldo(BigDecimal.ZERO)
                .tipoTitular(tipoTitular)
                .build();
    }

    @Transactional
    public void transferir(ContaCorrente origem, ContaCorrente destino, BigDecimal valor) {
        if (origem == null) {
            throw new RegraNegocioException("Conta de origem não encontrada.");
        }

        if (destino == null) {
            throw new RegraNegocioException("Conta de destino não encontrada.");
        }

        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("Valor deve ser maior que zero.");
        }

        origem.debitar(valor);
        destino.creditar(valor);

        contaCorrenteRepository.save(origem);
        contaCorrenteRepository.save(destino);
    }

    public ContaCorrente salvar(ContaCorrente conta) {
        return contaCorrenteRepository.save(conta);
    }

    private ContaCorrenteResponseDTO toResponseDTOComTitular(ContaCorrente conta) {
        ContaCorrenteResponseDTO dto = contaCorrenteMapper.toResponseDTO(conta);

        if (dto != null) {
            dto.setTitularNome(resolverTitularNome(conta));
        }

        return dto;
    }

    private String resolverTitularNome(ContaCorrente conta) {
        if (conta == null || conta.getId() == null) {
            return null;
        }

        return switch (conta.getTipoTitular()) {
            case CLIENTE -> clienteRepository.findByContaCorrente_Id(conta.getId())
                    .map(Cliente::getNome)
                    .orElse(null);
            case EMPRESA -> empresaRepository.findByContaCorrente_Id(conta.getId())
                    .map(Empresa::getRazaoSocial)
                    .orElse(null);
        };
    }
}