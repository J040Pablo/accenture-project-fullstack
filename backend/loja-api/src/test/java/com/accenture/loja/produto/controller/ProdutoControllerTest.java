package com.accenture.loja.produto.controller;

import com.accenture.loja.produto.dto.EstoqueRequestDTO;
import com.accenture.loja.produto.dto.ProdutoRequestDTO;
import com.accenture.loja.produto.dto.ProdutoResponseDTO;
import com.accenture.loja.produto.service.ProdutoService;
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

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

@WebMvcTest(ProdutoController.class)
@Import(GlobalExceptionHandler.class)
class ProdutoControllerTest {

    private static final String BASE_URL = "/api/produtos";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private ProdutoService produtoService;

    @Test
    void deveCadastrarProdutoComBodyValido() throws Exception {
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook", "Eletrônicos", new BigDecimal("3000.00"), 10);
        ProdutoResponseDTO response = new ProdutoResponseDTO(1L, "SKU-001", "Notebook", "Eletrônicos", new BigDecimal("3000.00"), 10, true);

        when(produtoService.cadastrar(request)).thenReturn(response);

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/produtos/1"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sku").value("SKU-001"))
                .andExpect(jsonPath("$.nome").value("Notebook"))
                .andExpect(jsonPath("$.categoria").value("Eletrônicos"))
                .andExpect(jsonPath("$.preco").value(3000.00))
                .andExpect(jsonPath("$.estoque").value(10))
                .andExpect(jsonPath("$.ativo").value(true));

        verify(produtoService).cadastrar(request);
    }

    @Test
    void deveListarProdutos() throws Exception {
        List<ProdutoResponseDTO> response = List.of(
                new ProdutoResponseDTO(1L, "SKU-001", "Notebook", "Eletrônicos", new BigDecimal("3000.00"), 10, true),
                new ProdutoResponseDTO(2L, "SKU-002", "Mouse", "Periféricos", new BigDecimal("100.00"), 20, false)
        );

        when(produtoService.listar()).thenReturn(response);

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].sku").value("SKU-001"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].sku").value("SKU-002"));

        verify(produtoService).listar();
    }

    @Test
    void deveBuscarProdutoPorId() throws Exception {
        ProdutoResponseDTO response = new ProdutoResponseDTO(1L, "SKU-001", "Notebook", "Eletrônicos", new BigDecimal("3000.00"), 10, true);

        when(produtoService.buscarPorId(1L)).thenReturn(response);

        mockMvc.perform(get(BASE_URL + "/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sku").value("SKU-001"))
                .andExpect(jsonPath("$.nome").value("Notebook"))
                .andExpect(jsonPath("$.categoria").value("Eletrônicos"))
                .andExpect(jsonPath("$.preco").value(3000.00))
                .andExpect(jsonPath("$.estoque").value(10))
                .andExpect(jsonPath("$.ativo").value(true));

        verify(produtoService).buscarPorId(1L);
    }

    @Test
    void deveAtualizarProdutoComBodyValido() throws Exception {
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook Pro", "Eletrônicos", new BigDecimal("3500.00"), 12);
        ProdutoResponseDTO response = new ProdutoResponseDTO(1L, "SKU-001", "Notebook Pro", "Eletrônicos", new BigDecimal("3500.00"), 12, true);

        when(produtoService.atualizar(1L, request)).thenReturn(response);

        mockMvc.perform(put(BASE_URL + "/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sku").value("SKU-001"))
                .andExpect(jsonPath("$.nome").value("Notebook Pro"))
                .andExpect(jsonPath("$.preco").value(3500.00))
                .andExpect(jsonPath("$.estoque").value(12));

        verify(produtoService).atualizar(1L, request);
    }

    @Test
    void deveExcluirProdutoERetornarNoContent() throws Exception {
        mockMvc.perform(delete(BASE_URL + "/{id}", 1L))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(produtoService).deletarProduto(1L);
    }

    @Test
    void deveAtivarProdutoERetornarOk() throws Exception {
        ProdutoResponseDTO response = new ProdutoResponseDTO(1L, "SKU-001", "Notebook", "Eletrônicos", new BigDecimal("3000.00"), 10, true);

        when(produtoService.ativarProduto(1L)).thenReturn(response);

        mockMvc.perform(patch(BASE_URL + "/{id}/ativar", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.ativo").value(true));

        verify(produtoService).ativarProduto(1L);
    }

    @Test
    void deveInativarProdutoERetornarOk() throws Exception {
        ProdutoResponseDTO response = new ProdutoResponseDTO(1L, "SKU-001", "Notebook", "Eletrônicos", new BigDecimal("3000.00"), 10, false);

        when(produtoService.inativarProduto(1L)).thenReturn(response);

        mockMvc.perform(patch(BASE_URL + "/{id}/inativar", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.ativo").value(false));

        verify(produtoService).inativarProduto(1L);
    }

    @Test
    void deveBaixarEstoqueComQuantidadeValidaERetornarNoContent() throws Exception {
        EstoqueRequestDTO request = new EstoqueRequestDTO(3);

        mockMvc.perform(post(BASE_URL + "/{id}/baixar-estoque", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(produtoService).baixarEstoque(1L, 3);
    }

    @Test
    void deveDevolverEstoqueComQuantidadeValidaERetornarNoContent() throws Exception {
        EstoqueRequestDTO request = new EstoqueRequestDTO(4);

        mockMvc.perform(post(BASE_URL + "/{id}/devolver-estoque", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(produtoService).devolverEstoque(1L, 4);
    }

    @Test
    void deveRetornarBadRequestQuandoCadastrarComBodyInvalido() throws Exception {
        ProdutoRequestDTO bodyInvalido = criarRequestValido("", "Notebook", "Eletrônicos", new BigDecimal("3000.00"), 10);

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bodyInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.erro").value("Erro de validação"))
                .andExpect(jsonPath("$.mensagem").value("SKU é obrigatório"));

        verify(produtoService, never()).cadastrar(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deveRetornarBadRequestQuandoBaixarEstoqueComQuantidadeZero() throws Exception {
        EstoqueRequestDTO request = new EstoqueRequestDTO(0);

        mockMvc.perform(post(BASE_URL + "/{id}/baixar-estoque", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.erro").value("Erro de validação"))
                .andExpect(jsonPath("$.mensagem").value("Quantidade deve ser maior que zero"));

        verify(produtoService, never()).baixarEstoque(org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deveRetornarBadRequestQuandoDevolverEstoqueComQuantidadeNegativa() throws Exception {
        EstoqueRequestDTO request = new EstoqueRequestDTO(-1);

        mockMvc.perform(post(BASE_URL + "/{id}/devolver-estoque", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.erro").value("Erro de validação"))
                .andExpect(jsonPath("$.mensagem").value("Quantidade deve ser maior que zero"));

        verify(produtoService, never()).devolverEstoque(org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deveRetornarBadRequestQuandoServiceLancarBusinessException() throws Exception {
        ProdutoRequestDTO request = criarRequestValido("SKU-001", "Notebook", "Eletrônicos", new BigDecimal("3000.00"), 10);

        doThrow(new BusinessException("SKU já cadastrado"))
                .when(produtoService).cadastrar(request);

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.erro").value("Erro de regra de negócio"))
                .andExpect(jsonPath("$.mensagem").value("SKU já cadastrado"));

        verify(produtoService).cadastrar(request);
    }

    private ProdutoRequestDTO criarRequestValido(String sku, String nome, String categoria, BigDecimal preco, Integer estoque) {
        return new ProdutoRequestDTO(sku, nome, categoria, preco, estoque);
    }
}
