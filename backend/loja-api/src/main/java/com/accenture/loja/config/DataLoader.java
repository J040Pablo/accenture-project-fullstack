package com.accenture.loja.config;

import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.conta.service.ContaCorrenteService;
import com.accenture.loja.empresa.dto.EmpresaRequestDTO;
import com.accenture.loja.empresa.repository.EmpresaRepository;
import com.accenture.loja.empresa.service.EmpresaService;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.repository.EnderecoRepository;
import com.accenture.loja.produto.model.Produto;
import com.accenture.loja.produto.repository.ProdutoRepository;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
@Profile("dev")
public class DataLoader implements CommandLineRunner {

    private final EmpresaRepository empresaRepository;
    private final EmpresaService empresaService;
    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepository;
    private final EnderecoRepository enderecoRepository;
    private final ContaCorrenteService contaCorrenteService;
    private final ContaCorrenteRepository contaCorrenteRepository;

    public DataLoader(
            EmpresaRepository empresaRepository,
            EmpresaService empresaService,
            ClienteRepository clienteRepository,
            ProdutoRepository produtoRepository,
            EnderecoRepository enderecoRepository,
            ContaCorrenteService contaCorrenteService,
            ContaCorrenteRepository contaCorrenteRepository
    ) {
        this.empresaRepository = empresaRepository;
        this.empresaService = empresaService;
        this.clienteRepository = clienteRepository;
        this.produtoRepository = produtoRepository;
        this.enderecoRepository = enderecoRepository;
        this.contaCorrenteService = contaCorrenteService;
        this.contaCorrenteRepository = contaCorrenteRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        carregarEmpresa();
        carregarClientes();
        carregarProdutos();
    }

    private void carregarEmpresa() {
        if (empresaRepository.count() > 0) {
            return;
        }

        EmpresaRequestDTO dto = new EmpresaRequestDTO(
                "Loja Accenture",
                "Loja Accenture",
                "00000000000000",
                "contato@loja-accenture.com.br",
                ""
        );

        try {
            empresaService.cadastrar(dto);
        } catch (Exception ex) {
            // Não interrompe o startup caso a empresa já exista
            // ou ocorra alguma validação durante a carga inicial.
        }
    }

    private void carregarClientes() {
        if (clienteRepository.count() > 0) {
            return;
        }

        String cpfJoao = "12345678901";

        if (clienteRepository.findByCpf(cpfJoao).isEmpty()) {
            Endereco endJoao = Endereco.builder()
                    .cep("01310100")
                    .numero("1000")
                    .rua("Av. Paulista")
                    .bairro("Bela Vista")
                    .cidade("São Paulo")
                    .uf("SP")
                    .complemento("Apto 2001")
                    .build();

            ContaCorrente contaJoao = contaCorrenteService.criarContaPara(TipoTitularConta.CLIENTE);
            contaJoao.setSaldo(new BigDecimal("5000.00"));

            contaCorrenteRepository.save(contaJoao);
            enderecoRepository.save(endJoao);

            Cliente joao = Cliente.builder()
                    .nome("João Silva")
                    .cpf(cpfJoao)
                    .email("joao.silva@email.com")
                    .endereco(endJoao)
                    .contaCorrente(contaJoao)
                    .build();

            clienteRepository.save(joao);
        }

        String cpfMaria = "98765432109";

        if (clienteRepository.findByCpf(cpfMaria).isEmpty()) {
            Endereco endMaria = Endereco.builder()
                    .cep("04543130")
                    .numero("500")
                    .rua("Rua Ficticia")
                    .bairro("Vila Mariana")
                    .cidade("São Paulo")
                    .uf("SP")
                    .complemento("Casa")
                    .build();

            ContaCorrente contaMaria = contaCorrenteService.criarContaPara(TipoTitularConta.CLIENTE);
            contaMaria.setSaldo(new BigDecimal("100.00"));

            contaCorrenteRepository.save(contaMaria);
            enderecoRepository.save(endMaria);

            Cliente maria = Cliente.builder()
                    .nome("Maria Souza")
                    .cpf(cpfMaria)
                    .email("maria.souza@email.com")
                    .endereco(endMaria)
                    .contaCorrente(contaMaria)
                    .build();

            clienteRepository.save(maria);
        }
    }

    private void carregarProdutos() {
        if (produtoRepository.count() > 0) {
            return;
        }

        criarProdutoSeNaoExistir(
                "SKU-000001",
                "Notebook Dell",
                "Eletrônicos",
                new BigDecimal("3500.00"),
                10
        );

        criarProdutoSeNaoExistir(
                "SKU-000002",
                "Mouse Gamer",
                "Periféricos",
                new BigDecimal("150.00"),
                30
        );

        criarProdutoSeNaoExistir(
                "SKU-000003",
                "Teclado Mecânico",
                "Periféricos",
                new BigDecimal("300.00"),
                15
        );

        criarProdutoSeNaoExistir(
                "SKU-000004",
                "Monitor LG",
                "Monitores",
                new BigDecimal("1200.00"),
                5
        );
    }

    private void criarProdutoSeNaoExistir(
            String sku,
            String nome,
            String categoria,
            BigDecimal preco,
            Integer estoque
    ) {
        if (produtoRepository.existsBySku(sku)) {
            return;
        }

        Produto produto = new Produto(sku, nome, categoria, preco, estoque);
        produtoRepository.save(produto);
    }
}