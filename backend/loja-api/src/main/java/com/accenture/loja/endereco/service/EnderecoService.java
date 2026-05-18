package com.accenture.loja.endereco.service;

import com.accenture.loja.endereco.dto.EnderecoRequestDTO;
import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import com.accenture.loja.endereco.mapper.EnderecoMapper;
import com.accenture.loja.endereco.model.Endereco;
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

		return enderecoRepository.findAll().stream().map(enderecoMapper::toResponseDTO).toList();
	}

	public EnderecoResponseDTO buscarPorId(Long id) {

		Endereco endereco = enderecoRepository.findById(id)
				.orElseThrow(() -> new BusinessException("Endereço não encontrado"));

		return enderecoMapper.toResponseDTO(endereco);
	}

	public EnderecoResponseDTO salvar(EnderecoRequestDTO dto) {

		Endereco endereco = Endereco.builder()
				.cep(dto.getCep())
				.rua(dto.getRua())
				.bairro(dto.getBairro())
				.cidade(dto.getCidade())
				.uf(dto.getUf())
				.numero(dto.getNumero())
				.complemento(dto.getComplemento())
				.build();

		Endereco enderecoSalvo = enderecoRepository.save(endereco);

		return enderecoMapper.toResponseDTO(enderecoSalvo);
	}

	public EnderecoResponseDTO atualizar(Long id, EnderecoRequestDTO dto) {

		Endereco endereco = enderecoRepository.findById(id)
				.orElseThrow(() -> new BusinessException("Endereço não encontrado"));

		endereco.setCep(dto.getCep());
		endereco.setRua(dto.getRua());
		endereco.setBairro(dto.getBairro());
		endereco.setCidade(dto.getCidade());
		endereco.setUf(dto.getUf());
		endereco.setNumero(dto.getNumero());
		endereco.setComplemento(dto.getComplemento());

		Endereco enderecoSalvo = enderecoRepository.save(endereco);

		return enderecoMapper.toResponseDTO(enderecoSalvo);
	}

	public void deletar(Long id) {

		Endereco endereco = enderecoRepository.findById(id)
				.orElseThrow(() -> new BusinessException("Endereço não encontrado"));

		enderecoRepository.delete(endereco);
	}
}