package com.accenture.loja.endereco.service;

import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ViaCepServiceTest {

    private RestTemplate restTemplate;

    private ViaCepService viaCepService;

    @BeforeEach
    void setup() {

        restTemplate = Mockito.mock(RestTemplate.class);

        viaCepService = new ViaCepService(restTemplate);
    }

    @Test
    void deveBuscarCepComSucesso() {

        String cep = "58400000";

        String url =
                "https://viacep.com.br/ws/" + cep + "/json/";

        ViaCepResponseDTO response =
                ViaCepResponseDTO.builder()
                        .cep(cep)
                        .logradouro("Rua João Suassuna")
                        .bairro("Centro")
                        .localidade("Campina Grande")
                        .uf("PB")
                        .build();

        when(restTemplate.getForObject(
                url,
                ViaCepResponseDTO.class
        )).thenReturn(response);

        ViaCepResponseDTO resultado =
                viaCepService.buscarCep(cep);

        assertNotNull(resultado);
        assertEquals(cep, resultado.getCep());
        assertEquals("Centro", resultado.getBairro());
        assertEquals("PB", resultado.getUf());

        verify(restTemplate, times(1))
                .getForObject(url, ViaCepResponseDTO.class);
    }
}