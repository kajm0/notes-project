package com.notes.api.service;

import com.notes.api.dto.note.NoteRequest;
import com.notes.api.dto.note.NoteResponse;
import com.notes.api.entity.Note;
import com.notes.api.entity.Tag;
import com.notes.api.entity.User;
import com.notes.api.exception.BadRequestException;
import com.notes.api.exception.ForbiddenException;
import com.notes.api.exception.ResourceNotFoundException;
import com.notes.api.repository.NoteRepository;
import com.notes.api.repository.ShareRepository;
import com.notes.api.repository.TagRepository;
import com.notes.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final ShareRepository shareRepository;

    /**
     * Search and filter notes accessible by the user.
     * 
     * Returns:
     * - All PRIVATE notes owned by the user
     * - All SHARED notes owned by the user OR shared with the user
     * - All PUBLIC notes owned by the user
     * 
     * Applies filters for query (title/content), tags, and visibility.
     */
    @Transactional(readOnly = true)
    public Page<NoteResponse> searchNotes(UUID userId, String query, String tag, String visibility, Pageable pageable) {
        User user = getUserById(userId);
        
        final Note.Visibility visibilityEnum;
        if (visibility != null && !visibility.isEmpty()) {
            visibilityEnum = Note.Visibility.valueOf(visibility.toUpperCase());
        } else {
            visibilityEnum = null;
        }

        final String searchQuery = query;

        Page<Note> ownedNotes;
        if (tag != null && !tag.isEmpty()) {
            ownedNotes = noteRepository.findByOwnerAndTag(user, tag, pageable);
        } else {
            ownedNotes = noteRepository.searchNotes(user, searchQuery, visibilityEnum, pageable);
        }

        List<Note> sharedNotes = shareRepository.findBySharedWithUser(user).stream()
                .map(share -> share.getNote())
                .filter(note -> note.getVisibility() == Note.Visibility.SHARED)
                .filter(note -> filterNote(note, searchQuery, visibilityEnum))
                .filter(note -> filterByTag(note, tag))
                .collect(Collectors.toList());

        // Add public notes from other users
        Page<Note> publicNotes = noteRepository.findPublicNotes(user, searchQuery, pageable);
        List<Note> publicNotesList = publicNotes.getContent().stream()
                .filter(note -> filterNote(note, searchQuery, visibilityEnum))
                .filter(note -> filterByTag(note, tag))
                .collect(Collectors.toList());

        // Combine all notes
        Set<UUID> noteIds = new HashSet<>();
        List<Note> allNotesList = new ArrayList<>();
        
        // Add owned notes
        for (Note note : ownedNotes.getContent()) {
            if (noteIds.add(note.getId())) {
                allNotesList.add(note);
            }
        }
        
        // Add shared notes (avoid duplicates)
        for (Note note : sharedNotes) {
            if (noteIds.add(note.getId())) {
                allNotesList.add(note);
            }
        }
        
        // Add public notes (avoid duplicates)
        for (Note note : publicNotesList) {
            if (noteIds.add(note.getId())) {
                allNotesList.add(note);
            }
        }

        List<NoteResponse> responses = allNotesList.stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, responses.size());
    }

    @Transactional(readOnly = true)
    public NoteResponse getNoteById(UUID userId, UUID noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (!canAccessNote(userId, note)) {
            throw new ForbiddenException("You don't have permission to access this note");
        }

        return mapToResponse(note);
    }

    @Transactional
    public NoteResponse createNote(UUID userId, NoteRequest request) {
        User user = getUserById(userId);

        // La visibilité SHARED ne peut pas être définie manuellement
        // Elle est automatiquement définie lors du partage avec un utilisateur
        if (request.getVisibility() == Note.Visibility.SHARED) {
            throw new BadRequestException("La visibilité 'Partagée' ne peut pas être définie manuellement. Utilisez la fonctionnalité de partage pour partager une note avec des utilisateurs.");
        }

        Note note = Note.builder()
                .owner(user)
                .title(request.getTitle())
                .contentMd(request.getContentMd())
                .visibility(request.getVisibility())
                .tags(new HashSet<>())
                .build();

        if (request.getTags() != null) {
            Set<Tag> tags = request.getTags().stream()
                    .map(this::findOrCreateTag)
                    .collect(Collectors.toSet());
            note.setTags(tags);
        }

        note = noteRepository.save(note);
        return mapToResponse(note);
    }

    @Transactional
    public NoteResponse updateNote(UUID userId, UUID noteId, NoteRequest request) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (!note.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("You can only update your own notes");
        }

        // La visibilité SHARED ne peut pas être définie manuellement
        // Elle est automatiquement définie lors du partage avec un utilisateur
        if (request.getVisibility() == Note.Visibility.SHARED) {
            throw new BadRequestException("La visibilité 'Partagée' ne peut pas être définie manuellement. Utilisez la fonctionnalité de partage pour partager une note avec des utilisateurs.");
        }

        note.setTitle(request.getTitle());
        note.setContentMd(request.getContentMd());
        
        // Si la note était SHARED et qu'on la met en PRIVATE, supprimer automatiquement tous les partages
        if (note.getVisibility() == Note.Visibility.SHARED && request.getVisibility() == Note.Visibility.PRIVATE) {
            // Supprimer tous les partages actifs
            var activeShares = shareRepository.findByNote(note);
            if (!activeShares.isEmpty()) {
                shareRepository.deleteAll(activeShares);
            }
            note.setVisibility(Note.Visibility.PRIVATE);
        } else {
            note.setVisibility(request.getVisibility());
        }

        if (request.getTags() != null) {
            Set<Tag> tags = request.getTags().stream()
                    .map(this::findOrCreateTag)
                    .collect(Collectors.toSet());
            note.setTags(tags);
        }

        note = noteRepository.save(note);
        return mapToResponse(note);
    }

    @Transactional
    public void deleteNote(UUID userId, UUID noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (!note.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own notes");
        }

        noteRepository.delete(note);
    }

    /**
     * Check if a note matches the given filters.
     */
    private boolean filterNote(Note note, String query, Note.Visibility visibility) {
        if (query != null && !query.isEmpty()) {
            boolean matchesQuery = note.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                                   note.getContentMd().toLowerCase().contains(query.toLowerCase());
            if (!matchesQuery) return false;
        }
        if (visibility != null) {
            return note.getVisibility() == visibility;
        }
        return true;
    }

    /**
     * Check if a note has the specified tag.
     * If tag is null or empty, returns true (no filtering).
     */
    private boolean filterByTag(Note note, String tag) {
        if (tag == null || tag.isEmpty()) {
            return true; // No tag filter applied
        }
        return note.getTags().stream()
                .anyMatch(t -> t.getLabel().equalsIgnoreCase(tag));
    }

    /**
     * Check if a user can access a specific note.
     * 
     * Access rules:
     * - PRIVATE: Only owner can access
     * - SHARED: Owner and users with share permission can access
     * - PUBLIC: Only accessible via public link (/p/{token})
     */
    private boolean canAccessNote(UUID userId, Note note) {
        if (note.getOwner().getId().equals(userId)) {
            return true;
        }
        if (note.getVisibility() == Note.Visibility.PUBLIC) {
            return true;
        }
        if (note.getVisibility() == Note.Visibility.SHARED) {
            return noteRepository.isNoteSharedWithUser(note.getId(), userId);
        }
        return false;
    }

    private User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Tag findOrCreateTag(String label) {
        return tagRepository.findByLabel(label)
                .orElseGet(() -> tagRepository.save(Tag.builder().label(label).build()));
    }

    private NoteResponse mapToResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId().toString())
                .ownerId(note.getOwner().getId().toString())
                .title(note.getTitle())
                .contentMd(note.getContentMd())
                .visibility(note.getVisibility())
                .tags(note.getTags().stream().map(Tag::getLabel).collect(Collectors.toSet()))
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
