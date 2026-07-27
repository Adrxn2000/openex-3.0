package com.openex

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class OpenExApplicationTests {

    @Test
    fun contextLoads() {
        // If this passes, Spring Boot started cleanly with the DB connection,
        // Flyway migrations, and security config all wired up correctly.
    }
}
