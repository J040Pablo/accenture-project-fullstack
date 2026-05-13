package com.accenture.loja.empresa.service;

import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.service.ContaCorrenteService;
import com.accenture.loja.empresa.dto.EmpresaRequestDTO;
import com.accenture.loja.empresa.dto.EmpresaResponseDTO;
import com.accenture.loja.empresa.mapper.EmpresaMapper;
import com.accenture.loja.empresa.model.Empresa;
import com.accenture.loja.empresa.repository.EmpresaRepository;
import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.RegraNegocioException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final ContaCorrenteService contaCorrenteService;
    private final EmpresaMapper empresaMapper;

    public EmpresaService(
            EmpresaRepository empresaRepository,
            ContaCorrenteService contaCorrenteService,
            EmpresaMapper empresaMapper
    ) {
        this.empresaRepository = empresaRepository;
        this.contaCorrenteService = contaCorrenteService;
        this.empresaMapper = empresaMapper;
    }

    @Transactional
    public EmpresaResponseDTO cadastrar(EmpresaRequestDTO request) {
        if (request == null) {
            throw new RegraNegocioException("Dados da empresa são obrigatórios.");
        }

        if (empresaRepository.existsByCnpj(request.cnpj())) {
            throw new RegraNegocioException("CNPJ já cadastrado");
        }

        if (contaCorrenteService.existeContaEmpresa()) {
            throw new RegraNegocioException("Já existe uma conta da empresa cadastrada.");
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

        return empresaMapper.toResponse(empresaSalva);
    }

    public List<EmpresaResponseDTO> listar() {
        return empresaRepository.findAll()
                .stream()
                .map(empresaMapper::toResponse)
                .toList();
    }

    public EmpresaResponseDTO buscarPorId(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Empresa não encontrada"));

        return empresaMapper.toResponse(empresa);
    }

    private String gerarNumeroConta() {
        Random random = new Random();
        return String.valueOf(10000 + random.nextInt(90000));
    }
}