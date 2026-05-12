package com.accenture.loja.conta.controller;

import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.service.ContaCorrenteService;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ContaCorrenteControllerTest {

    private MockMvc mockMvc;
    private ContaCorrenteService contaCorrenteService;

    private ContaCorrenteResponseDTO contaCliente;
    private ContaCorrenteResponseDTO contaEmpresa;

    @BeforeEach
    void setup() {
        contaCorrenteService = Mockito.mock(ContaCorrenteService.class);

        ContaCorrenteController controller = new ContaCorrenteController(contaCorrenteService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .build();

        contaCliente = ContaCorrenteResponseDTO.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(new BigDecimal("1000.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        contaEmpresa = ContaCorrenteResponseDTO.builder()
                .id(2L)
                .numeroConta("67890")
                .saldo(new BigDecimal("5000.00"))
                .tipoTitular(TipoTitularConta.EMPRESA)
                .build();
    }

    @Test
    void deveListarContas() throws Exception {
        when(contaCorrenteService.listarContas())
                .thenReturn(List.of(contaCliente, contaEmpresa));

        mockMvc.perform(get("/api/contas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].numeroConta").value("12345"))
                .andExpect(jsonPath("$[0].saldo").value(1000.00))
                .andExpect(jsonPath("$[0].tipoTitular").value("CLIENTE"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].numeroConta").value("67890"))
                .andExpect(jsonPath("$[1].saldo").value(5000.00))
                .andExpect(jsonPath("$[1].tipoTitular").value("EMPRESA"));

        verify(contaCorrenteService).listarContas();
    }

    @Test
    void deveListarContasVazia() throws Exception {
        when(contaCorrenteService.listarContas())
                .thenReturn(List.of());

        mockMvc.perform(get("/api/contas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(contaCorrenteService).listarContas();
    }

    @Test
    void deveBuscarContaClientePorId() throws Exception {
        when(contaCorrenteService.buscarPorId(1L))
                .thenReturn(contaCliente);

        mockMvc.perform(get("/api/contas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.numeroConta").value("12345"))
                .andExpect(jsonPath("$.saldo").value(1000.00))
                .andExpect(jsonPath("$.tipoTitular").value("CLIENTE"));

        verify(contaCorrenteService).buscarPorId(1L);
    }

    @Test
    void deveBuscarContaEmpresaPorId() throws Exception {
        when(contaCorrenteService.buscarPorId(2L))
                .thenReturn(contaEmpresa);

        mockMvc.perform(get("/api/contas/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.numeroConta").value("67890"))
                .andExpect(jsonPath("$.saldo").value(5000.00))
                .andExpect(jsonPath("$.tipoTitular").value("EMPRESA"));

        verify(contaCorrenteService).buscarPorId(2L);
    }
}