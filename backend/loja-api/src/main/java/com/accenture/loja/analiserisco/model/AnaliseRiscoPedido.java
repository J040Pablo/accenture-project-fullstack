package com.accenture.loja.analiserisco.model;

import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.shared.enums.NivelRisco;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "analises_risco_pedido")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnaliseRiscoPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NivelRisco nivelRisco;

    private String motivo;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime dataAnalise = LocalDateTime.now();
}