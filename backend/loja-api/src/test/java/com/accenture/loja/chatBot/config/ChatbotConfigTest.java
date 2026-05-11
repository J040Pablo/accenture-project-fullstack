package com.accenture.loja.chatBot.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class ChatbotConfigTest {

    @Test
    void geminiRestClient_notNull() {
        ChatbotConfig cfg = new ChatbotConfig();
        assertNotNull(cfg.geminiRestClient());
    }
}
