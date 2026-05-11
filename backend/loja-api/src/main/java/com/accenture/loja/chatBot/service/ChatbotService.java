package com.accenture.loja.chatBot.service;

import com.accenture.loja.chatBot.dto.ChatResponseDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final RestClient geminiRestClient;

    @Value("${gemini.api.key:}")
    private String apiKey;

    public ChatbotService(RestClient geminiRestClient) {
        this.geminiRestClient = geminiRestClient;
    }

    public ChatResponseDTO responder(String mensagemUsuario) {
        if (apiKey == null || apiKey.isBlank()) {
            return new ChatResponseDTO("GEMINI_API_KEY não configurada no ambiente.");
        }

        try {
            Map<String, Object> body = Map.of(
                    "systemInstruction", Map.of(
                            "parts", List.of(
                                    Map.of("text", criarPromptSistema())
                            )
                    ),
                    "contents", List.of(
                            Map.of(
                                    "role", "user",
                                    "parts", List.of(
                                            Map.of("text", mensagemUsuario)
                                    )
                            )
                    )
            );

            JsonNode response = callGemini(body);

            String resposta = extrairTexto(response);

            return new ChatResponseDTO(resposta);

        } catch (HttpClientErrorException.TooManyRequests ex) {
            return new ChatResponseDTO(
                    "O assistente atingiu o limite gratuito da API Gemini no momento. Tente novamente mais tarde."
            );

        } catch (HttpClientErrorException.Unauthorized ex) {
            return new ChatResponseDTO(
                    "A chave da API Gemini está inválida ou expirada. Gere uma nova chave no Google AI Studio."
            );

        } catch (HttpClientErrorException.Forbidden ex) {
            return new ChatResponseDTO(
                    "A chave da API Gemini não tem permissão para usar este modelo. Verifique o projeto no Google AI Studio."
            );

        } catch (HttpClientErrorException ex) {
            HttpStatusCode status = ex.getStatusCode();

            return new ChatResponseDTO(
                    "A API Gemini retornou erro HTTP " + status.value() + ". Usando resposta local: "
                            + responderFallback(mensagemUsuario)
            );

        } catch (Exception ex) {
            ex.printStackTrace();

            return new ChatResponseDTO(
                    "Erro ao chamar a API Gemini: " + ex.getClass().getSimpleName() + " - " + ex.getMessage()
            );
        }
    }

    /**
     * Separated method to perform the HTTP call to Gemini — extracted for easier testing.
     */
    protected JsonNode callGemini(Map<String, Object> body) {
        String response = geminiRestClient.post()
                .uri("/models/gemini-2.5-flash:generateContent?key=" + apiKey)
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            return objectMapper.readTree(response);
        } catch (Exception ex) {
            throw new RuntimeException("Falha ao interpretar a resposta da API Gemini", ex);
        }
    }

    private String criarPromptSistema() {
        return """
                Você é o assistente virtual de um sistema de loja/e-commerce desenvolvido em Java Spring Boot e React.

                Responda em português do Brasil.
                Seja claro, educado e objetivo.
                Ajude o usuário com dúvidas sobre clientes, produtos, estoque, pedidos, pagamento, cancelamento e análise de risco.
                Não invente dados reais do banco.
                Se o usuário perguntar algo que depende de dados reais do sistema, explique que ele deve consultar a tela correspondente.
                Não responda assuntos fora do contexto da loja.
                """;
    }

    String extrairTexto(JsonNode response) {
        if (response == null) {
            return "Não consegui gerar uma resposta no momento.";
        }

        JsonNode candidates = response.get("candidates");

        if (candidates != null && candidates.isArray() && !candidates.isEmpty()) {
            JsonNode content = candidates.get(0).get("content");

            if (content != null) {
                JsonNode parts = content.get("parts");

                if (parts != null && parts.isArray() && !parts.isEmpty()) {
                    JsonNode text = parts.get(0).get("text");

                    if (text != null && text.isTextual()) {
                        return text.asText();
                    }
                }
            }
        }

        return "Não consegui entender a resposta da IA.";
    }

    private String responderFallback(String mensagemUsuario) {
        String mensagem = mensagemUsuario == null ? "" : mensagemUsuario.toLowerCase();

        if (mensagem.contains("estoque")) {
            return "Para verificar o estoque, acesse a tela de Produtos. O sistema controla a quantidade disponível e bloqueia pedidos sem estoque suficiente.";
        }

        if (mensagem.contains("pedido")) {
            return "Para criar um pedido, selecione o cliente e os produtos desejados. O sistema calcula o total, reserva o estoque e permite seguir para pagamento.";
        }

        if (mensagem.contains("pagamento") || mensagem.contains("pagar")) {
            return "O pagamento debita o valor da conta do cliente e credita na conta da empresa. Um pedido só deve ser pago depois de reservado.";
        }

        if (mensagem.contains("cancelamento") || mensagem.contains("cancelar")) {
            return "No cancelamento, o sistema devolve o estoque. Se o pedido já estiver pago, também deve estornar o valor para o cliente.";
        }

        if (mensagem.contains("risco")) {
            return "A análise de risco avalia dados do pedido, como valor, quantidade de itens e situação do cliente, para indicar se o pedido parece seguro ou suspeito.";
        }

        if (mensagem.contains("cliente")) {
            return "Na área de clientes, é possível cadastrar, listar, editar e excluir clientes, incluindo endereço integrado ao ViaCEP.";
        }

        if (mensagem.contains("produto")) {
            return "Na área de produtos, é possível cadastrar, editar, listar e inativar produtos, além de controlar preço, SKU, categoria e estoque.";
        }

        return "Sou o assistente da loja. Posso ajudar com dúvidas sobre clientes, produtos, estoque, pedidos, pagamento, cancelamento e análise de risco.";
    }

    }
