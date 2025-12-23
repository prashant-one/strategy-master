package com.prashant.application.repository;

import com.prashant.application.entity.StrategyRunResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StrategyRunResultRepository extends JpaRepository<StrategyRunResult, Long> {
    Page<StrategyRunResult> findAll(Pageable pageable);
}
