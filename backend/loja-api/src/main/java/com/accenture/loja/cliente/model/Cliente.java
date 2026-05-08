package com.accenture.loja.cliente.model;

import com.accenture.loja.conta.model.ContaCorrente;
import com.accenture.loja.endereco.model.Endereco;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String nome;

	@Column(unique = true)
	private String cpf;

	@Column(unique = true)
	private String email;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "endereco_id")
	private Endereco endereco;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "conta_corrente_id")
	private ContaCorrente contaCorrente;
}