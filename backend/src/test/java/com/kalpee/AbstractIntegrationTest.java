package com.kalpee;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    private static final Logger log = LoggerFactory.getLogger(AbstractIntegrationTest.class);
    static final PostgreSQLContainer<?> POSTGRES;
    static final boolean USE_TESTCONTAINERS;

    static {
        PostgreSQLContainer<?> container = null;
        boolean started = false;
        try {
            container = new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("kalpee_test")
                    .withUsername("kalpee")
                    .withPassword("kalpee_secret");
            container.start();
            started = true;
            log.info("Testcontainers PostgreSQL démarré sur {}", container.getJdbcUrl());
        } catch (Throwable t) {
            log.warn("Testcontainers indisponible ({}), bascule sur H2 en mode compatibilité PostgreSQL.", t.getMessage());
        }
        POSTGRES = container;
        USE_TESTCONTAINERS = started;
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (USE_TESTCONTAINERS && POSTGRES != null) {
            registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
            registry.add("spring.datasource.username", POSTGRES::getUsername);
            registry.add("spring.datasource.password", POSTGRES::getPassword);
            registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        } else {
            registry.add("spring.datasource.url",
                    () -> "jdbc:h2:mem:kalpee_test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1");
            registry.add("spring.datasource.username", () -> "sa");
            registry.add("spring.datasource.password", () -> "");
            registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
        }
    }
}
