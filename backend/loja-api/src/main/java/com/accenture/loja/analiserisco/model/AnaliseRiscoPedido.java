package com.accenture.loja.analiserisco.model;

import com.accenture.loja.pedido.model.Pedido;
import com.accenture.loja.shared.enums.NivelRisco;
import com.accenture.loja.shared.enums.StatusPedido;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Column
    private Long clienteId;

    @Column
    private String clienteNome;

    @Column(precision = 19, scale = 2)
    private BigDecimal valorTotal;

    @Column(precision = 19, scale = 2)
    private BigDecimal saldoCliente;

    @Enumerated(EnumType.STRING)
    @Column
    private StatusPedido statusPedido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NivelRisco nivelRisco;

    @Column(nullable = false)
    private Integer score;

    @ElementCollection
    @CollectionTable(name = "analises_risco_pedido_motivos", joinColumns = @JoinColumn(name = "analise_risco_pedido_id"))
    @Column(name = "motivo")
    @Builder.Default
    private List<String> motivos = new ArrayList<>();

    private String motivo;

    private String recomendacao;

    @Column(nullable = false)
    private Boolean aprovado;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime dataAnalise = LocalDateTime.now();
}