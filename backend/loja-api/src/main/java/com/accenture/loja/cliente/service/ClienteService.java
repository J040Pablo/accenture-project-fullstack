package com.accenture.loja.cliente.service;

import com.accenture.loja.cliente.dto.ClienteRequestDTO;
import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.mapper.ClienteMapper;
import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.service.ViaCepService;
import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ContaCorrenteRepository contaCorrenteRepository;
    private final ViaCepService viaCepService;
    private final ClienteMapper clienteMapper;

    public ClienteResponseDTO criarCliente(ClienteRequestDTO dto) {

        validarDadosCliente(dto);

        validarCpf(dto.getCpf());

        validarEmail(dto.getEmail());

        String cep = dto.getEndereco().getCep();

        validarCep(cep);

        ViaCepResponseDTO viaCep = viaCepService.buscarCep(cep);

        Endereco endereco = criarEndereco(dto, viaCep);

        ContaCorrente contaCorrente = criarContaCorrente();

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

    public List<ClienteResponseDTO> listarClientes() {

        return clienteRepository.findAll()
                .stream()
                .map(clienteMapper::toResponseDTO)
                .toList();
    }

    public ClienteResponseDTO buscarPorId(Long id) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("Cliente não encontrado"));

        return clienteMapper.toResponseDTO(cliente);
    }

    public ClienteResponseDTO atualizarCliente(
            Long id,
            ClienteRequestDTO dto
    ) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("Cliente não encontrado"));

        validarEmailAtualizacao(dto.getEmail(), id);

        validarCpfAtualizacao(dto.getCpf(), id);

        cliente.setNome(dto.getNome());
        cliente.setCpf(dto.getCpf());
        cliente.setEmail(dto.getEmail());

        Cliente atualizado = clienteRepository.save(cliente);

        return clienteMapper.toResponseDTO(atualizado);
    }

    public void deletarCliente(Long id) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("Cliente não encontrado"));

        clienteRepository.delete(cliente);
    }

    private void validarDadosCliente(ClienteRequestDTO dto) {

        if (dto == null) {
            throw new BusinessException("Dados do cliente são obrigatórios");
        }

        if (dto.getEndereco() == null) {
            throw new BusinessException("Endereço é obrigatório");
        }
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

    private void validarCpfAtualizacao(
            String cpf,
            Long idCliente
    ) {

        clienteRepository.findByCpf(cpf)
                .ifPresent(cliente -> {

                    if (!cliente.getId().equals(idCliente)) {
                        throw new BusinessException(
                                "CPF já cadastrado"
                        );
                    }
                });
    }

    private void validarEmailAtualizacao(
            String email,
            Long idCliente
    ) {

        clienteRepository.findByEmail(email)
                .ifPresent(cliente -> {

                    if (!cliente.getId().equals(idCliente)) {
                        throw new BusinessException(
                                "Email já cadastrado"
                        );
                    }
                });
    }

    private Endereco criarEndereco(
            ClienteRequestDTO dto,
            ViaCepResponseDTO viaCep
    ) {

        if (viaCep == null || viaCep.getCep() == null) {
            throw new BusinessException("CEP não encontrado");
        }

        return Endereco.builder()
                .cep(viaCep.getCep())
                .rua(viaCep.getLogradouro())
                .bairro(viaCep.getBairro())
                .cidade(viaCep.getLocalidade())
                .uf(viaCep.getUf())
                .numero(dto.getEndereco().getNumero())
                .complemento(dto.getEndereco().getComplemento())
                .build();
    }

    private ContaCorrente criarContaCorrente() {

        return ContaCorrente.builder()
                .numeroConta(gerarNumeroConta())
                .saldo(BigDecimal.ZERO)
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();
    }

    private String gerarNumeroConta() {

        String numeroConta;

        do {

            numeroConta = String.valueOf(
                    ThreadLocalRandom.current()
                            .nextInt(10000, 100000)
            );

        } while (
                contaCorrenteRepository
                        .existsByNumeroConta(numeroConta)
        );

        return numeroConta;
    }
}