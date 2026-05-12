package com.accenture.loja.endereco.controller;

import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.service.EnderecoService;
import com.accenture.loja.endereco.service.ViaCepService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enderecos")
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService enderecoService;

    private final ViaCepService viaCepService;

    @GetMapping
    public List<EnderecoResponseDTO> listar() {
        return enderecoService.listar();
    }

    @GetMapping("/{id}")
    public EnderecoResponseDTO buscarPorId(@PathVariable Long id) {
        return enderecoService.buscarPorId(id);
    }

    @PostMapping
    public EnderecoResponseDTO salvar(@RequestBody Endereco endereco) {
        return enderecoService.salvar(endereco);
    }

    @PutMapping("/{id}")
    public EnderecoResponseDTO atualizar(
            @PathVariable Long id,
            @RequestBody Endereco endereco) {

        return enderecoService.atualizar(id, endereco);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        enderecoService.deletar(id);
    }

    @GetMapping("/cep/{cep}")
    public ViaCepResponseDTO buscarCep(@PathVariable String cep) {
        return viaCepService.buscarCep(cep);
    }
}