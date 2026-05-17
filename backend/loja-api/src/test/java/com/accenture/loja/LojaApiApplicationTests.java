package com.accenture.loja;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@SpringBootTest
class LojaApiApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void mainDeveSubirSemLancarExcecao() {
		String propriedadeAnterior = System.getProperty("spring.main.web-application-type");
		System.setProperty("spring.main.web-application-type", "none");
		try {
			assertDoesNotThrow(() -> LojaApiApplication.main(new String[]{}));
		} finally {
			if (propriedadeAnterior == null) {
				System.clearProperty("spring.main.web-application-type");
			} else {
				System.setProperty("spring.main.web-application-type", propriedadeAnterior);
			}
		}
	}

}
