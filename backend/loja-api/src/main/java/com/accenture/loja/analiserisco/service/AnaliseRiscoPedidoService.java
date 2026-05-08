package com.accenture.loja.analiserisco.service;

import com.accenture.loja.analiserisco.mapper.AnaliseRiscoPedidoMapper;
import com.accenture.loja.analiserisco.repository.AnaliseRiscoPedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnaliseRiscoPedidoService {

    private final AnaliseRiscoPedidoRepository analiseRiscoPedidoRepository;
    private final AnaliseRiscoPedidoMapper analiseRiscoPedidoMapper;

    // TODO: fazer a avaliaçao que simula a fraude(izar)
}