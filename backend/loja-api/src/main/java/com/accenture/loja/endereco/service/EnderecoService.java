package com.accenture.loja.endereco.service;

import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.repository.EnderecoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;

    public List<EnderecoResponseDTO> listar() {

        return enderecoRepository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    public EnderecoResponseDTO buscarPorId(Long id) {

        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        return converterParaDTO(endereco);
    }

    public EnderecoResponseDTO salvar(Endereco endereco) {

        Endereco enderecoSalvo = enderecoRepository.save(endereco);

        return converterParaDTO(enderecoSalvo);
    }

    public EnderecoResponseDTO atualizar(Long id, Endereco enderecoAtualizado) {

        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        endereco.setCep(enderecoAtualizado.getCep());
        endereco.setRua(enderecoAtualizado.getRua());
        endereco.setNumero(enderecoAtualizado.getNumero());
        endereco.setComplemento(enderecoAtualizado.getComplemento());
        endereco.setBairro(enderecoAtualizado.getBairro());
        endereco.setCidade(enderecoAtualizado.getCidade());
        endereco.setUf(enderecoAtualizado.getUf());

        Endereco enderecoSalvo = enderecoRepository.save(endereco);

        return converterParaDTO(enderecoSalvo);
    }

    public void deletar(Long id) {

        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        enderecoRepository.delete(endereco);
    }

    private EnderecoResponseDTO converterParaDTO(Endereco endereco) {

        return EnderecoResponseDTO.builder()
                .id(endereco.getId())
                .cep(endereco.getCep())
                .rua(endereco.getRua())
                .numero(endereco.getNumero())
                .complemento(endereco.getComplemento())
                .bairro(endereco.getBairro())
                .cidade(endereco.getCidade())
                .uf(endereco.getUf())
                .build();
    }
}