package com.accenture.loja.endereco.service;

import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.ResourceNotFoundException;
import com.accenture.loja.shared.exception.ServiceUnavailableException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ViaCepService {

    private final RestTemplate restTemplate;

    public ViaCepResponseDTO buscarCep(String cep) {

        validarCep(cep);

        try {

            String url =
                    "https://viacep.com.br/ws/" + cep + "/json/";

            ViaCepResponseDTO response =
                    restTemplate.getForObject(
                            url,
                            ViaCepResponseDTO.class
                    );

            if (response == null
                    || Boolean.TRUE.equals(response.getErro())) {

                throw new ResourceNotFoundException(
                        "CEP não encontrado"
                );
            }

            return response;

        } catch (RestClientException e) {

            throw new ServiceUnavailableException(
                    "Serviço ViaCEP indisponível"
            );
        }
    }

    private void validarCep(String cep) {

        if (cep == null || cep.isBlank()) {

            throw new BusinessException(
                    "CEP é obrigatório"
            );
        }

        if (!cep.matches("\\d{8}")) {

            throw new BusinessException(
                    "CEP inválido"
            );
        }
    }
}