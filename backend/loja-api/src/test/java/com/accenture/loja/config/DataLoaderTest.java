package com.accenture.loja.config;

import com.accenture.loja.cliente.model.Cliente;
import com.accenture.loja.cliente.repository.ClienteRepository;
import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.conta.service.ContaCorrenteService;
import com.accenture.loja.empresa.dto.EmpresaRequestDTO;
import com.accenture.loja.empresa.service.EmpresaService;
import com.accenture.loja.empresa.repository.EmpresaRepository;
import com.accenture.loja.endereco.model.Endereco;
import com.accenture.loja.endereco.repository.EnderecoRepository;
import com.accenture.loja.produto.repository.ProdutoRepository;
import com.accenture.loja.shared.enums.TipoTitularConta;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataLoaderTest {

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private EmpresaService empresaService;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private EnderecoRepository enderecoRepository;

    @Mock
    private ContaCorrenteService contaCorrenteService;

    @Mock
    private ContaCorrenteRepository contaCorrenteRepository;

    private DataLoader dataLoader;

    @BeforeEach
    void setUp() {
        dataLoader = new DataLoader(
                empresaRepository,
                empresaService,
                clienteRepository,
                produtoRepository,
                enderecoRepository,
                contaCorrenteService,
                contaCorrenteRepository
        );
    }

    @Test
    void deveImplementarCommandLineRunnerEUsarProfileDev() {
        assertTrue(CommandLineRunner.class.isAssignableFrom(DataLoader.class));

        Profile profile = DataLoader.class.getAnnotation(Profile.class);
        assertNotNull(profile);
        assertTrue(Arrays.asList(profile.value()).contains("dev"));
    }

    @Test
    void deveCriarEmpresaClientesContasEProdutosQuandoBancoEstiverVazio() throws Exception {
        when(empresaRepository.count()).thenReturn(0L);
        when(clienteRepository.count()).thenReturn(0L);
        when(produtoRepository.count()).thenReturn(0L);
        when(clienteRepository.findByCpf("12345678901")).thenReturn(Optional.empty());
        when(clienteRepository.findByCpf("98765432109")).thenReturn(Optional.empty());
        when(produtoRepository.existsBySku(anyString())).thenReturn(false);

        ContaCorrente contaCliente1 = criarConta("11111", new BigDecimal("5000.00"));
        ContaCorrente contaCliente2 = criarConta("22222", new BigDecimal("100.00"));
        when(contaCorrenteService.criarContaPara(TipoTitularConta.CLIENTE))
                .thenReturn(contaCliente1, contaCliente2);
        when(empresaService.cadastrar(any(EmpresaRequestDTO.class)))
                .thenReturn(null);

        assertDoesNotThrow(() -> dataLoader.run());

        verify(empresaService, times(1)).cadastrar(any(EmpresaRequestDTO.class));
        verify(enderecoRepository, times(2)).save(any(Endereco.class));
        verify(contaCorrenteRepository, times(2)).save(any(ContaCorrente.class));
        verify(clienteRepository, times(2)).save(any(Cliente.class));
        verify(produtoRepository, times(4)).save(any());
    }

    @Test
    void naoDeveCriarEmpresaQuandoJaExistirEmpresa() throws Exception {
        when(empresaRepository.count()).thenReturn(1L);
        when(clienteRepository.count()).thenReturn(1L);
        when(produtoRepository.count()).thenReturn(1L);

        dataLoader.run();

        verify(empresaService, never()).cadastrar(any());
    }

    @Test
    void naoDeveCriarClientesQuandoJaExistirClienteNoBanco() throws Exception {
        when(empresaRepository.count()).thenReturn(1L);
        when(clienteRepository.count()).thenReturn(1L);
        when(produtoRepository.count()).thenReturn(1L);

        dataLoader.run();

        verify(clienteRepository, never()).save(any());
        verify(enderecoRepository, never()).save(any());
        verify(contaCorrenteService, never()).criarContaPara(any());
    }

    @Test
    void naoDeveCriarProdutosQuandoJaExistirProdutoNoBanco() throws Exception {
        when(empresaRepository.count()).thenReturn(1L);
        when(clienteRepository.count()).thenReturn(1L);
        when(produtoRepository.count()).thenReturn(1L);

        dataLoader.run();

        verify(produtoRepository, never()).save(any());
    }

    @Test
    void deveIgnorarClienteEspecificoQuandoCpfJaExistir() throws Exception {
        when(empresaRepository.count()).thenReturn(1L);
        when(clienteRepository.count()).thenReturn(0L);
        when(produtoRepository.count()).thenReturn(1L);
        when(clienteRepository.findByCpf("12345678901")).thenReturn(Optional.of(new Cliente()));
        when(clienteRepository.findByCpf("98765432109")).thenReturn(Optional.empty());

        ContaCorrente contaCliente = criarConta("33333", new BigDecimal("100.00"));
        when(contaCorrenteService.criarContaPara(TipoTitularConta.CLIENTE)).thenReturn(contaCliente);

        dataLoader.run();

        verify(clienteRepository, times(1)).save(any(Cliente.class));
        verify(enderecoRepository, times(1)).save(any(Endereco.class));
        verify(contaCorrenteRepository, times(1)).save(any(ContaCorrente.class));
    }

    @Test
    void deveIgnorarSegundoClienteQuandoCpfJaExistir() throws Exception {
        when(empresaRepository.count()).thenReturn(1L);
        when(clienteRepository.count()).thenReturn(0L);
        when(produtoRepository.count()).thenReturn(1L);
        when(clienteRepository.findByCpf("12345678901")).thenReturn(Optional.empty());
        when(clienteRepository.findByCpf("98765432109")).thenReturn(Optional.of(new Cliente()));

        ContaCorrente contaCliente = criarConta("44444", new BigDecimal("5000.00"));
        when(contaCorrenteService.criarContaPara(TipoTitularConta.CLIENTE)).thenReturn(contaCliente);

        dataLoader.run();

        verify(clienteRepository, times(1)).save(any(Cliente.class));
        verify(enderecoRepository, times(1)).save(any(Endereco.class));
        verify(contaCorrenteRepository, times(1)).save(any(ContaCorrente.class));
    }

    @Test
    void deveIgnorarProdutoEspecificoQuandoSkuJaExistir() throws Exception {
        when(empresaRepository.count()).thenReturn(1L);
        when(clienteRepository.count()).thenReturn(1L);
        when(produtoRepository.count()).thenReturn(0L);
        when(produtoRepository.existsBySku("NB-DELL-001")).thenReturn(true);
        when(produtoRepository.existsBySku("MOUSE-GAMER-001")).thenReturn(false);
        when(produtoRepository.existsBySku("TECLADO-MECA-001")).thenReturn(true);
        when(produtoRepository.existsBySku("MONITOR-LG-001")).thenReturn(false);

        dataLoader.run();

        verify(produtoRepository, times(2)).save(any());
    }

    @Test
    void naoDeveInterromperStartupQuandoCadastroDaEmpresaFalhar() throws Exception {
        when(empresaRepository.count()).thenReturn(0L);
        when(clienteRepository.count()).thenReturn(0L);
        when(produtoRepository.count()).thenReturn(0L);
        when(clienteRepository.findByCpf("12345678901")).thenReturn(Optional.empty());
        when(clienteRepository.findByCpf("98765432109")).thenReturn(Optional.empty());
        when(produtoRepository.existsBySku(anyString())).thenReturn(false);
        when(empresaService.cadastrar(any(EmpresaRequestDTO.class)))
                .thenThrow(new RuntimeException("falha no cadastro"));

        ContaCorrente contaCliente1 = criarConta("11111", new BigDecimal("5000.00"));
        ContaCorrente contaCliente2 = criarConta("22222", new BigDecimal("100.00"));
        when(contaCorrenteService.criarContaPara(TipoTitularConta.CLIENTE))
                .thenReturn(contaCliente1, contaCliente2);

        assertDoesNotThrow(() -> dataLoader.run());

        verify(empresaService, times(1)).cadastrar(any(EmpresaRequestDTO.class));
        verify(clienteRepository, times(2)).save(any(Cliente.class));
        verify(produtoRepository, times(4)).save(any());
    }

    private ContaCorrente criarConta(String numeroConta, BigDecimal saldo) {
        ContaCorrente conta = ContaCorrente.builder()
                .numeroConta(numeroConta)
                .saldo(saldo)
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();
        conta.setId(1L);
        return conta;
    }
}