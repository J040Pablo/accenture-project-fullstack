# Accenture Project Fullstack

Sistema fullstack de loja com backend em Spring Boot e frontend em React.

O projeto cobre cadastro de cliente com endereço via ViaCEP, conta corrente do cliente, conta da empresa, produto, estoque, pedido, pagamento, cancelamento com estorno, movimentações financeiras e funcionalidades diferenciais para apoio à operação.

## Tecnologias

### Backend

- Java 21
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Bean Validation
- Lombok
- H2 Database
- Swagger / Springdoc OpenAPI
- JUnit
- Mockito
- JaCoCo

### Frontend

- React
- TypeScript
- Vite
- Axios
- React Router

## Funcionalidades

### Cliente

- CRUD completo
- Endereço obrigatório
- Consulta de CEP via ViaCEP
- Preenchimento automático de logradouro, bairro, cidade e UF

### Conta Corrente

- Conta corrente do cliente
- Conta da empresa
- Controle de saldo
- Movimentações financeiras
- Extrato por conta

### Produto e Estoque

- CRUD de produto
- Ativação e inativação de produto
- Controle de estoque
- Bloqueio de estoque negativo
- Bloqueio de pedido sem estoque disponível

### Pedido

Fluxo principal:

1. Criar pedido
2. Reservar pedido
3. Pagar pedido
4. Cancelar pedido

Regras aplicadas:

- Pedido não pode ser pago sem reserva
- Pedido não pode ser criado sem estoque disponível
- Reserva do pedido baixa o estoque
- Pagamento debita a conta do cliente
- Pagamento credita a conta da empresa
- Cancelamento de pedido pago gera estorno
- Cancelamento devolve estoque quando aplicável
- Exclusão de pedido é diferente de cancelamento

### Dashboard

- Indicadores de clientes, produtos, pedidos e contas
- Gráficos baseados em dados consumidos do backend
- Métricas calculadas no frontend a partir dos dados retornados pela API

### Movimentações Financeiras

- Histórico financeiro das contas
- Registro de pagamentos
- Registro de recebimentos da empresa
- Registro de estornos
- Extrato por conta

## Funcionalidade Diferencial

O projeto possui análise de risco de pedido e chatbot com IA/Gemini como diferenciais.

### Análise de Risco

A análise de risco avalia pedidos com base em regras de negócio, como valor do pedido, status, saldo e inconsistências operacionais.

Localização principal:

- Backend: `backend/loja-api/src/main/java/com/accenture/loja/analiserisco`
- Frontend: `frontend/loja-web/src/pages/AnaliseRisco/AnaliseRisco.tsx`

### Chatbot

O chatbot responde perguntas relacionadas ao contexto da loja.

Quando a variável `GEMINI_API_KEY` está configurada, o backend utiliza a Gemini API. Caso a chave não esteja configurada, o backend retorna fallback controlado sem quebrar o sistema.

Localização principal:

- Backend: `backend/loja-api/src/main/java/com/accenture/loja/chatBot`
- Frontend: `frontend/loja-web/src/components/chatbot/Chatbot.tsx`

## Estrutura do Projeto

```text
accenture-project-fullstack/
├── backend/
│   └── loja-api/
├── frontend/
│   └── loja-web/
└── README.md
```

## Como Rodar o Backend

```bash
cd backend/loja-api
./mvnw spring-boot:run
```

Com Maven instalado localmente:

```bash
cd backend/loja-api
mvn spring-boot:run
```

Backend disponível em:

```text
http://localhost:8080
```

## Dados de Desenvolvimento

O projeto possui seed de dados em:

```text
backend/loja-api/src/main/java/com/accenture/loja/config/DataLoader.java
```

Para iniciar o backend com dados de desenvolvimento:

```bash
cd backend/loja-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Com Maven instalado localmente:

```bash
cd backend/loja-api
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Swagger

A documentação da API está disponível em:

```text
http://localhost:8080/swagger-ui.html
```

Também pode estar disponível em:

```text
http://localhost:8080/swagger-ui/index.html
```

## H2 Database

Console do H2:

```text
http://localhost:8080/h2-console
```

Configuração atual:

```text
JDBC URL: jdbc:h2:mem:lojadb
User: sa
Password:
```

## Como Rodar os Testes do Backend

```bash
cd backend/loja-api
./mvnw test
```

Com Maven instalado localmente:

```bash
cd backend/loja-api
mvn test
```

## Relatório de Cobertura

Para gerar o relatório JaCoCo:

```bash
cd backend/loja-api
./mvnw test jacoco:report
```

Com Maven instalado localmente:

```bash
cd backend/loja-api
mvn test jacoco:report
```

Arquivo gerado:

```text
backend/loja-api/target/site/jacoco/index.html
```

## Como Rodar o Frontend

```bash
cd frontend/loja-web
npm install
npm run dev
```

Frontend disponível em:

```text
http://localhost:5173
```

## Variável de Ambiente do Frontend

O frontend usa `VITE_API_URL`.

Arquivo de exemplo:

```text
frontend/loja-web/.env.example
```

Valor esperado:

```env
VITE_API_URL=http://localhost:8080/api
```

## Build do Frontend

```bash
cd frontend/loja-web
npm run build
```

## Integração Frontend e Backend

```text
Frontend React: http://localhost:5173
Backend Spring Boot: http://localhost:8080
Banco H2: em memória
```

O frontend consome o backend pela camada de services:

```text
frontend/loja-web/src/services
```

A lista completa dos endpoints está disponível no Swagger.

## Principais Módulos da API

- Clientes
- Endereços
- Contas Correntes
- Empresas
- Produtos
- Pedidos
- Movimentações Financeiras
- Análise de Risco
- Chatbot

## Fluxo Principal do Sistema

```text
Cliente
↓
Conta Corrente
↓
Produto com estoque
↓
Pedido criado
↓
Pedido reservado
↓
Estoque baixado
↓
Pedido pago
↓
Conta do cliente debitada
↓
Conta da empresa creditada
↓
Movimentação financeira registrada
↓
Cancelamento, se necessário
↓
Estorno financeiro e devolução de estoque
```

## Comandos Úteis

### Backend

```bash
cd backend/loja-api
./mvnw spring-boot:run
```

### Backend com dados de desenvolvimento

```bash
cd backend/loja-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Testes do backend

```bash
cd backend/loja-api
./mvnw test
```

### Frontend

```bash
cd frontend/loja-web
npm install
npm run dev
```

### Build do frontend

```bash
cd frontend/loja-web
npm run build
```

## Observações

- A análise de risco pode ser gerada pela API quando ainda não existir para um pedido.
- O chatbot depende da variável `GEMINI_API_KEY` para usar a Gemini API.
- Se `GEMINI_API_KEY` não estiver configurada, o backend retorna fallback controlado.
- O Dashboard consome dados do backend e calcula alguns indicadores no frontend.
- As movimentações financeiras são geradas pelos fluxos de pagamento e estorno de pedidos.