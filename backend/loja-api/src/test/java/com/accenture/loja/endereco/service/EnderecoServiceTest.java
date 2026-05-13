package com.accenture.loja.endereco.service;

import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import com.accenture.loja.endereco.mapper.EnderecoMapper;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.repository.EnderecoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EnderecoServiceTest {

    private EnderecoRepository enderecoRepository;
    private EnderecoMapper enderecoMapper;
    private EnderecoService enderecoService;

    private Endereco endereco;
    private EnderecoResponseDTO enderecoResponseDTO;

    @BeforeEach
    void setup() {

        enderecoRepository = mock(EnderecoRepository.class);
        enderecoMapper = mock(EnderecoMapper.class);

        enderecoService = new EnderecoService(
                enderecoRepository,
                enderecoMapper
        );

        endereco = Endereco.builder()
                .id(1L)
                .cep("58400000")
                .rua("Rua A")
                .numero("100")
                .complemento("Apto 101")
                .bairro("Centro")
                .cidade("Campina Grande")
                .uf("PB")
                .build();

        enderecoResponseDTO = EnderecoResponseDTO.builder()
                .id(1L)
                .cep("58400000")
                .rua("Rua A")
                .numero("100")
                .complemento("Apto 101")
                .bairro("Centro")
                .cidade("Campina Grande")
                .uf("PB")
                .build();
    }

    @Test
    void deveListarEnderecos() {

        when(enderecoRepository.findAll())
                .thenReturn(List.of(endereco));

        when(enderecoMapper.toResponseDTO(endereco))
                .thenReturn(enderecoResponseDTO);

        List<EnderecoResponseDTO> resultado = enderecoService.listar();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());

        assertEquals(1L, resultado.getFirst().getId());
        assertEquals("58400000", resultado.getFirst().getCep());
        assertEquals("Rua A", resultado.getFirst().getRua());
        assertEquals("100", resultado.getFirst().getNumero());

        verify(enderecoRepository, times(1)).findAll();
        verify(enderecoMapper, times(1))
                .toResponseDTO(endereco);
    }

    @Test
    void deveRetornarListaVaziaQuandoNaoExistiremEnderecos() {

        when(enderecoRepository.findAll())
                .thenReturn(List.of());

        List<EnderecoResponseDTO> resultado =
                enderecoService.listar();

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());

        verify(enderecoRepository, times(1)).findAll();

        verify(enderecoMapper, never())
                .toResponseDTO(any());
    }

    @Test
    void deveBuscarEnderecoPorId() {

        when(enderecoRepository.findById(1L))
                .thenReturn(Optional.of(endereco));

        when(enderecoMapper.toResponseDTO(endereco))
                .thenReturn(enderecoResponseDTO);

        EnderecoResponseDTO resultado =
                enderecoService.buscarPorId(1L);

        assertNotNull(resultado);

        assertEquals(1L, resultado.getId());
        assertEquals("Rua A", resultado.getRua());
        assertEquals("Campina Grande", resultado.getCidade());

        verify(enderecoRepository, times(1))
                .findById(1L);

        verify(enderecoMapper, times(1))
                .toResponseDTO(endereco);
    }

    @Test
    void deveLancarExcecaoQuandoBuscarEnderecoInexistente() {

        when(enderecoRepository.findById(99L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> enderecoService.buscarPorId(99L)
        );

        assertEquals(
                "Endereço não encontrado",
                exception.getMessage()
        );

        verify(enderecoRepository, times(1))
                .findById(99L);

        verify(enderecoMapper, never())
                .toResponseDTO(any());
    }

    @Test
    void deveSalvarEndereco() {

        Endereco enderecoSemId = Endereco.builder()
                .cep("58400000")
                .rua("Rua A")
                .numero("100")
                .bairro("Centro")
                .cidade("Campina Grande")
                .uf("PB")
                .build();

        when(enderecoRepository.save(enderecoSemId))
                .thenReturn(endereco);

        when(enderecoMapper.toResponseDTO(endereco))
                .thenReturn(enderecoResponseDTO);

        EnderecoResponseDTO resultado =
                enderecoService.salvar(enderecoSemId);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("58400000", resultado.getCep());

        verify(enderecoRepository, times(1))
                .save(enderecoSemId);

        verify(enderecoMapper, times(1))
                .toResponseDTO(endereco);
    }

    @Test
    void deveAtualizarEndereco() {

        Endereco enderecoAtualizado = Endereco.builder()
                .cep("58500000")
                .rua("Rua B")
                .numero("200")
                .complemento("Casa")
                .bairro("Catolé")
                .cidade("João Pessoa")
                .uf("PB")
                .build();

        Endereco enderecoSalvo = Endereco.builder()
                .id(1L)
                .cep("58500000")
                .rua("Rua B")
                .numero("200")
                .complemento("Casa")
                .bairro("Catolé")
                .cidade("João Pessoa")
                .uf("PB")
                .build();

        EnderecoResponseDTO responseAtualizado =
                EnderecoResponseDTO.builder()
                        .id(1L)
                        .cep("58500000")
                        .rua("Rua B")
                        .numero("200")
                        .complemento("Casa")
                        .bairro("Catolé")
                        .cidade("João Pessoa")
                        .uf("PB")
                        .build();

        when(enderecoRepository.findById(1L))
                .thenReturn(Optional.of(endereco));

        when(enderecoRepository.save(any(Endereco.class)))
                .thenReturn(enderecoSalvo);

        when(enderecoMapper.toResponseDTO(enderecoSalvo))
                .thenReturn(responseAtualizado);

        EnderecoResponseDTO resultado =
                enderecoService.atualizar(1L, enderecoAtualizado);

        assertNotNull(resultado);

        assertEquals("58500000", resultado.getCep());
        assertEquals("Rua B", resultado.getRua());
        assertEquals("200", resultado.getNumero());
        assertEquals("João Pessoa", resultado.getCidade());

        verify(enderecoRepository, times(1))
                .findById(1L);

        verify(enderecoRepository, times(1))
                .save(any(Endereco.class));

        verify(enderecoMapper, times(1))
                .toResponseDTO(enderecoSalvo);
    }

    @Test
    void deveLancarExcecaoAoAtualizarEnderecoInexistente() {

        when(enderecoRepository.findById(99L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> enderecoService.atualizar(
                        99L,
                        endereco
                )
        );

        assertEquals(
                "Endereço não encontrado",
                exception.getMessage()
        );

        verify(enderecoRepository, times(1))
                .findById(99L);

        verify(enderecoRepository, never())
                .save(any());

        verify(enderecoMapper, never())
                .toResponseDTO(any());
    }

    @Test
    void deveDeletarEndereco() {

        when(enderecoRepository.findById(1L))
                .thenReturn(Optional.of(endereco));

        enderecoService.deletar(1L);

        verify(enderecoRepository, times(1))
                .findById(1L);

        verify(enderecoRepository, times(1))
                .delete(endereco);
    }

    @Test
    void deveLancarExcecaoAoDeletarEnderecoInexistente() {

        when(enderecoRepository.findById(99L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> enderecoService.deletar(99L)
        );

        assertEquals(
                "Endereço não encontrado",
                exception.getMessage()
        );

        verify(enderecoRepository, times(1))
                .findById(99L);

        verify(enderecoRepository, never())
                .delete(any());
    }
}