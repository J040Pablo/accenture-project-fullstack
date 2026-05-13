package com.accenture.loja.empresa.mapper;

import com.accenture.loja.empresa.dto.EmpresaResponseDTO;
import com.accenture.loja.empresa.model.Empresa;
import org.springframework.stereotype.Component;

@Component
public class EmpresaMapper {

	public EmpresaResponseDTO toResponse(Empresa empresa) {
		if (empresa == null) {
			return null;
		}

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
