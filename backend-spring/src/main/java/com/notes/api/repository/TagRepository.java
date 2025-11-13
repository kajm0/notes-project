package com.notes.api.repository;

import com.notes.api.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {
    
    Optional<Tag> findByLabel(String label);
    
    boolean existsByLabel(String label);
}


