package com.accenture.loja.chatBot.controller;

import com.accenture.loja.chatBot.dto.ChatRequestDTO;
import com.accenture.loja.chatBot.dto.ChatResponseDTO;
import com.accenture.loja.chatBot.service.ChatbotService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ChatbotControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ChatbotService chatbotService;

    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        ChatbotController controller = new ChatbotController(chatbotService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void postValidMessageReturns200AndAnswer() throws Exception {
        when(chatbotService.responder(anyString())).thenReturn(new ChatResponseDTO("ok"));

        ChatRequestDTO request = new ChatRequestDTO("Olá");

        mockMvc.perform(post("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("ok"));
    }

    @Test
    void postEmptyMessageReturns400() throws Exception {
        ChatRequestDTO request = new ChatRequestDTO("");

        mockMvc.perform(post("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void postMissingMessageFieldReturns400() throws Exception {
        // send JSON without message field
        String json = "{}";

        mockMvc.perform(post("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }
}
