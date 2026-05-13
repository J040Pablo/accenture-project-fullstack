package com.accenture.loja.endereco.service;

import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import com.accenture.loja.shared.exception.ResourceNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.client.RestTemplate;
import com.accenture.loja.shared.exception.ServiceUnavailableException;
import org.springframework.web.client.RestClientException;

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

		String url = "https://viacep.com.br/ws/" + cep + "/json/";

		ViaCepResponseDTO response = ViaCepResponseDTO.builder().cep(cep).logradouro("Rua João Suassuna")
				.bairro("Centro").localidade("Campina Grande").uf("PB").build();

		when(restTemplate.getForObject(url, ViaCepResponseDTO.class)).thenReturn(response);

		ViaCepResponseDTO resultado = viaCepService.buscarCep(cep);

		assertNotNull(resultado);
		assertEquals(cep, resultado.getCep());
		assertEquals("Centro", resultado.getBairro());
		assertEquals("PB", resultado.getUf());

		verify(restTemplate, times(1)).getForObject(url, ViaCepResponseDTO.class);
	}

	@Test
	void deveLancarExcecaoQuandoCepInvalido() {

		String cep = "00000000";
		String url = "https://viacep.com.br/ws/" + cep + "/json/";

		ViaCepResponseDTO response = ViaCepResponseDTO.builder().erro(true) // <- simula CEP inválido no ViaCEP
				.build();

		when(restTemplate.getForObject(url, ViaCepResponseDTO.class)).thenReturn(response);

		ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
				() -> viaCepService.buscarCep(cep));

		assertEquals("CEP não encontrado", ex.getMessage());

		verify(restTemplate, times(1)).getForObject(url, ViaCepResponseDTO.class);
	}

	@Test
	void deveLancarExcecaoQuandoViaCepForaDoAr() {

		String cep = "58400000";
		String url = "https://viacep.com.br/ws/" + cep + "/json/";

		when(restTemplate.getForObject(url, ViaCepResponseDTO.class)).thenThrow(new RestClientException("timeout"));

		ServiceUnavailableException ex = assertThrows(ServiceUnavailableException.class,
				() -> viaCepService.buscarCep(cep));

		assertEquals("Serviço ViaCEP indisponível", ex.getMessage());

		verify(restTemplate, times(1)).getForObject(url, ViaCepResponseDTO.class);
	}
}