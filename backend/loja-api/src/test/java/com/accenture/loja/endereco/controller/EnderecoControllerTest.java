package com.accenture.loja.endereco.controller;

import com.accenture.loja.endereco.dto.EnderecoRequestDTO;
import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import com.accenture.loja.endereco.service.EnderecoService;
import com.accenture.loja.endereco.service.ViaCepService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EnderecoControllerTest {

    private EnderecoService enderecoService;
    private ViaCepService viaCepService;
    private EnderecoController enderecoController;

    private EnderecoRequestDTO requestDTO;

    @BeforeEach
    void setup() {

        enderecoService = mock(EnderecoService.class);
        viaCepService = mock(ViaCepService.class);

        enderecoController = new EnderecoController(
                enderecoService,
                viaCepService
        );

        requestDTO = EnderecoRequestDTO.builder()
                .cep("58400000")
                .numero("100")
                .complemento("Apto 101")
                .build();
    }

    @Test
    void deveListarEnderecos() {

        when(enderecoService.listar())
                .thenReturn(List.of());

        List<EnderecoResponseDTO> resultado = enderecoController.listar();

        assertNotNull(resultado);
        verify(enderecoService).listar();
    }

    @Test
    void deveBuscarEnderecoPorId() {

        EnderecoResponseDTO response = EnderecoResponseDTO.builder()
                .id(1L)
                .cep("58400000")
                .build();

        when(enderecoService.buscarPorId(1L))
                .thenReturn(response);

        EnderecoResponseDTO resultado =
                enderecoController.buscarPorId(1L);

        assertEquals(1L, resultado.getId());
        verify(enderecoService).buscarPorId(1L);
    }

    @Test
    void deveSalvarEndereco() {

        EnderecoResponseDTO response = EnderecoResponseDTO.builder()
                .id(1L)
                .cep("58400000")
                .build();

        when(enderecoService.salvar(any(EnderecoRequestDTO.class)))
                .thenReturn(response);

        EnderecoResponseDTO resultado =
                enderecoController.salvar(requestDTO);

        assertNotNull(resultado.getId());

        verify(enderecoService).salvar(any(EnderecoRequestDTO.class));
    }

        @Test
        void deveAtualizarEndereco() {

                EnderecoResponseDTO response = EnderecoResponseDTO.builder()
                                .id(1L)
                                .cep("58400000")
                                .build();

                when(enderecoService.atualizar(eq(1L), any(EnderecoRequestDTO.class)))
                                .thenReturn(response);

                EnderecoResponseDTO resultado = enderecoController.atualizar(1L, requestDTO);

                assertEquals(1L, resultado.getId());
                verify(enderecoService).atualizar(eq(1L), any(EnderecoRequestDTO.class));
        }

        @Test
        void deveDeletarEndereco() {

                doNothing().when(enderecoService).deletar(1L);

                enderecoController.deletar(1L);

                verify(enderecoService).deletar(1L);
        }

    @Test
    void deveBuscarCep() {

        ViaCepResponseDTO response = ViaCepResponseDTO.builder()
                .cep("58400000")
                .logradouro("Rua A")
                .build();

        when(viaCepService.buscarCep("58400000"))
                .thenReturn(response);

        ViaCepResponseDTO resultado =
                enderecoController.buscarCep("58400000");

        assertEquals("Rua A", resultado.getLogradouro());

        verify(viaCepService).buscarCep("58400000");
    }

        @Test
        void devePropagarErroAoBuscarCep() {

                when(viaCepService.buscarCep("00000000"))
                                .thenThrow(new RuntimeException("falha"));

                assertThrows(RuntimeException.class, () -> enderecoController.buscarCep("00000000"));
        }
}