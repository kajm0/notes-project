package com.notes.api.controller;

import com.notes.api.dto.note.NoteRequest;
import com.notes.api.dto.note.NoteResponse;
import com.notes.api.security.UserPrincipal;
import com.notes.api.service.NoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
@Tag(name = "Notes", description = "Note management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    @Operation(summary = "Get all notes with search and filters")
    public ResponseEntity<Page<NoteResponse>> getNotes(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String visibility,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<NoteResponse> notes = noteService.searchNotes(
                currentUser.getId(), query, tag, visibility, pageable
        );
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get note by ID")
    public ResponseEntity<NoteResponse> getNoteById(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(noteService.getNoteById(currentUser.getId(), id));
    }

    @PostMapping
    @Operation(summary = "Create a new note")
    public ResponseEntity<NoteResponse> createNote(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody NoteRequest request
    ) {
        return ResponseEntity.ok(noteService.createNote(currentUser.getId(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing note")
    public ResponseEntity<NoteResponse> updateNote(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody NoteRequest request
    ) {
        return ResponseEntity.ok(noteService.updateNote(currentUser.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a note")
    public ResponseEntity<Void> deleteNote(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id
    ) {
        noteService.deleteNote(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
}

