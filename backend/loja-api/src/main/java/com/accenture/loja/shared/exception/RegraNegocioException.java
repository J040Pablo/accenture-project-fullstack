package com.accenture.loja.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção personalizada para erros de regras de negócio.
 * O @ResponseStatus(HttpStatus.BAD_REQUEST) garante que o Spring retorne
 * erro 400 automaticamente quando esta exceção for lançada.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}