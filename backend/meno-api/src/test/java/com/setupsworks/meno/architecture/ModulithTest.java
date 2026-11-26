package com.setupsworks.meno.architecture;

import com.setupsworks.meno.MenoApplication;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/** Fails the build if a module reaches into another module's internals or modules form a cycle. */
class ModulithTest {

    @Test
    void modulesRespectBoundaries() {
        ApplicationModules.of(MenoApplication.class).verify();
    }
}
