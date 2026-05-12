package com.accenture.loja.cliente.service;

import com.accenture.loja.cliente.dto.ClienteRequestDTO;
import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.conta.dto.ContaCorrenteResponseDTO;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.endereco.dto.EnderecoResponseDTO;
import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.service.ViaCepService;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import com.accenture.loja.shared.enums.TipoTitularConta;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ViaCepService viaCepService;

    public ClienteResponseDTO criarCliente(ClienteRequestDTO dto) {
    	//validarDadosCliente(dto);
        validarCpf(dto.getCpf());
        validarEmail(dto.getEmail());

        String cep = dto.getEndereco().getCep();

        validarCep(cep);

        ViaCepResponseDTO viaCep = viaCepService.buscarCep(cep);

        if (viaCep == null || viaCep.getCep() == null) {
            throw new RuntimeException("CEP não encontrado");
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

        ContaCorrente contaCorrente = ContaCorrente.builder()
            .numeroConta(gerarNumeroConta())
            .saldo(BigDecimal.ZERO)
            .tipoTitular(TipoTitularConta.CLIENTE)
            .build();

        Cliente cliente = Cliente.builder()
                .nome(dto.getNome())
                .cpf(dto.getCpf())
                .email(dto.getEmail())
                .endereco(endereco)
                .contaCorrente(contaCorrente)
                .build();

        Cliente clienteSalvo = clienteRepository.save(cliente);

        return converterParaResponse(clienteSalvo);
    }
    
    private void validarCep(String cep) {

        if (cep == null || cep.isBlank()) {
            throw new RuntimeException("CEP é obrigatório");
        }

        cep = cep.replace("-", "");

        if (!cep.matches("\\d{8}")) {
            throw new RuntimeException("CEP inválido");
        }
    }

    public List<ClienteResponseDTO> listarClientes() {

        return clienteRepository.findAll()
                .stream()
                .map(this::converterParaResponse)
                .toList();
    }

    public ClienteResponseDTO buscarPorId(Long id) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Cliente não encontrado"));

        return converterParaResponse(cliente);
    }

    public ClienteResponseDTO atualizarCliente(Long id, ClienteRequestDTO dto) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Cliente não encontrado"));

        cliente.setNome(dto.getNome());
        cliente.setEmail(dto.getEmail());

        Cliente atualizado = clienteRepository.save(cliente);

        return converterParaResponse(atualizado);
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

    private String gerarNumeroConta() {

        Random random = new Random();

        return String.valueOf(10000 + random.nextInt(90000));
    }

    private ClienteResponseDTO converterParaResponse(Cliente cliente) {

        return ClienteResponseDTO.builder()
                .id(cliente.getId())
                .nome(cliente.getNome())
                .cpf(cliente.getCpf())
                .email(cliente.getEmail())
                .endereco(
                        EnderecoResponseDTO.builder()
                                .id(cliente.getEndereco().getId())
                                .cep(cliente.getEndereco().getCep())
                                .rua(cliente.getEndereco().getRua())
                                .numero(cliente.getEndereco().getNumero())
                                .bairro(cliente.getEndereco().getBairro())
                                .cidade(cliente.getEndereco().getCidade())
                                .uf(cliente.getEndereco().getUf())
                                .build()
                )
                .contaCorrente(
                        ContaCorrenteResponseDTO.builder()
                                .id(cliente.getContaCorrente().getId())
                                .numeroConta(cliente.getContaCorrente().getNumeroConta())
                                .saldo(cliente.getContaCorrente().getSaldo())
                                .build()
                )
                .build();
    }
    
    private void validarDadosCliente(ClienteRequestDTO dto) {

        if (dto == null) {
            throw new ResourceNotFoundException("Dados do cliente são obrigatórios");
        }

        if (dto.getNome() == null || dto.getNome().isBlank()) {
        	throw new ResourceNotFoundException("Nome é obrigatório");
        }

        if (dto.getCpf() == null || dto.getCpf().isBlank()) {
        	throw new ResourceNotFoundException("CPF é obrigatório");
        }

        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
        	throw new ResourceNotFoundException("Email é obrigatório");
        }

        if (dto.getEndereco() == null) {
        	throw new ResourceNotFoundException("Endereço é obrigatório");
        }

        if (dto.getEndereco().getCep() == null
                || dto.getEndereco().getCep().isBlank()) {

        	throw new ResourceNotFoundException("CEP é obrigatório");
        }

        if (dto.getEndereco().getNumero() == null
                || dto.getEndereco().getNumero().isBlank()) {

        	throw new ResourceNotFoundException(
                    "Número do endereço é obrigatório"
            );
        }
    }
}