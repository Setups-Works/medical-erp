package com.setupsworks.meno.security;

import javax.sql.DataSource;

import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Wraps the application DataSource so every connection carries the tenant (defence in depth, MULTI_TENANCY.md). */
@Configuration(proxyBeanMethods = false)
class TenantDataSourceConfig {

    @Bean
    static BeanPostProcessor tenantAwareDataSourcePostProcessor() {
        return new BeanPostProcessor() {
            @Override
            public Object postProcessAfterInitialization(Object bean, String beanName) {
                if (bean instanceof DataSource ds && "dataSource".equals(beanName)
                        && !(bean instanceof TenantAwareDataSource)) {
                    return new TenantAwareDataSource(ds);
                }
                return bean;
            }
        };
    }
}
