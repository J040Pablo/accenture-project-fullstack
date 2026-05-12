package com.accenture.loja.conta.controller;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.service.ContaCorrenteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ContaCorrenteControllerTest {

    private MockMvc mockMvc;

    private ContaCorrenteService contaCorrenteService;

    @BeforeEach
    void setup() {

        contaCorrenteService =
                Mockito.mock(ContaCorrenteService.class);

        ContaCorrenteController controller =
                new ContaCorrenteController(contaCorrenteService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .build();
    }

    @Test
    void deveListarContas() throws Exception {

        ContaCorrenteResponseDTO conta =
                ContaCorrenteResponseDTO.builder()
                        .id(1L)
                        .numeroConta("12345")
                        .saldo(BigDecimal.ZERO)
                        .build();

        when(contaCorrenteService.listarContas())
                .thenReturn(List.of(conta));

        mockMvc.perform(get("/api/contas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id")
                        .value(1))
                .andExpect(jsonPath("$[0].numeroConta")
                        .value("12345"));
    }
}