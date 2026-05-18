package com.accenture.loja.empresa.controller;

import com.accenture.loja.empresa.dto.EmpresaRequestDTO;
import com.accenture.loja.empresa.dto.EmpresaResponseDTO;
import com.accenture.loja.empresa.service.EmpresaService;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class EmpresaControllerTest {

    @Mock
    private EmpresaService empresaService;

    @InjectMocks
    private EmpresaController controller;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    private EmpresaRequestDTO requestDTO;
    private EmpresaResponseDTO responseDTO;

    @BeforeEach
    void setup() {

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();

        requestDTO = new EmpresaRequestDTO(
                "Razao Social",
                "Nome Fantasia",
                "11111111111111",
                "empresa@email.com",
                "1234"
        );

        responseDTO = new EmpresaResponseDTO(
                1L,
                "Razao Social",
                "Nome Fantasia",
                "11111111111111",
                "empresa@email.com",
                "1234",
                true
        );
    }

    @Test
    void deveCadastrarEmpresaComSucesso() throws Exception {

        when(empresaService.cadastrar(any(EmpresaRequestDTO.class)))
                .thenReturn(responseDTO);

        mockMvc.perform(post("/api/empresas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(header()
                        .string("Location", "/api/empresas/1"))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.razaoSocial",
                        is("Razao Social")))
                .andExpect(jsonPath("$.nomeFantasia",
                        is("Nome Fantasia")))
                .andExpect(jsonPath("$.cnpj",
                        is("11111111111111")))
                .andExpect(jsonPath("$.email",
                        is("empresa@email.com")))
                .andExpect(jsonPath("$.ativo",
                        is(true)));

        verify(empresaService, times(1))
                .cadastrar(any(EmpresaRequestDTO.class));
    }

    @Test
    void deveListarEmpresas() throws Exception {

        List<EmpresaResponseDTO> empresas = List.of(
                responseDTO,
                new EmpresaResponseDTO(
                        2L,
                        "Empresa 2",
                        "Fantasia 2",
                        "22222222222222",
                        "empresa2@email.com",
                        "5678",
                        false
                )
        );

        when(empresaService.listar())
                .thenReturn(empresas);

        mockMvc.perform(get("/api/empresas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$",
                        hasSize(2)))

                .andExpect(jsonPath("$[0].id",
                        is(1)))

                .andExpect(jsonPath("$[0].cnpj",
                        is("11111111111111")))

                .andExpect(jsonPath("$[1].id",
                        is(2)))

                .andExpect(jsonPath("$[1].ativo",
                        is(false)));

        verify(empresaService, times(1))
                .listar();
    }

    @Test
    void deveRetornarListaVazia() throws Exception {

        when(empresaService.listar())
                .thenReturn(List.of());

        mockMvc.perform(get("/api/empresas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$",
                        hasSize(0)));

        verify(empresaService, times(1))
                .listar();
    }

    @Test
    void deveBuscarEmpresaPorId() throws Exception {

        when(empresaService.buscarPorId(1L))
                .thenReturn(responseDTO);

        mockMvc.perform(get("/api/empresas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id",
                        is(1)))

                .andExpect(jsonPath("$.razaoSocial",
                        is("Razao Social")))

                .andExpect(jsonPath("$.cnpj",
                        is("11111111111111")))

                .andExpect(jsonPath("$.ativo",
                        is(true)));

        verify(empresaService, times(1))
                .buscarPorId(1L);
    }

    @Test
    void deveRetornarErroQuandoEmpresaNaoEncontrada() throws Exception {

        when(empresaService.buscarPorId(99L))
                .thenThrow(new BusinessException(
                        "Empresa não encontrada"
                ));

        mockMvc.perform(get("/api/empresas/99"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status",
                        is(400)))

                .andExpect(jsonPath("$.erro",
                        is("Erro de regra de negócio")))

                .andExpect(jsonPath("$.mensagem",
                        is("Empresa não encontrada")));

        verify(empresaService, times(1))
                .buscarPorId(99L);
    }

    @Test
    void deveRetornarErroQuandoCadastrarEmpresaDuplicada()
            throws Exception {

        when(empresaService.cadastrar(any(EmpresaRequestDTO.class)))
                .thenThrow(new BusinessException(
                        "CNPJ duplicado"
                ));

        mockMvc.perform(post("/api/empresas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status",
                        is(400)))

                .andExpect(jsonPath("$.erro",
                        is("Erro de regra de negócio")))

                .andExpect(jsonPath("$.mensagem",
                        is("CNPJ duplicado")));

        verify(empresaService, times(1))
                .cadastrar(any(EmpresaRequestDTO.class));
    }

    @Test
    void deveRetornarErroQuandoBodyForInvalido() throws Exception {

        EmpresaRequestDTO invalido = new EmpresaRequestDTO(
                "",
                "",
                "",
                "",
                ""
        );

        mockMvc.perform(post("/api/empresas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalido)))
                .andExpect(status().isBadRequest());

        verify(empresaService, never())
                .cadastrar(any(EmpresaRequestDTO.class));
    }
}