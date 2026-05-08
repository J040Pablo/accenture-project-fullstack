package com.accenture.loja.empresa.service;

import com.accenture.loja.empresa.dto.EmpresaRequestDTO;
import com.accenture.loja.empresa.dto.EmpresaResponseDTO;
import com.accenture.loja.empresa.model.Empresa;
import com.accenture.loja.empresa.repository.EmpresaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

        Empresa empresaSalva = empresaRepository.save(empresa);

        return toResponseDTO(empresaSalva);
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