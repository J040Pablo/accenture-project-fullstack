package com.accenture.loja.chatBot.controller;

import com.accenture.loja.chatBot.dto.ChatRequestDTO;
import com.accenture.loja.chatBot.dto.ChatResponseDTO;
import com.accenture.loja.chatBot.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public ResponseEntity<ChatResponseDTO> conversar(@Valid @RequestBody ChatRequestDTO request) {
        ChatResponseDTO response = chatbotService.responder(request.message());
        return ResponseEntity.ok(response);
    }
}