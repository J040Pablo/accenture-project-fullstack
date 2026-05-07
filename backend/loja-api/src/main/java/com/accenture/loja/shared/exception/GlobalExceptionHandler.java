package com.accenture.loja.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResponse> tratarIllegalArgumentException(IllegalArgumentException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;

        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                status.value(),
                "Bad Request",
                ex.getMessage()
        );

        return ResponseEntity.status(status).body(erro);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErroResponse> tratarIllegalStateException(IllegalStateException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;

        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                status.value(),
                "Bad Request",
                ex.getMessage()
        );

        return ResponseEntity.status(status).body(erro);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> tratarValidacao(MethodArgumentNotValidException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;

        String mensagem = ex.getBindingResult()
                .getFieldErrors()
                .get(0)
                .getDefaultMessage();

        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                status.value(),
                "Erro de validação",
                mensagem
        );

        return ResponseEntity.status(status).body(erro);
    }
}