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

/**
 * REST Controller for Note management operations.
 * 
 * Handles CRUD operations, search, filtering, and retrieval of notes.
 * All endpoints require JWT authentication except public note access.
 * 
 * Returns notes based on ownership and sharing:
 * - PRIVATE: Only accessible by owner
 * - SHARED: Accessible by owner and users with whom it's shared
 * - PUBLIC: Accessible by anyone with the public link
 */
@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
@Tag(name = "Notes", description = "Note management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class NoteController {

    private final NoteService noteService;

    /**
     * Get all notes accessible by the current user.
     * 
     * Includes:
     * - Notes owned by the user
     * - Notes shared with the user (SHARED visibility)
     * 
     * Supports search by title/content and filtering by visibility and tags.
     * Results are paginated and sorted by last update date (descending).
     */
    @GetMapping
    @Operation(summary = "Get all notes with search and filters", 
               description = "Returns notes owned by user and notes shared with user")
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

    /**
     * Get a specific note by ID.
     * 
     * Access rules:
     * - Owner can always access
     * - If SHARED: users with whom the note is shared can access
     * - PUBLIC notes are accessible via /p/{token} endpoint instead
     * 
     * @throws ResourceNotFoundException if note doesn't exist
     * @throws ForbiddenException if user doesn't have access
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get note by ID", description = "Access based on ownership and sharing permissions")
    public ResponseEntity<NoteResponse> getNoteById(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(noteService.getNoteById(currentUser.getId(), id));
    }

    /**
     * Create a new note.
     * 
     * Tags are automatically created if they don't exist.
     * Default visibility is PRIVATE.
     */
    @PostMapping
    @Operation(summary = "Create a new note", description = "Creates a note owned by the current user")
    public ResponseEntity<NoteResponse> createNote(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody NoteRequest request
    ) {
        return ResponseEntity.ok(noteService.createNote(currentUser.getId(), request));
    }

    /**
     * Update an existing note.
     * 
     * Only the owner can update their notes.
     * 
     * @throws ResourceNotFoundException if note doesn't exist
     * @throws ForbiddenException if user is not the owner
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing note", description = "Only owner can update")
    public ResponseEntity<NoteResponse> updateNote(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody NoteRequest request
    ) {
        return ResponseEntity.ok(noteService.updateNote(currentUser.getId(), id, request));
    }

    /**
     * Delete a note permanently.
     * 
     * Only the owner can delete their notes.
     * All shares and public links are automatically deleted.
     * 
     * @throws ResourceNotFoundException if note doesn't exist
     * @throws ForbiddenException if user is not the owner
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a note", description = "Only owner can delete, cascades to shares")
    public ResponseEntity<Void> deleteNote(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID id
    ) {
        noteService.deleteNote(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
}


