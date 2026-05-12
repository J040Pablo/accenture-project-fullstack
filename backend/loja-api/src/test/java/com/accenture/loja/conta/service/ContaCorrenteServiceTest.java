package com.accenture.loja.conta.service;

import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.conta.repository.ContaCorrenteRepository;
import com.accenture.loja.shared.enums.TipoTitularConta;
import com.accenture.loja.shared.exception.BusinessException;
import com.accenture.loja.shared.exception.RegraNegocioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ContaCorrenteServiceTest {

    @Mock
    private ContaCorrenteRepository repository;

    @InjectMocks
    private ContaCorrenteService service;

    private ContaCorrente contaCliente;
    private ContaCorrente contaEmpresa;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        contaCliente = ContaCorrente.builder()
                .id(1L)
                .numeroConta("12345")
                .saldo(new BigDecimal("1000.00"))
                .tipoTitular(TipoTitularConta.CLIENTE)
                .build();

        contaEmpresa = ContaCorrente.builder()
                .id(2L)
                .numeroConta("67890")
                .saldo(new BigDecimal("5000.00"))
                .tipoTitular(TipoTitularConta.EMPRESA)
                .build();
    }

    @Test
    void testBuscarContaEmpresa_Sucesso() {
        when(repository.findByTipoTitular(TipoTitularConta.EMPRESA))
                .thenReturn(Optional.of(contaEmpresa));

        ContaCorrente resultado = service.buscarContaEmpresa();

        assertNotNull(resultado);
        assertEquals(TipoTitularConta.EMPRESA, resultado.getTipoTitular());
        assertEquals("67890", resultado.getNumeroConta());
    }

    @Test
    void testBuscarContaEmpresa_NaoEncontrada() {
        when(repository.findByTipoTitular(TipoTitularConta.EMPRESA))
                .thenReturn(Optional.empty());

        assertThrows(RegraNegocioException.class, () -> service.buscarContaEmpresa());
    }

    @Test
    void testTransferir_Sucesso() {
        service.transferir(contaCliente, contaEmpresa, new BigDecimal("100.00"));

        assertEquals(new BigDecimal("900.00"), contaCliente.getSaldo());
        assertEquals(new BigDecimal("5100.00"), contaEmpresa.getSaldo());
        
        verify(repository, times(2)).save(any(ContaCorrente.class));
    }

    @Test
    void testTransferir_SaldoInsuficiente() {
        assertThrows(RegraNegocioException.class, () -> 
            service.transferir(contaCliente, contaEmpresa, new BigDecimal("2000.00"))
        );
    }

    @Test
    void testTransferir_ContaOrigemNula() {
        assertThrows(RegraNegocioException.class, () -> 
            service.transferir(null, contaEmpresa, new BigDecimal("100.00"))
        );
    }

    @Test
    void testTransferir_ContaDestinoNula() {
        assertThrows(RegraNegocioException.class, () -> 
            service.transferir(contaCliente, null, new BigDecimal("100.00"))
        );
    }

    @Test
    void testTransferir_ValorZero() {
        assertThrows(RegraNegocioException.class, () -> 
            service.transferir(contaCliente, contaEmpresa, BigDecimal.ZERO)
        );
    }

    @Test
    void testTransferir_ValorNegativo() {
        assertThrows(RegraNegocioException.class, () -> 
            service.transferir(contaCliente, contaEmpresa, new BigDecimal("-100.00"))
        );
    }

    @Test
    void testBuscarPorId_Sucesso() {
        when(repository.findById(1L)).thenReturn(Optional.of(contaCliente));

        var resultado = service.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("12345", resultado.getNumeroConta());
        assertEquals(new BigDecimal("1000.00"), resultado.getSaldo());
        assertEquals(TipoTitularConta.CLIENTE, resultado.getTipoTitular());
    }

    @Test
    void testBuscarPorId_NaoEncontrada() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> service.buscarPorId(999L));
    }

    @Test
    void testSalvar_ComTipoTitular() {
        when(repository.save(any(ContaCorrente.class))).thenReturn(contaCliente);

        ContaCorrente resultado = service.salvar(contaCliente);

        assertNotNull(resultado);
        assertEquals(TipoTitularConta.CLIENTE, resultado.getTipoTitular());
        verify(repository, times(1)).save(contaCliente);
    }

    @Test
    void testListarContas_Sucesso() {
        when(repository.findAll()).thenReturn(java.util.List.of(contaCliente, contaEmpresa));

        var resultado = service.listarContas();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals(contaCliente.getId(), resultado.get(0).getId());
        assertEquals(contaEmpresa.getId(), resultado.get(1).getId());
    }
}
