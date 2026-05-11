package com.accenture.loja.endereco.service;

import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ViaCepService {

    private final RestTemplate restTemplate;

    public ViaCepResponseDTO buscarCep(String cep) {

        String url = "https://viacep.com.br/ws/" + cep + "/json/";

        return restTemplate.getForObject(url, ViaCepResponseDTO.class);
    }
}