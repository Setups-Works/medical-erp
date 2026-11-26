package com.setupsworks.meno;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class MenoApplication {

    public static void main(String[] args) {
        SpringApplication.run(MenoApplication.class, args);
    }
}
