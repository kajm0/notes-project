package com.notes.api.repository;

import com.notes.api.entity.Note;
import com.notes.api.entity.PublicLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PublicLinkRepository extends JpaRepository<PublicLink, UUID> {
    
    Optional<PublicLink> findByUrlToken(String urlToken);
    
    List<PublicLink> findByNote(Note note);
    
    Optional<PublicLink> findByNoteId(UUID noteId);
}


