package com.accenture.loja.shared.exception;

import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler globalExceptionHandler = new GlobalExceptionHandler();

    @Test
    void deveTratarIllegalArgumentException() {
        ResponseEntity<ErroResponse> response = globalExceptionHandler.tratarIllegalArgumentException(new IllegalArgumentException("Argumento inválido"));

        assertResponsePadrao(response, HttpStatus.BAD_REQUEST, "Bad Request", "Argumento inválido");
    }

    @Test
    void deveTratarIllegalStateException() {
        ResponseEntity<ErroResponse> response = globalExceptionHandler.tratarIllegalStateException(new IllegalStateException("Estado inválido"));

        assertResponsePadrao(response, HttpStatus.BAD_REQUEST, "Bad Request", "Estado inválido");
    }

    @Test
    void deveTratarBusinessException() {
        ResponseEntity<ErroResponse> response = globalExceptionHandler.tratarBusinessException(new BusinessException("Regra de negócio violada"));

        assertResponsePadrao(response, HttpStatus.BAD_REQUEST, "Erro de regra de negócio", "Regra de negócio violada");
    }

    @Test
    void deveTratarValidacao() throws Exception {
        Method method = AlvoDeTeste.class.getDeclaredMethod("alvo", String.class);
        MethodParameter methodParameter = new MethodParameter(method, 0);
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "objeto");
        bindingResult.addError(new FieldError("objeto", "campo", "Mensagem de validação"));
        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(methodParameter, bindingResult);

        ResponseEntity<ErroResponse> response = globalExceptionHandler.tratarValidacao(exception);

        assertResponsePadrao(response, HttpStatus.BAD_REQUEST, "Erro de validação", "Mensagem de validação");
    }

    @Test
    void deveTratarRegraNegocioException() {
        RegraNegocioException exception = new RegraNegocioException("Regra inválida");

        ResponseEntity<ErroResponse> response = globalExceptionHandler.tratarRegraNegocioException(exception);

        assertResponsePadrao(response, HttpStatus.BAD_REQUEST, "Erro de regra de negócio", "Regra inválida");
    }

    @Test
    void deveTratarResourceNotFoundException() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Cliente não encontrado");

        ResponseEntity<ErroResponse> response = globalExceptionHandler.tratarResourceNotFoundException(exception);

        assertResponsePadrao(response, HttpStatus.NOT_FOUND, "Recurso não encontrado", "Cliente não encontrado");
    }

    @Test
    void deveTratarExceptionGenericaSemExporDetalheInterno() {
        Exception exception = new Exception("Erro sensível do sistema");

        ResponseEntity<ErroResponse> response = globalExceptionHandler.tratarException(exception);

        assertResponsePadrao(response, HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno", "Ocorreu um erro inesperado. Tente novamente mais tarde.");
    }

    @Test
    void deveTratarValidacaoSemErrosDeCampo() throws Exception {
        Method method = AlvoDeTeste.class.getDeclaredMethod("alvo", String.class);
        MethodParameter methodParameter = new MethodParameter(method, 0);
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "objeto");

        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(methodParameter, bindingResult);

        ResponseEntity<ErroResponse> response = globalExceptionHandler.tratarValidacao(exception);

        assertResponsePadrao(response, HttpStatus.BAD_REQUEST, "Erro de validação", "Dados inválidos.");
    }

    private void assertResponsePadrao(ResponseEntity<ErroResponse> response, HttpStatus statusEsperado, String erroEsperado, String mensagemEsperada) {
        assertEquals(statusEsperado, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(statusEsperado.value(), response.getBody().status());
        assertEquals(erroEsperado, response.getBody().erro());
        assertEquals(mensagemEsperada, response.getBody().mensagem());
        assertNotNull(response.getBody().timestamp());
    }

    private static class AlvoDeTeste {
        @SuppressWarnings("unused")
        void alvo(String valor) {
        }
    }
}
