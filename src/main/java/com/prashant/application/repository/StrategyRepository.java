package com.prashant.application.repository;

import com.prashant.application.entity.SavedStrategy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StrategyRepository extends JpaRepository<SavedStrategy, String> {
    List<SavedStrategy> findAllByOrderBySavedAtDesc();
}
