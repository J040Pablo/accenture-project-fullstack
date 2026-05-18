package com.accenture.loja.empresa.service;

import com.accenture.loja.conta.service.ContaCorrenteService;
import com.accenture.loja.empresa.dto.EmpresaRequestDTO;
import com.accenture.loja.empresa.dto.EmpresaResponseDTO;
import com.accenture.loja.empresa.model.Empresa;
import com.accenture.loja.empresa.repository.EmpresaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static com.accenture.loja.shared.enums.TipoTitularConta.EMPRESA;
import com.accenture.loja.shared.exception.RegraNegocioException;

@ExtendWith(MockitoExtension.class)
class EmpresaServiceTest {

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private ContaCorrenteService contaCorrenteService;

    @Mock
    private com.accenture.loja.empresa.mapper.EmpresaMapper empresaMapper;

    @InjectMocks
    private EmpresaService empresaService;

    private Empresa empresaAtiva;
    private Empresa empresaInativa;

    @BeforeEach
    void setup() {
        empresaAtiva = criarEmpresaAtiva(1L, "Razao", "Fantasia", "12345678901234", "a@b.com", "9999-9999");
        empresaInativa = criarEmpresaAtiva(2L, "Razao2", "Fantasia2", "98765432109876", "c@d.com", "8888-8888");
        empresaInativa.setAtivo(false);
    }

    @Test
    void deveCadastrarEmpresaComSucesso() {
        EmpresaRequestDTO request = criarRequestValido("Razao", "Fantasia", "11111111111111", "x@y.com", "1234");

        when(empresaRepository.existsByCnpj(request.cnpj())).thenReturn(false);
        when(contaCorrenteService.existeContaEmpresa()).thenReturn(false);
        when(contaCorrenteService.criarContaPara(EMPRESA)).thenAnswer(invocation -> {
            com.accenture.loja.conta.model.ContaCorrente conta = new com.accenture.loja.conta.model.ContaCorrente();
            conta.setNumeroConta("12345");
            conta.setSaldo(java.math.BigDecimal.ZERO);
            conta.setTipoTitular(invocation.getArgument(0));
            return conta;
        });

        Empresa toSave = new Empresa(request.razaoSocial(), request.nomeFantasia(), request.cnpj(), request.email(), request.telefone());
        toSave.setId(10L);
        when(empresaRepository.save(any(Empresa.class))).thenReturn(toSave);
        when(empresaMapper.toResponse(any(Empresa.class))).thenAnswer(invocation -> {
            Empresa e = invocation.getArgument(0);
            return new EmpresaResponseDTO(e.getId(), e.getRazaoSocial(), e.getNomeFantasia(), e.getCnpj(), e.getEmail(), e.getTelefone(), e.getAtivo());
        });

        EmpresaResponseDTO response = empresaService.cadastrar(request);

        assertNotNull(response);
        assertEquals(10L, response.id());
        assertEquals(request.cnpj(), response.cnpj());
        assertTrue(response.ativo());

        ArgumentCaptor<Empresa> empresaCaptor = ArgumentCaptor.forClass(Empresa.class);
        verify(empresaRepository).save(empresaCaptor.capture());

        assertNotNull(empresaCaptor.getValue().getContaCorrente());
        assertEquals(EMPRESA, empresaCaptor.getValue().getContaCorrente().getTipoTitular());

        verify(empresaRepository).existsByCnpj(request.cnpj());
        verify(contaCorrenteService).existeContaEmpresa();
        verify(contaCorrenteService).criarContaPara(EMPRESA);
    }

    @Test
    void deveLancarQuandoJaExisteContaEmpresa() {
        EmpresaRequestDTO request = criarRequestValido("Razao", "Fantasia", "33333333333333", "x@y.com", "1234");

        when(empresaRepository.existsByCnpj(request.cnpj())).thenReturn(false);
        when(contaCorrenteService.existeContaEmpresa()).thenReturn(true);

        RegraNegocioException ex = assertThrows(
            RegraNegocioException.class,
                () -> empresaService.cadastrar(request)
        );

        assertEquals("Já existe uma conta da empresa cadastrada.", ex.getMessage());

        verify(empresaRepository).existsByCnpj(request.cnpj());
        verify(contaCorrenteService).existeContaEmpresa();
        verify(empresaRepository, never()).save(any());
    }

