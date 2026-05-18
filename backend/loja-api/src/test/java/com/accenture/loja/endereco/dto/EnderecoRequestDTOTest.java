package com.accenture.loja.endereco.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class EnderecoRequestDTOTest {

    private Validator validator;

    @BeforeEach
    void setup() {

        ValidatorFactory factory =
                Validation.buildDefaultValidatorFactory();

        validator = factory.getValidator();
    }

    @Test
    void deveValidarDtoComSucesso() {

        EnderecoRequestDTO dto =
                EnderecoRequestDTO.builder()
                        .cep("58400000")
                        .rua("Rua A")
                        .bairro("Centro")
                        .cidade("Campina Grande")
                        .uf("PB")
                        .numero("123")
                        .complemento("Casa")
                        .build();

        Set<ConstraintViolation<EnderecoRequestDTO>> violations =
                validator.validate(dto);

        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarErroQuandoCepForVazio() {

        EnderecoRequestDTO dto =
                EnderecoRequestDTO.builder()
                        .cep("")
                        .numero("123")
                        .build();

        Set<ConstraintViolation<EnderecoRequestDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void deveRetornarErroQuandoNumeroForVazio() {

        EnderecoRequestDTO dto =
                EnderecoRequestDTO.builder()
                        .cep("58400000")
                        .numero("")
                        .build();

        Set<ConstraintViolation<EnderecoRequestDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }
}