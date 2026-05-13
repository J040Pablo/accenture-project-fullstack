package com.accenture.loja.endereco.service;

import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.mapper.EnderecoMapper;
import com.accenture.loja.endereco.repository.EnderecoRepository;
import com.accenture.loja.shared.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final EnderecoMapper enderecoMapper;

    public List<EnderecoResponseDTO> listar() {

        return enderecoRepository.findAll()
                .stream()
                .map(enderecoMapper::toResponseDTO)
                .toList();
    }

    public EnderecoResponseDTO buscarPorId(Long id) {

        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Endereço não encontrado"));

        return enderecoMapper.toResponseDTO(endereco);
    }

    public EnderecoResponseDTO salvar(Endereco endereco) {

        Endereco enderecoSalvo = enderecoRepository.save(endereco);

        return enderecoMapper.toResponseDTO(enderecoSalvo);
    }

    public EnderecoResponseDTO atualizar(Long id, Endereco enderecoAtualizado) {

        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Endereço não encontrado"));

        endereco.setCep(enderecoAtualizado.getCep());
        endereco.setRua(enderecoAtualizado.getRua());
        endereco.setNumero(enderecoAtualizado.getNumero());
        endereco.setComplemento(enderecoAtualizado.getComplemento());
        endereco.setBairro(enderecoAtualizado.getBairro());
        endereco.setCidade(enderecoAtualizado.getCidade());
        endereco.setUf(enderecoAtualizado.getUf());

        Endereco enderecoSalvo = enderecoRepository.save(endereco);

        return enderecoMapper.toResponseDTO(enderecoSalvo);
    }

    public void deletar(Long id) {

        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Endereço não encontrado"));

        enderecoRepository.delete(endereco);
    }

   
}