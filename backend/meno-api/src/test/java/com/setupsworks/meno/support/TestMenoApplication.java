package com.setupsworks.meno.support;

import com.setupsworks.meno.MenoApplication;

import org.springframework.boot.SpringApplication;

/** Runs the app against a throw-away PostgreSQL container: {@code ./mvnw spring-boot:test-run}. */
public class TestMenoApplication {

    public static void main(String[] args) {
        SpringApplication.from(MenoApplication::main).with(TestcontainersConfiguration.class).run(args);
    }
}
