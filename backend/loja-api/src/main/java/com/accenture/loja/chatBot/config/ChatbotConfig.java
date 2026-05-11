package com.accenture.loja.chatBot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class ChatbotConfig {

    @Bean
    public RestClient geminiRestClient() {
        return RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
    }
}