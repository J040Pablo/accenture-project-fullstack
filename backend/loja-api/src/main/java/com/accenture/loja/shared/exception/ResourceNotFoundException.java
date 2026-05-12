package com.accenture.loja.shared.exception;

public class ResourceNotFoundException
        extends RuntimeException {

    public ResourceNotFoundException(String mensagem) {
        super(mensagem);
    }
}
