package com.accenture.loja.cliente.service;

import com.accenture.loja.cliente.dto.ClienteRequestDTO;
import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.cliente.mapper.ClienteMapper;
import com.accenture.loja.conta.service.ContaCorrenteService;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.service.ViaCepService;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.enums.TipoTitularConta;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ViaCepService viaCepService;
    private final ClienteMapper clienteMapper;
    private final ContaCorrenteService contaCorrenteService;

    public ClienteResponseDTO criarCliente(ClienteRequestDTO dto) {
        validarCpf(dto.getCpf());
        validarEmail(dto.getEmail());

        String cep = dto.getEndereco().getCep();

        validarCep(cep);

        ViaCepResponseDTO viaCep = viaCepService.buscarCep(cep);

        if (viaCep == null || viaCep.getCep() == null) {
            throw new BusinessException("CEP não encontrado");
        }

        Endereco endereco = Endereco.builder()
                .cep(viaCep.getCep())
                .rua(viaCep.getLogradouro())
                .bairro(viaCep.getBairro())
                .cidade(viaCep.getLocalidade())
                .uf(viaCep.getUf())
                .numero(dto.getEndereco().getNumero())
                .complemento(dto.getEndereco().getComplemento())
                .build();

        ContaCorrente contaCorrente = contaCorrenteService.criarContaPara(TipoTitularConta.CLIENTE);

        Cliente cliente = Cliente.builder()
                .nome(dto.getNome())
                .cpf(dto.getCpf())
                .email(dto.getEmail())
                .endereco(endereco)
                .contaCorrente(contaCorrente)
                .build();

        Cliente clienteSalvo = clienteRepository.save(cliente);

        return clienteMapper.toResponseDTO(clienteSalvo);
    }
    
    private void validarCep(String cep) {

        if (cep == null || cep.isBlank()) {
            throw new BusinessException("CEP é obrigatório");
        }

        cep = cep.replace("-", "");

        if (!cep.matches("\\d{8}")) {
            throw new BusinessException("CEP inválido");
        }
    }

    public List<ClienteResponseDTO> listarClientes() {

        return clienteRepository.findAll()
                .stream()
                .map(clienteMapper::toResponseDTO)
                .toList();
    }

    public ClienteResponseDTO buscarPorId(Long id) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Cliente não encontrado"));

        return  clienteMapper.toResponseDTO(cliente);
    }

    public ClienteResponseDTO atualizarCliente(Long id, ClienteRequestDTO dto) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Cliente não encontrado"));

        cliente.setNome(dto.getNome());
        cliente.setEmail(dto.getEmail());

        Cliente atualizado = clienteRepository.save(cliente);

        return  clienteMapper.toResponseDTO(atualizado);
    }

    public void deletarCliente(Long id) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Cliente não encontrado"));

        clienteRepository.delete(cliente);
    }

    private void validarCpf(String cpf) {

        clienteRepository.findByCpf(cpf)
                .ifPresent(cliente -> {
                    throw new BusinessException("CPF já cadastrado");
                });
    }

    private void validarEmail(String email) {

        clienteRepository.findByEmail(email)
                .ifPresent(cliente -> {
                    throw new BusinessException("Email já cadastrado");
                });
    }

}