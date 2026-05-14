# 🛒 Loja API — Backend

> API REST de e-commerce desenvolvida em Java 21 com Spring Boot, seguindo arquitetura de Monólito Modular.

---

## Índice

- [Objetivo do Projeto](#objetivo-do-projeto)
- [Tecnologias](#tecnologias)
- [Como Rodar o Backend](#como-rodar-o-backend)
- [Como Rodar os Testes](#como-rodar-os-testes)
- [Como Acessar o H2](#como-acessar-o-h2)
- [Como Acessar o Swagger](#como-acessar-o-swagger)
- [Fluxo Principal](#fluxo-principal)
- [Funcionalidade Diferencial](#funcionalidade-diferencial)

---

## Objetivo do Projeto

Construir o backend completo de uma loja virtual utilizando Java 21 e Spring Boot, com arquitetura de **Monólito Modular** — uma aplicação única dividida internamente em módulos independentes por domínio de negócio.

O sistema cobre todo o ciclo de uma compra online:

- Cadastro de clientes e empresas
- Gestão de produtos e stock
- Criação e gestão de pedidos
- Análise de risco anti-fraude
- Movimentações financeiras entre contas

---

## Tecnologias

| Tecnologia | Versão | Descrição |
|---|---|---|
| Java | 21 | Linguagem principal |
| Spring Boot | 4.0.6 | Framework principal |
| Spring Data JPA | — | Persistência de dados |
| Hibernate | 7.2.12 | ORM |
| H2 Database | 2.4.240 | Banco de dados em memória |
| Lombok | 1.18.46 | Redução de boilerplate |
| SpringDoc OpenAPI | 3.0.2 | Documentação Swagger |
| JaCoCo | 0.8.12 | Cobertura de testes |
| JUnit 5 | — | Testes unitários |
| Mockito | — | Mocks para testes |
| ViaCEP | — | Preenchimento automático de endereço por CEP |

### Estrutura de Módulos

```
com.accenture.loja
├── analiserisco      → Motor anti-fraude
├── chatBot           → Assistente virtual
├── cliente           → Gestão de clientes
├── conta             → Contas correntes
├── empresa           → Gestão de empresas
├── endereco          → Endereços via ViaCEP
├── movimentacao      → Histórico financeiro
├── pedido            → Carrinho e pedidos
├── produto           → Catálogo de produtos
└── shared            → Enums, exceções e utilitários
```

---

## Como Rodar o Backend

### Pré-requisitos

- Java 21 instalado
- Git instalado

### Passo a passo

**1. Clonar o repositório**
```bash
git clone https://github.com/J040Pablo/accenture-project-fullstack.git
cd backend/loja-api
```

**2. Rodar a aplicação**
```bash
.\mvnw spring-boot:run
```

A aplicação sobe em: **http://localhost:8080**

> ⚠️ O banco H2 é em memória — os dados são perdidos ao reiniciar.

---

## Como Rodar os Testes


**1. Executar os testes**
```bash
.\mvnw test
```

**3. Ver o relatório de cobertura**

O relatório JaCoCo é gerado automaticamente em:
```
target/site/jacoco/index.html
```

Abra o ficheiro no browser para ver a cobertura por pacote, classe e método.

| Métrica | Cobertura |
|---|---|

---

## Como Acessar o H2

Com a aplicação a correr, aceda a:

**URL:** `http://localhost:8080/h2-console`

| Campo | Valor |
|---|---|
| JDBC URL | `jdbc:h2:mem:lojadb` |
| Username | `SA` |
| Password | *(deixar vazio)* |

Exemplo de queries úteis:
```sql
SELECT * FROM CONTAS_CORRENTES;
SELECT * FROM TB_PEDIDO;
SELECT * FROM TB_MOVIMENTACAO_CONTA;
SELECT * FROM TB_ANALISE_RISCO_PEDIDO;
```

---

## Como Acessar o Swagger

Com a aplicação a correr, aceda a:

**URL:** `http://localhost:8080/swagger-ui.html`

O Swagger documenta todos os endpoints disponíveis e permite testá-los diretamente pelo browser.

### Endpoints disponíveis

| Módulo | Método | Endpoint | Descrição |
|---|---|---|---|
| Cliente | POST | `/api/clientes` | Criar cliente |
| Cliente | GET | `/api/clientes` | Listar clientes |
| Cliente | GET | `/api/clientes/{id}` | Buscar cliente por ID |
| Empresa | POST | `/api/empresas` | Criar empresa |
| Produto | POST | `/api/produtos` | Criar produto |
| Produto | GET | `/api/produtos` | Listar produtos |
| Pedido | POST | `/api/pedidos` | Criar pedido |
| Pedido | POST | `/api/pedidos/{id}/reservar` | Reservar pedido |
| Pedido | POST | `/api/pedidos/{id}/pagar` | Pagar pedido |
| Pedido | POST | `/api/pedidos/{id}/cancelar` | Cancelar pedido |
| Análise de Risco | POST | `/api/pedidos/{id}/analisar-risco` | Analisar risco |
| Análise de Risco | GET | `/api/pedidos/{id}/analise-risco` | Consultar análise |
| Movimentação | GET | `/api/movimentacoes` | Listar movimentações |
| Movimentação | GET | `/api/contas/{id}/movimentacoes` | Extrato de uma conta |
| Movimentação | POST | `/api/movimentacoes` | Registar movimentação |

---

## Fluxo Principal

```
1. POST /api/clientes
   → Cria cliente com endereço (via ViaCEP) e ContaCorrente automática

2. POST /api/empresas
   → Regista empresa com ContaCorrente própria

3. POST /api/produtos
   → Cadastra produto com preço e estoque

4. POST /api/pedidos
   → Cria pedido associando cliente e produtos

5. POST /api/pedidos/{id}/reservar
   → Reserva o estoque dos produtos do pedido

6. POST /api/pedidos/{id}/analisar-risco
   → Motor anti-fraude avalia e classifica o risco do pedido

7. POST /api/pedidos/{id}/pagar
   → Debita conta do cliente, credita conta da empresa
   → Regista movimentações financeiras automáticas

8. GET /api/contas/{id}/movimentacoes
   → Consulta o extrato financeiro da conta
```

### Exemplo de body para criar um pedido

```json
{
  "clienteId": 1,
  "desconto": 0,
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2
    }
  ]
}
```

---

## Funcionalidade Diferencial





### 💰 Histórico Financeiro Completo

Cada transação gera movimentações automáticas rastreáveis:

| Tipo | Descrição |
|---|---|
| `PAGAMENTO_PEDIDO` | Débito na conta do cliente ao pagar |
| `RECEBIMENTO_EMPRESA` | Crédito na conta da empresa ao receber |
| `ESTORNO_CLIENTE` | Crédito ao cliente em caso de cancelamento |
| `ESTORNO_EMPRESA` | Débito da empresa em caso de cancelamento |

---
