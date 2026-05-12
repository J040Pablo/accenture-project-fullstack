package com.accenture.loja.chatBot.service;

import com.accenture.loja.chatBot.dto.ChatResponseDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClient.Builder;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import org.springframework.http.HttpMethod;

@ExtendWith(MockitoExtension.class)
class ChatbotServiceTest {

    @Mock
    private RestClient geminiRestClient;

    private ChatbotService chatbotService;

    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        chatbotService = new ChatbotService(geminiRestClient);
        // default: no api key
        ReflectionTestUtils.setField(chatbotService, "apiKey", "");
    }

    @Test
    void whenApiKeyMissing_returnsExplicitMessage() {
        chatbotService = new ChatbotService(geminiRestClient);
        ReflectionTestUtils.setField(chatbotService, "apiKey", "");

        ChatResponseDTO resp = chatbotService.responder("teste");
        assertEquals("GEMINI_API_KEY não configurada no ambiente.", resp.answer());
    }

    @Test
    void whenApiKeyIsNull_returnsExplicitMessage() {
        chatbotService = new ChatbotService(geminiRestClient);
        ReflectionTestUtils.setField(chatbotService, "apiKey", null);

        ChatResponseDTO resp = chatbotService.responder("teste");
        assertEquals("GEMINI_API_KEY não configurada no ambiente.", resp.answer());
    }

    @Test
    void extrairTexto_variousCases() throws Exception {
        // null response
        assertEquals("Não consegui gerar uma resposta no momento.", chatbotService.extrairTexto(null));

        // candidates exists but is not an array
        JsonNode nodeCandidatesNotArray = mapper.readTree("{\"candidates\": {}} ");
        assertEquals("Não consegui entender a resposta da IA.", chatbotService.extrairTexto(nodeCandidatesNotArray));

        // no candidates
        JsonNode nodeNoCandidates = mapper.readTree("{}");
        assertEquals("Não consegui entender a resposta da IA.", chatbotService.extrairTexto(nodeNoCandidates));

        // candidates empty
        JsonNode nodeEmptyCandidates = mapper.readTree("{\"candidates\": []}");
        assertEquals("Não consegui entender a resposta da IA.", chatbotService.extrairTexto(nodeEmptyCandidates));

        // content exists but no parts
        JsonNode nodeNoParts = mapper.readTree("{\"candidates\":[{\"content\":{}}]}");
        assertEquals("Não consegui entender a resposta da IA.", chatbotService.extrairTexto(nodeNoParts));

        // content exists but is null in the first candidate
        JsonNode nodeContentNull = mapper.readTree("{\"candidates\":[{}]}");
        assertEquals("Não consegui entender a resposta da IA.", chatbotService.extrairTexto(nodeContentNull));

        // parts exists but is empty
        JsonNode nodePartsEmpty = mapper.readTree("{\"candidates\":[{\"content\":{\"parts\":[]}}]}");
        assertEquals("Não consegui entender a resposta da IA.", chatbotService.extrairTexto(nodePartsEmpty));

        // parts exists but is not an array
        JsonNode nodePartsNotArray = mapper.readTree("{\"candidates\":[{\"content\":{\"parts\": {}}}]}");
        assertEquals("Não consegui entender a resposta da IA.", chatbotService.extrairTexto(nodePartsNotArray));

        // parts exists but no text
        JsonNode nodeNoText = mapper.readTree("{\"candidates\":[{\"content\":{\"parts\":[{}]}}]}");
        assertEquals("Não consegui entender a resposta da IA.", chatbotService.extrairTexto(nodeNoText));

        // text exists but is not textual
        JsonNode nodeNonTextual = mapper.readTree("{\"candidates\":[{\"content\":{\"parts\":[{\"text\": 123}]}}]}");
        assertEquals("Não consegui entender a resposta da IA.", chatbotService.extrairTexto(nodeNonTextual));

        // text exists
        JsonNode nodeText = mapper.readTree("{\"candidates\": [{\"content\": {\"parts\": [{\"text\": \"Resposta da IA\"}]}}]}");
        assertEquals("Resposta da IA", chatbotService.extrairTexto(nodeText));
    }

    @Test
    void responder_successPath_usesExtractedText() throws Exception {
        Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

        RestClient restClient = builder.build();
        chatbotService = new ChatbotService(restClient);
        ReflectionTestUtils.setField(chatbotService, "apiKey", "dummy");

        server.expect(requestTo("/models/gemini-2.5-flash:generateContent?key=dummy"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(
                        "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"Resposta da IA\"}]}}]}",
                        MediaType.APPLICATION_JSON
                ));

        ChatResponseDTO resp = chatbotService.responder("Olá");
        server.verify();
        assertEquals("Resposta da IA", resp.answer());
    }

    @Test
    void responder_invalidJson_returnsDetailedErrorMessage() {
        Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

        RestClient restClient = builder.build();
        chatbotService = new ChatbotService(restClient);
        ReflectionTestUtils.setField(chatbotService, "apiKey", "dummy");

        server.expect(requestTo("/models/gemini-2.5-flash:generateContent?key=dummy"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("not-json", MediaType.TEXT_PLAIN));

        ChatResponseDTO resp = chatbotService.responder("Olá");
        server.verify();

        assertTrue(resp.answer().toLowerCase().contains("falha ao interpretar")
                || resp.answer().toLowerCase().contains("erro ao chamar a api gemini"));
    }

    @Test
    void responder_tooManyRequests_returnsSpecificMessage() {
        Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

        RestClient restClient = builder.build();
        chatbotService = new ChatbotService(restClient);
        ReflectionTestUtils.setField(chatbotService, "apiKey", "dummy");

        server.expect(requestTo("/models/gemini-2.5-flash:generateContent?key=dummy"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withStatus(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS));

        ChatResponseDTO resp = chatbotService.responder("Olá");
        server.verify();

        assertTrue(resp.answer().contains("limite gratuito"));
    }

    @Test
    void responder_unauthorized_returnsSpecificMessage() {
        Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

        RestClient restClient = builder.build();
        chatbotService = new ChatbotService(restClient);
        ReflectionTestUtils.setField(chatbotService, "apiKey", "dummy");

        server.expect(requestTo("/models/gemini-2.5-flash:generateContent?key=dummy"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withStatus(org.springframework.http.HttpStatus.UNAUTHORIZED));

        ChatResponseDTO resp = chatbotService.responder("Olá");
        server.verify();

        assertTrue(resp.answer().contains("inválida ou expirada"));
    }

    @Test
    void responder_forbidden_returnsSpecificMessage() {
        Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

        RestClient restClient = builder.build();
        chatbotService = new ChatbotService(restClient);
        ReflectionTestUtils.setField(chatbotService, "apiKey", "dummy");

        server.expect(requestTo("/models/gemini-2.5-flash:generateContent?key=dummy"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withStatus(org.springframework.http.HttpStatus.FORBIDDEN));

        ChatResponseDTO resp = chatbotService.responder("Olá");
        server.verify();

        assertTrue(resp.answer().contains("não tem permissão"));
    }

    @Test
    void responder_tooManyRequests_returnsLimitMessage() {
        chatbotService = new ChatbotService(geminiRestClient) {
            @Override
            protected JsonNode callGemini(Map<String, Object> body) {
                throw new HttpClientErrorException(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS);
            }
        };
        ReflectionTestUtils.setField(chatbotService, "apiKey", "dummy");

        ChatResponseDTO resp = chatbotService.responder("Olá");
        assertTrue(resp.answer() != null && !resp.answer().isBlank());
    }

    @Test
    void responder_unauthorized_returnsKeyInvalidMessage() {
        chatbotService = new ChatbotService(geminiRestClient) {
            @Override
            protected JsonNode callGemini(Map<String, Object> body) {
                throw new HttpClientErrorException(org.springframework.http.HttpStatus.UNAUTHORIZED);
            }
        };
        ReflectionTestUtils.setField(chatbotService, "apiKey", "dummy");

        ChatResponseDTO resp = chatbotService.responder("Olá");
        assertTrue(resp.answer() != null && !resp.answer().isBlank());
    }

    @Test
    void responder_forbidden_returnsPermissionMessage() {
        chatbotService = new ChatbotService(geminiRestClient) {
            @Override
            protected JsonNode callGemini(Map<String, Object> body) {
                throw new HttpClientErrorException(org.springframework.http.HttpStatus.FORBIDDEN);
            }
        };
        ReflectionTestUtils.setField(chatbotService, "apiKey", "dummy");

        ChatResponseDTO resp = chatbotService.responder("Olá");
        assertTrue(resp.answer() != null && !resp.answer().isBlank());
    }

    @Test
    void responder_genericHttpClientError_returnsFallbackIncluded() {
        chatbotService = new ChatbotService(geminiRestClient) {
            @Override
            protected JsonNode callGemini(Map<String, Object> body) {
                throw new HttpClientErrorException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        };
        ReflectionTestUtils.setField(chatbotService, "apiKey", "dummy");

        ChatResponseDTO resp = chatbotService.responder("pedido");
        assertTrue(resp.answer().contains("Usando resposta local"));
        assertTrue(resp.answer().toLowerCase().contains("pedido"));
    }

    @Test
    void responder_runtimeException_returnsDetailedErrorMessage() {
        chatbotService = new ChatbotService(geminiRestClient) {
            @Override
            protected JsonNode callGemini(Map<String, Object> body) {
                throw new RuntimeException("boom");
            }
        };
        ReflectionTestUtils.setField(chatbotService, "apiKey", "dummy");

        ChatResponseDTO resp = chatbotService.responder("Olá");
        assertTrue(resp.answer().toLowerCase().contains("erro ao chamar a api gemini"));
    }

    @Test
    void fallbackResponses_indirectly_viaHttpError() {
        chatbotService = new ChatbotService(geminiRestClient) {
            @Override
            protected JsonNode callGemini(Map<String, Object> body) {
                throw new HttpClientErrorException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        };
        ReflectionTestUtils.setField(chatbotService, "apiKey", "dummy");

        ChatResponseDTO r1 = chatbotService.responder("estoque");
        assertTrue(r1.answer().toLowerCase().contains("estoque"));

        ChatResponseDTO r2 = chatbotService.responder("pedido");
        assertTrue(r2.answer().toLowerCase().contains("pedido"));

        ChatResponseDTO r3 = chatbotService.responder("pagar");
        assertTrue(r3.answer().toLowerCase().contains("pagamento") || r3.answer().toLowerCase().contains("pagar"));

        ChatResponseDTO r3b = chatbotService.responder("pagamento");
        assertTrue(r3b.answer().toLowerCase().contains("pagamento"));

        ChatResponseDTO r4 = chatbotService.responder("cancelar");
        assertTrue(r4.answer().toLowerCase().contains("cancelamento") || r4.answer().toLowerCase().contains("cancel"));

        ChatResponseDTO r4b = chatbotService.responder("cancelamento");
        assertTrue(r4b.answer().toLowerCase().contains("cancelamento"));

        ChatResponseDTO r5 = chatbotService.responder("risco");
        assertTrue(r5.answer().toLowerCase().contains("risco"));

        ChatResponseDTO r6 = chatbotService.responder("cliente");
        assertTrue(r6.answer().toLowerCase().contains("cliente"));

        ChatResponseDTO r7 = chatbotService.responder("produto");
        assertTrue(r7.answer().toLowerCase().contains("produto"));

        ChatResponseDTO r8 = chatbotService.responder("qualquer coisa");
        assertTrue(r8.answer().toLowerCase().contains("sou o assistente") || r8.answer().toLowerCase().contains("posso ajudar"));
    }

    @Test
    void responderFallback_nullMensagem_usesDefaultAnswer() {
        String resposta = ReflectionTestUtils.invokeMethod(chatbotService, "responderFallback", (Object) null);

        assertNotNull(resposta);
        assertTrue(resposta.toLowerCase().contains("assistente da loja"));
    }
}
