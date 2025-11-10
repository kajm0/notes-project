package com.notes.api.service;

import com.notes.api.dto.note.NoteRequest;
import com.notes.api.dto.note.NoteResponse;
import com.notes.api.entity.Note;
import com.notes.api.entity.Tag;
import com.notes.api.entity.User;
import com.notes.api.exception.ForbiddenException;
import com.notes.api.exception.ResourceNotFoundException;
import com.notes.api.repository.NoteRepository;
import com.notes.api.repository.TagRepository;
import com.notes.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    @Transactional(readOnly = true)
    public Page<NoteResponse> searchNotes(UUID userId, String query, String tag, String visibility, Pageable pageable) {
        User user = getUserById(userId);
        
        Note.Visibility visibilityEnum = null;
        if (visibility != null && !visibility.isEmpty()) {
            visibilityEnum = Note.Visibility.valueOf(visibility.toUpperCase());
        }

        Page<Note> notes;
        if (tag != null && !tag.isEmpty()) {
            notes = noteRepository.findByOwnerAndTag(user, tag, pageable);
        } else {
            notes = noteRepository.searchNotes(user, query, visibilityEnum, pageable);
        }

        return notes.map(this::mapToResponse);
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
            throw new ForbiddenException("You don't have permission to update this note");
        }

        note.setTitle(request.getTitle());
        note.setContentMd(request.getContentMd());
        note.setVisibility(request.getVisibility());

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
            throw new ForbiddenException("You don't have permission to delete this note");
        }

        noteRepository.delete(note);
    }

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

