package com.accenture.loja.empresa.service;

import com.accenture.loja.empresa.dto.EmpresaRequestDTO;
import com.accenture.loja.empresa.dto.EmpresaResponseDTO;
import com.accenture.loja.empresa.model.Empresa;
import com.accenture.loja.empresa.repository.EmpresaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.shared.enums.TipoTitularConta;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public EmpresaService(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    @Transactional
    public EmpresaResponseDTO cadastrar(EmpresaRequestDTO request) {
        if (empresaRepository.existsByCnpj(request.cnpj())) {
            throw new IllegalArgumentException("CNPJ já cadastrado");
        }

        Empresa empresa = new Empresa(
                request.razaoSocial(),
                request.nomeFantasia(),
                request.cnpj(),
                request.email(),
                request.telefone()
        );

        ContaCorrente conta = ContaCorrente.builder()
            .numeroConta(gerarNumeroConta())
            .saldo(BigDecimal.ZERO)
            .tipoTitular(TipoTitularConta.EMPRESA)
            .build();

        empresa.setContaCorrente(conta);

        Empresa empresaSalva = empresaRepository.save(empresa);

        return toResponseDTO(empresaSalva);
    }

    private String gerarNumeroConta() {
        Random random = new Random();
        return String.valueOf(10000 + random.nextInt(90000));
    }

    public List<EmpresaResponseDTO> listar() {
        return empresaRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public EmpresaResponseDTO buscarPorId(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa não encontrada"));

        return toResponseDTO(empresa);
    }

    private EmpresaResponseDTO toResponseDTO(Empresa empresa) {
        return new EmpresaResponseDTO(
                empresa.getId(),
                empresa.getRazaoSocial(),
                empresa.getNomeFantasia(),
                empresa.getCnpj(),
                empresa.getEmail(),
                empresa.getTelefone(),
                empresa.getAtivo()
        );
    }
}