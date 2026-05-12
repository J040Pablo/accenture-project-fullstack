package com.accenture.loja.endereco.service;

import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
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

    private EnderecoService enderecoService;

    @BeforeEach
    void setup() {
        enderecoRepository = mock(EnderecoRepository.class);
        enderecoService = new EnderecoService(enderecoRepository);
    }

    @Test
    void deveListarEnderecos() {

        Endereco endereco = Endereco.builder()
                .id(1L)
                .cep("58400000")
                .rua("Rua A")
                .numero("100")
                .bairro("Centro")
                .cidade("Campina Grande")
                .uf("PB")
                .build();

        when(enderecoRepository.findAll())
                .thenReturn(List.of(endereco));

        List<EnderecoResponseDTO> resultado = enderecoService.listar();

        assertEquals(1, resultado.size());
        assertEquals("58400000", resultado.getFirst().getCep());

        verify(enderecoRepository).findAll();
    }

    @Test
    void deveBuscarEnderecoPorId() {

        Endereco endereco = Endereco.builder()
                .id(1L)
                .cep("58400000")
                .rua("Rua A")
                .numero("100")
                .bairro("Centro")
                .cidade("Campina Grande")
                .uf("PB")
                .build();

        when(enderecoRepository.findById(1L))
                .thenReturn(Optional.of(endereco));

        EnderecoResponseDTO resultado = enderecoService.buscarPorId(1L);

        assertEquals(1L, resultado.getId());
        assertEquals("Rua A", resultado.getRua());

        verify(enderecoRepository).findById(1L);
    }

    @Test
    void deveSalvarEndereco() {

        Endereco endereco = Endereco.builder()
                .cep("58400000")
                .rua("Rua A")
                .numero("100")
                .bairro("Centro")
                .cidade("Campina Grande")
                .uf("PB")
                .build();

        Endereco enderecoSalvo = Endereco.builder()
                .id(1L)
                .cep("58400000")
                .rua("Rua A")
                .numero("100")
                .bairro("Centro")
                .cidade("Campina Grande")
                .uf("PB")
                .build();

        when(enderecoRepository.save(endereco))
                .thenReturn(enderecoSalvo);

        EnderecoResponseDTO resultado = enderecoService.salvar(endereco);

        assertNotNull(resultado.getId());
        assertEquals("58400000", resultado.getCep());

        verify(enderecoRepository).save(endereco);
    }

    @Test
    void deveDeletarEndereco() {

        Endereco endereco = Endereco.builder()
                .id(1L)
                .build();

        when(enderecoRepository.findById(1L))
                .thenReturn(Optional.of(endereco));

        enderecoService.deletar(1L);

        verify(enderecoRepository).delete(endereco);
    }
}