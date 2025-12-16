package com.prashant.application.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class SavedStrategy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    @Lob
    @Column(length = 100000)
    private String strategyJson;

    private LocalDateTime savedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStrategyJson() {
        return strategyJson;
    }

    public void setStrategyJson(String strategyJson) {
        this.strategyJson = strategyJson;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}
