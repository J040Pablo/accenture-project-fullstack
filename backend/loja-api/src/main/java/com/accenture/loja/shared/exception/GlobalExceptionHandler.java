package com.accenture.loja.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResponse> tratarIllegalArgumentException(IllegalArgumentException ex) {
        return criarRespostaErro(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                ex.getMessage()
        );
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErroResponse> tratarIllegalStateException(IllegalStateException ex) {
        return criarRespostaErro(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                ex.getMessage()
        );
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErroResponse> tratarBusinessException(BusinessException ex) {
        return criarRespostaErro(
                HttpStatus.BAD_REQUEST,
                "Erro de regra de negócio",
                ex.getMessage()
        );
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResponse> tratarRegraNegocioException(RegraNegocioException ex) {
        return criarRespostaErro(
                HttpStatus.BAD_REQUEST,
                "Erro de regra de negócio",
                ex.getMessage()
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErroResponse> tratarResourceNotFoundException(ResourceNotFoundException ex) {
        return criarRespostaErro(
                HttpStatus.NOT_FOUND,
                "Recurso não encontrado",
                ex.getMessage()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> tratarValidacao(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(erro -> erro.getDefaultMessage())
                .collect(Collectors.joining("; "));

        if (mensagem.isBlank()) {
            mensagem = "Dados inválidos.";
        }

        return criarRespostaErro(
                HttpStatus.BAD_REQUEST,
                "Erro de validação",
                mensagem
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> tratarException(Exception ex) {
        return criarRespostaErro(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Erro interno",
                "Ocorreu um erro inesperado. Tente novamente mais tarde."
        );
    }

    private ResponseEntity<ErroResponse> criarRespostaErro(
            HttpStatus status,
            String erro,
            String mensagem
    ) {
        ErroResponse resposta = new ErroResponse(
                LocalDateTime.now(),
                status.value(),
                erro,
                mensagem
        );

        return ResponseEntity.status(status).body(resposta);
    }
    
    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<ErroResponse> tratarServiceUnavailable(
            ServiceUnavailableException ex
    ) {

        HttpStatus status = HttpStatus.SERVICE_UNAVAILABLE;

        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                status.value(),
                "Serviço indisponível",
                ex.getMessage()
        );

        return ResponseEntity.status(status).body(erro);
    }
}