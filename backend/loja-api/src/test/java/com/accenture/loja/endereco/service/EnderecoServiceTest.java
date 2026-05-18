package com.accenture.loja.endereco.service;

import com.accenture.loja.endereco.dto.EnderecoRequestDTO;
import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import com.accenture.loja.endereco.mapper.EnderecoMapper;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.repository.EnderecoRepository;
import org.mockito.ArgumentCaptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EnderecoServiceTest {

    private EnderecoRepository enderecoRepository;
    private EnderecoMapper enderecoMapper;
    private EnderecoService enderecoService;

    private Endereco endereco;
    private EnderecoResponseDTO enderecoResponseDTO;
    private EnderecoRequestDTO enderecoRequestDTO;

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

        enderecoRequestDTO = EnderecoRequestDTO.builder()
                .cep("58400000")
                .rua("Rua A")
                .bairro("Centro")
                .cidade("Campina Grande")
                .uf("PB")
                .numero("100")
                .complemento("Apto 101")
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

        assertEquals(1L, resultado.get(0).getId());
        assertEquals("58400000", resultado.get(0).getCep());
        assertEquals("Rua A", resultado.get(0).getRua());
        assertEquals("100", resultado.get(0).getNumero());

        verify(enderecoRepository).findAll();
        verify(enderecoMapper).toResponseDTO(endereco);
    }

    @Test
    void deveRetornarListaVaziaQuandoNaoExistiremEnderecos() {

        when(enderecoRepository.findAll())
                .thenReturn(List.of());

        List<EnderecoResponseDTO> resultado = enderecoService.listar();

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());

        verify(enderecoRepository).findAll();
        verify(enderecoMapper, never()).toResponseDTO(any());
    }

    @Test
    void deveBuscarEnderecoPorId() {

        when(enderecoRepository.findById(1L))
                .thenReturn(Optional.of(endereco));

        when(enderecoMapper.toResponseDTO(endereco))
                .thenReturn(enderecoResponseDTO);

        EnderecoResponseDTO resultado = enderecoService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("Rua A", resultado.getRua());

        verify(enderecoRepository).findById(1L);
        verify(enderecoMapper).toResponseDTO(endereco);
    }

    @Test
    void deveLancarExcecaoQuandoBuscarEnderecoInexistente() {

        when(enderecoRepository.findById(99L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> enderecoService.buscarPorId(99L)
        );

        assertEquals("Endereço não encontrado", exception.getMessage());

        verify(enderecoRepository).findById(99L);
        verify(enderecoMapper, never()).toResponseDTO(any());
    }

    @Test
    void deveSalvarEndereco() {

        when(enderecoRepository.save(any(Endereco.class)))
                .thenReturn(endereco);

        when(enderecoMapper.toResponseDTO(endereco))
                .thenReturn(enderecoResponseDTO);

        EnderecoResponseDTO resultado = enderecoService.salvar(enderecoRequestDTO);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("58400000", resultado.getCep());

        ArgumentCaptor<Endereco> captor = ArgumentCaptor.forClass(Endereco.class);
        verify(enderecoRepository).save(captor.capture());

        Endereco salvo = captor.getValue();
        assertAll(
                () -> assertEquals("Rua A", salvo.getRua()),
                () -> assertEquals("Centro", salvo.getBairro()),
                () -> assertEquals("Campina Grande", salvo.getCidade()),
                () -> assertEquals("PB", salvo.getUf())
        );

        verify(enderecoRepository).save(any(Endereco.class));
        verify(enderecoMapper).toResponseDTO(endereco);
    }

    @Test
    void deveAtualizarEndereco() {

        when(enderecoRepository.findById(1L))
                .thenReturn(Optional.of(endereco));

        when(enderecoRepository.save(any(Endereco.class)))
                .thenReturn(endereco);

        when(enderecoMapper.toResponseDTO(endereco))
                .thenReturn(enderecoResponseDTO);

        EnderecoResponseDTO resultado =
                enderecoService.atualizar(1L, enderecoRequestDTO);

        assertNotNull(resultado);

        ArgumentCaptor<Endereco> captor = ArgumentCaptor.forClass(Endereco.class);
        verify(enderecoRepository).save(captor.capture());

        Endereco atualizado = captor.getValue();
        assertAll(
                () -> assertEquals("Rua A", atualizado.getRua()),
                () -> assertEquals("Centro", atualizado.getBairro()),
                () -> assertEquals("Campina Grande", atualizado.getCidade()),
                () -> assertEquals("PB", atualizado.getUf())
        );

        verify(enderecoRepository).findById(1L);
        verify(enderecoRepository).save(any(Endereco.class));
        verify(enderecoMapper).toResponseDTO(endereco);
    }

    @Test
    void deveLancarExcecaoAoAtualizarEnderecoInexistente() {

        when(enderecoRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> enderecoService.atualizar(99L, enderecoRequestDTO)
        );

        verify(enderecoRepository).findById(99L);
        verify(enderecoRepository, never()).save(any());
    }

    @Test
    void deveDeletarEndereco() {

        when(enderecoRepository.findById(1L))
                .thenReturn(Optional.of(endereco));

        enderecoService.deletar(1L);

        verify(enderecoRepository).findById(1L);
        verify(enderecoRepository).delete(endereco);
    }

    @Test
    void deveLancarExcecaoAoDeletarEnderecoInexistente() {

        when(enderecoRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> enderecoService.deletar(99L)
        );

        verify(enderecoRepository).findById(99L);
        verify(enderecoRepository, never()).delete(any());
    }
}