    @Test
    void deveLancarQuandoCadastrarComCnpjExistente() {
        EmpresaRequestDTO request = criarRequestValido("Razao", "Fantasia", "22222222222222", "x@y.com", null);

        when(empresaRepository.existsByCnpj(request.cnpj())).thenReturn(true);

        RegraNegocioException ex = assertThrows(RegraNegocioException.class, () -> empresaService.cadastrar(request));
        assertEquals("CNPJ já cadastrado", ex.getMessage());

        verify(empresaRepository).existsByCnpj(request.cnpj());
        verify(empresaRepository, never()).save(any());
    }

    @Test
    void deveLancarQuandoCadastrarComRequestNulo() {
        RegraNegocioException ex = assertThrows(RegraNegocioException.class, () -> empresaService.cadastrar(null));

        assertEquals("Dados da empresa são obrigatórios.", ex.getMessage());
        verify(empresaRepository, never()).existsByCnpj(any());
        verify(contaCorrenteService, never()).existeContaEmpresa();
        verify(empresaRepository, never()).save(any());
    }

    @Test
    void deveListarEmpresas() {
        when(empresaRepository.findAll()).thenReturn(List.of(empresaAtiva, empresaInativa));
        when(empresaMapper.toResponse(empresaAtiva)).thenReturn(
            new EmpresaResponseDTO(empresaAtiva.getId(), empresaAtiva.getRazaoSocial(), empresaAtiva.getNomeFantasia(), empresaAtiva.getCnpj(), empresaAtiva.getEmail(), empresaAtiva.getTelefone(), empresaAtiva.getAtivo())
        );
        when(empresaMapper.toResponse(empresaInativa)).thenReturn(
            new EmpresaResponseDTO(empresaInativa.getId(), empresaInativa.getRazaoSocial(), empresaInativa.getNomeFantasia(), empresaInativa.getCnpj(), empresaInativa.getEmail(), empresaInativa.getTelefone(), empresaInativa.getAtivo())
        );

        List<EmpresaResponseDTO> lista = empresaService.listar();

        assertEquals(2, lista.size());
        assertEquals(empresaAtiva.getCnpj(), lista.get(0).cnpj());
        assertFalse(lista.get(1).ativo());

        verify(empresaRepository).findAll();
    }

    @Test
    void deveListarEmpresasVazio() {
        when(empresaRepository.findAll()).thenReturn(List.of());

        List<EmpresaResponseDTO> lista = empresaService.listar();

        assertNotNull(lista);
        assertTrue(lista.isEmpty());
        verify(empresaRepository).findAll();
    }

    @Test
    void deveBuscarPorIdExistente() {
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaAtiva));
        when(empresaMapper.toResponse(empresaAtiva)).thenReturn(
            new EmpresaResponseDTO(empresaAtiva.getId(), empresaAtiva.getRazaoSocial(), empresaAtiva.getNomeFantasia(), empresaAtiva.getCnpj(), empresaAtiva.getEmail(), empresaAtiva.getTelefone(), empresaAtiva.getAtivo())
        );

        EmpresaResponseDTO dto = empresaService.buscarPorId(1L);

        assertNotNull(dto);
        assertEquals(empresaAtiva.getRazaoSocial(), dto.razaoSocial());

        verify(empresaRepository).findById(1L);
    }

    @Test
    void deveLancarQuandoBuscarPorIdInexistente() {
        when(empresaRepository.findById(anyLong())).thenReturn(Optional.empty());

        RegraNegocioException ex = assertThrows(RegraNegocioException.class, () -> empresaService.buscarPorId(99L));
        assertEquals("Empresa não encontrada", ex.getMessage());

        verify(empresaRepository).findById(99L);
    }

    // helpers
    private Empresa criarEmpresaAtiva(Long id, String razao, String fantasia, String cnpj, String email, String telefone) {
        Empresa e = new Empresa(razao, fantasia, cnpj, email, telefone);
        e.setId(id);
        e.setAtivo(true);
        return e;
    }

    private EmpresaRequestDTO criarRequestValido(String razao, String fantasia, String cnpj, String email, String telefone) {
        return new EmpresaRequestDTO(razao, fantasia, cnpj, email, telefone);
    }
}
