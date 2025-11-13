package com.notes.api.controller;

import com.notes.api.dto.note.NoteResponse;
import com.notes.api.entity.Note;
import com.notes.api.entity.Tag;
import com.notes.api.service.ShareService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/p")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Public", description = "Public note access endpoints")
public class PublicController {

    private final ShareService shareService;

    @GetMapping("/{token}")
    @Operation(summary = "Get note by public token")
    public ResponseEntity<NoteResponse> getPublicNote(@PathVariable String token) {
        Note note = shareService.getNoteByPublicToken(token);
        
        NoteResponse response = NoteResponse.builder()
                .id(note.getId().toString())
                .ownerId(note.getOwner().getId().toString())
                .title(note.getTitle())
                .contentMd(note.getContentMd())
                .visibility(note.getVisibility())
                .tags(note.getTags().stream().map(Tag::getLabel).collect(Collectors.toSet()))
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
        
        return ResponseEntity.ok(response);
    }
}

