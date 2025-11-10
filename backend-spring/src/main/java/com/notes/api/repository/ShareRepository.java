package com.notes.api.repository;

import com.notes.api.entity.Note;
import com.notes.api.entity.Share;
import com.notes.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShareRepository extends JpaRepository<Share, UUID> {
    
    List<Share> findByNote(Note note);
    
    List<Share> findBySharedWithUser(User user);
    
    Optional<Share> findByNoteAndSharedWithUser(Note note, User user);
    
    boolean existsByNoteAndSharedWithUser(Note note, User user);
}

