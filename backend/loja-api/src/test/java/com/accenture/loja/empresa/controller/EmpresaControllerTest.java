package com.accenture.loja.empresa.controller;

import com.accenture.loja.empresa.dto.EmpresaRequestDTO;
import com.accenture.loja.empresa.dto.EmpresaResponseDTO;
import com.accenture.loja.empresa.service.EmpresaService;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EmpresaController.class)
@Import(GlobalExceptionHandler.class)
class EmpresaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private EmpresaService empresaService;

    @Test
    void deveCadastrarEmpresaComBodyValido() throws Exception {
        EmpresaRequestDTO request = new EmpresaRequestDTO("Razao", "Fantasia", "11111111111111", "a@b.com", "1234");
        EmpresaResponseDTO response = new EmpresaResponseDTO(1L, "Razao", "Fantasia", "11111111111111", "a@b.com", "1234", true);

        when(empresaService.cadastrar(request)).thenReturn(response);

        mockMvc.perform(post("/api/empresas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/empresas/1"))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.cnpj", is("11111111111111")))
                .andExpect(jsonPath("$.ativo", is(true)));

        verify(empresaService).cadastrar(request);
    }

    @Test
    void deveListarEmpresas() throws Exception {
        List<EmpresaResponseDTO> lista = List.of(
                new EmpresaResponseDTO(1L, "R1", "F1", "1111", "a@b.com", "1111", true),
                new EmpresaResponseDTO(2L, "R2", "F2", "2222", "c@d.com", "2222", false)
        );

        when(empresaService.listar()).thenReturn(lista);

        mockMvc.perform(get("/api/empresas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[1].id", is(2)));

        verify(empresaService).listar();
    }

    @Test
    void deveBuscarEmpresaPorIdExistente() throws Exception {
        EmpresaResponseDTO response = new EmpresaResponseDTO(1L, "R1", "F1", "1111", "a@b.com", "1111", true);

        when(empresaService.buscarPorId(1L)).thenReturn(response);

        mockMvc.perform(get("/api/empresas/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.cnpj", is("1111")));

        verify(empresaService).buscarPorId(1L);
    }

    @Test
    void deveRetornarBadRequestQuandoCadastrarComBodyInvalido() throws Exception {
        // vamos enviar payload com CNPJ vazio, mantendo outros campos válidos
        EmpresaRequestDTO invalid = new EmpresaRequestDTO("Razao", "Fantasia", "", "a@b.com", "1234");

        mockMvc.perform(post("/api/empresas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.erro", is("Erro de validação")))
                .andExpect(jsonPath("$.mensagem", is("CNPJ é obrigatório")));

        verify(empresaService, never()).cadastrar(invalid);
    }

    @Test
    void deveRetornarBadRequestQuandoServiceLancarBusinessExceptionAoCadastrar() throws Exception {
        EmpresaRequestDTO request = new EmpresaRequestDTO("Razao", "Fantasia", "33333333333333", "a@b.com", null);

        doThrow(new BusinessException("CNPJ duplicado"))
                .when(empresaService).cadastrar(request);

        mockMvc.perform(post("/api/empresas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.erro", is("Erro de regra de negócio")))
                .andExpect(jsonPath("$.mensagem", is("CNPJ duplicado")));

        verify(empresaService).cadastrar(request);
    }

    @Test
    void deveRetornarBadRequestQuandoBuscarPorIdInexistenteEServiceLancarBusinessException() throws Exception {
        doThrow(new BusinessException("Empresa não encontrada"))
                .when(empresaService).buscarPorId(99L);

        mockMvc.perform(get("/api/empresas/{id}", 99L))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.erro", is("Erro de regra de negócio")))
                .andExpect(jsonPath("$.mensagem", is("Empresa não encontrada")));

        verify(empresaService).buscarPorId(99L);
    }
}
