package com.setupsworks.meno.modules.tenancy.repository;

import java.util.List;

import com.setupsworks.meno.modules.tenancy.domain.State;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StateRepository extends JpaRepository<State, String> {

    List<State> findAllByOrderBySortOrderAsc();
}
