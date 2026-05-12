package com.accenture.loja.endereco.service;

import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import com.accenture.loja.shared.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ViaCepService {

    private final RestTemplate restTemplate;

    public ViaCepResponseDTO buscarCep(String cep) {

        try {

            String url = "https://viacep.com.br/ws/" + cep + "/json/";

            ViaCepResponseDTO response =
                    restTemplate.getForObject(url, ViaCepResponseDTO.class);

            if (response == null
                    || Boolean.TRUE.equals(response.getErro())) {

                throw new BusinessException("CEP não encontrado");
            }

            return response;

        } catch (RestClientException e) {

            throw new RuntimeException(
                    "Erro ao consultar serviço do ViaCEP"
            );
        }
    }
}