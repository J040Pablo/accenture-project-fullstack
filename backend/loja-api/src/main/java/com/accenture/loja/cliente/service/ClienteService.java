package com.accenture.loja.cliente.service;

import com.accenture.loja.cliente.dto.ClienteRequestDTO;
import com.accenture.loja.cliente.dto.ClienteResponseDTO;
import com.accenture.loja.cliente.mapper.ClienteMapper;
import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.service.ContaCorrenteService;
import com.accenture.loja.endereco.dto.ViaCepResponseDTO;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.service.ViaCepService;
import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.BusinessException;
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

        validarDadosCliente(dto);

        validarCpf(dto.getCpf());

        validarEmail(dto.getEmail());

        String cep = dto.getEndereco().getCep();

        validarCep(cep);

        ViaCepResponseDTO viaCep = viaCepService.buscarCep(cep);

        Endereco endereco = criarEndereco(dto, viaCep);

        ContaCorrente contaCorrente =
                contaCorrenteService.criarContaPara(TipoTitularConta.CLIENTE);

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

    public ClienteResponseDTO atualizarCliente(Long id, ClienteRequestDTO dto) {

        validarDadosCliente(dto);

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("Cliente não encontrado"));

        validarCpfNaAtualizacao(dto.getCpf(), id);

        validarEmailNaAtualizacao(dto.getEmail(), id);

        String cep = dto.getEndereco().getCep();

        validarCep(cep);

        ViaCepResponseDTO viaCep = viaCepService.buscarCep(cep);

        if (viaCep == null || viaCep.getCep() == null) {
            throw new BusinessException("CEP não encontrado");
        }

        cliente.setNome(dto.getNome());
        cliente.setCpf(dto.getCpf());
        cliente.setEmail(dto.getEmail());

        Endereco endereco = cliente.getEndereco();

        if (endereco == null) {
            endereco = new Endereco();
            cliente.setEndereco(endereco);
        }

        endereco.setCep(viaCep.getCep());
        String ruaFinal = viaCep.getLogradouro();
        if (ruaFinal == null || ruaFinal.isBlank()) {
            ruaFinal = dto.getEndereco().getRua();
        }

        String bairroFinal = viaCep.getBairro();
        if (bairroFinal == null || bairroFinal.isBlank()) {
            bairroFinal = dto.getEndereco().getBairro();
        }

        String cidadeFinal = viaCep.getLocalidade();
        if (cidadeFinal == null || cidadeFinal.isBlank()) {
            cidadeFinal = dto.getEndereco().getCidade();
        }

        String ufFinal = viaCep.getUf();
        if (ufFinal == null || ufFinal.isBlank()) {
            ufFinal = dto.getEndereco().getUf();
        }

        endereco.setRua(ruaFinal);
        endereco.setBairro(bairroFinal);
        endereco.setCidade(cidadeFinal);
        endereco.setUf(ufFinal);
        endereco.setNumero(dto.getEndereco().getNumero());
        endereco.setComplemento(dto.getEndereco().getComplemento());

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

    private void validarCpfNaAtualizacao(String cpf, Long id) {
        if (clienteRepository.existsByCpfAndIdNot(cpf, id)) {
            throw new BusinessException("CPF já cadastrado para outro cliente");
        }
    }

    private void validarEmailNaAtualizacao(String email, Long id) {
        if (clienteRepository.existsByEmailAndIdNot(email, id)) {
            throw new BusinessException("Email já cadastrado para outro cliente");
        }
    }

    private Endereco criarEndereco(
            ClienteRequestDTO dto,
            ViaCepResponseDTO viaCep
    ) {

        if (viaCep == null || viaCep.getCep() == null) {
            throw new BusinessException("CEP não encontrado");
        }

        String ruaFinal = viaCep.getLogradouro();
        if (ruaFinal == null || ruaFinal.isBlank()) {
            ruaFinal = dto.getEndereco().getRua();
        }

        String bairroFinal = viaCep.getBairro();
        if (bairroFinal == null || bairroFinal.isBlank()) {
            bairroFinal = dto.getEndereco().getBairro();
        }

        String cidadeFinal = viaCep.getLocalidade();
        if (cidadeFinal == null || cidadeFinal.isBlank()) {
            cidadeFinal = dto.getEndereco().getCidade();
        }

        String ufFinal = viaCep.getUf();
        if (ufFinal == null || ufFinal.isBlank()) {
            ufFinal = dto.getEndereco().getUf();
        }

        return Endereco.builder()
                .cep(viaCep.getCep())
                .rua(ruaFinal)
                .bairro(bairroFinal)
                .cidade(cidadeFinal)
                .uf(ufFinal)
                .numero(dto.getEndereco().getNumero())
                .complemento(dto.getEndereco().getComplemento())
                .build();
    }
}