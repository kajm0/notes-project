package com.notes.api.repository;

import com.notes.api.entity.Note;
import com.notes.api.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {
    
    Page<Note> findByOwner(User owner, Pageable pageable);
    
    @Query("SELECT n FROM Note n WHERE n.owner = :owner AND " +
           "(:query IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(n.contentMd) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:visibility IS NULL OR n.visibility = :visibility)")
    Page<Note> searchNotes(
        @Param("owner") User owner,
        @Param("query") String query,
        @Param("visibility") Note.Visibility visibility,
        Pageable pageable
    );
    
    @Query("SELECT n FROM Note n JOIN n.tags t WHERE n.owner = :owner AND t.label = :tagLabel")
    Page<Note> findByOwnerAndTag(
        @Param("owner") User owner,
        @Param("tagLabel") String tagLabel,
        Pageable pageable
    );
    
    Optional<Note> findByIdAndOwner(UUID id, User owner);
    
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
           "FROM Share s WHERE s.note.id = :noteId AND s.sharedWithUser.id = :userId")
    boolean isNoteSharedWithUser(@Param("noteId") UUID noteId, @Param("userId") UUID userId);
}

