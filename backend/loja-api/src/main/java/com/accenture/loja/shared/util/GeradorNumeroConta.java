package com.accenture.loja.shared.util;

import java.util.Random;

public class GeradorNumeroConta {

	private static final Random RANDOM = new Random();

	public GeradorNumeroConta() {
	}

	public static String gerarNumeroConta() {
		return String.valueOf(10000 + RANDOM.nextInt(90000));
	}

}
