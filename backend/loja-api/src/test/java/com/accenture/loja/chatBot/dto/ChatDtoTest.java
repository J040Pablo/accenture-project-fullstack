package com.accenture.loja.chatBot.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ChatDtoTest {

    @Test
    void chatRequestDto_getter() {
        ChatRequestDTO req = new ChatRequestDTO("hello");
        assertEquals("hello", req.message());
    }

    @Test
    void chatResponseDto_getter() {
        ChatResponseDTO res = new ChatResponseDTO("resp");
        assertEquals("resp", res.answer());
    }
}
